package ai.samadhan.api.auth;

import ai.samadhan.api.config.JwtService;
import ai.samadhan.api.user.AppUser;
import ai.samadhan.api.user.Role;
import ai.samadhan.api.user.UserRepository;
import java.util.Locale;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AuthService {
    private final UserRepository users;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    public AuthService(
            UserRepository users,
            PasswordEncoder passwordEncoder,
            JwtService jwtService) {
        this.users = users;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public AuthDtos.AuthResponse register(AuthDtos.Registration registration) {
        String email = registration.email().trim().toLowerCase(Locale.ROOT);
        validatePasswordBytes(registration.password());
        if (users.existsByEmailIgnoreCase(email)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "An account with this email already exists");
        }
        AppUser user = users.save(new AppUser(
                registration.displayName().trim(),
                email,
                passwordEncoder.encode(registration.password()),
                Role.USER));
        return response(user);
    }

    public AuthDtos.AuthResponse login(AuthDtos.Credentials credentials) {
        if (credentials.password().getBytes(java.nio.charset.StandardCharsets.UTF_8).length > 72) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password");
        }
        AppUser user = users.findByEmailIgnoreCase(credentials.email().trim())
                .filter(candidate -> passwordEncoder.matches(credentials.password(), candidate.getPasswordHash()))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password"));
        return response(user);
    }

    public AuthDtos.UserView currentUser(String email) {
        return users.findByEmailIgnoreCase(email)
                .map(AuthDtos.UserView::from)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Account no longer exists"));
    }

    private AuthDtos.AuthResponse response(AppUser user) {
        return new AuthDtos.AuthResponse(jwtService.issueToken(user), AuthDtos.UserView.from(user));
    }

    private void validatePasswordBytes(String password) {
        if (password.getBytes(java.nio.charset.StandardCharsets.UTF_8).length > 72) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Password must be no longer than 72 UTF-8 bytes");
        }
    }
}
