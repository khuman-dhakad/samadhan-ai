package ai.samadhan.api.auth;

import ai.samadhan.api.user.AppUser;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public final class AuthDtos {
    private AuthDtos() {}

    public record Credentials(
            @Email @NotBlank String email,
            @NotBlank @Size(min = 8, max = 72) String password) {}

    public record Registration(
            @NotBlank @Size(min = 2, max = 100) String displayName,
            @Email @NotBlank String email,
            @NotBlank @Size(min = 8, max = 72) String password) {}

    public record UserView(Long id, String email, String displayName, String role) {
        public static UserView from(AppUser user) {
            return new UserView(user.getId(), user.getEmail(), user.getDisplayName(), user.getRole().name());
        }
    }

    public record AuthResponse(String token, UserView user) {}
}
