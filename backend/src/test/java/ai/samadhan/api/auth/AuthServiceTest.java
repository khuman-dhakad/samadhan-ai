package ai.samadhan.api.auth;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import ai.samadhan.api.config.JwtService;
import ai.samadhan.api.user.AppUser;
import ai.samadhan.api.user.Role;
import ai.samadhan.api.user.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

class AuthServiceTest {
    @Test
    void publicRegistrationAlwaysCreatesARegularUser() {
        UserRepository users = mock(UserRepository.class);
        JwtService jwtService = mock(JwtService.class);
        BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
        when(users.existsByEmailIgnoreCase("admin@example.com")).thenReturn(false);
        when(users.save(any(AppUser.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(jwtService.issueToken(any(AppUser.class))).thenReturn("signed-jwt");
        AuthService service = new AuthService(users, passwordEncoder, jwtService);

        AuthDtos.AuthResponse result = service.register(
                new AuthDtos.Registration("Admin", "admin@example.com", "securePassword123"));

        assertEquals("signed-jwt", result.token());
        assertEquals("USER", result.user().role());
        org.mockito.ArgumentCaptor<AppUser> savedUser = org.mockito.ArgumentCaptor.forClass(AppUser.class);
        org.mockito.Mockito.verify(users).save(savedUser.capture());
        assertEquals(Role.USER, savedUser.getValue().getRole());
        assertTrue(passwordEncoder.matches("securePassword123", savedUser.getValue().getPasswordHash()));
    }
}
