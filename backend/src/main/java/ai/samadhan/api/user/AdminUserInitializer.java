package ai.samadhan.api.user;

import java.nio.charset.StandardCharsets;
import java.util.Locale;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class AdminUserInitializer implements CommandLineRunner {
    private final UserRepository users;
    private final PasswordEncoder passwordEncoder;
    private final String email;
    private final String password;

    public AdminUserInitializer(
            UserRepository users,
            PasswordEncoder passwordEncoder,
            @Value("${app.admin.email:}") String email,
            @Value("${app.admin.password:}") String password) {
        this.users = users;
        this.passwordEncoder = passwordEncoder;
        this.email = email.trim().toLowerCase(Locale.ROOT);
        this.password = password;
    }

    @Override
    public void run(String... args) {
        if (email.isBlank()) return;
        var existingUser = users.findByEmailIgnoreCase(email);
        if (existingUser.isPresent()) {
            if (existingUser.get().getRole() != Role.ADMIN) {
                throw new IllegalStateException(
                        "Configured administrator email already belongs to a non-admin account");
            }
            return;
        }
        if (password.length() < 12
                || password.getBytes(StandardCharsets.UTF_8).length > 72) {
            throw new IllegalStateException(
                    "Set ADMIN_PASSWORD to a unique password between 12 and 72 UTF-8 bytes");
        }
        users.save(new AppUser(
                "Samadhan Administrator",
                email,
                passwordEncoder.encode(password),
                Role.ADMIN));
    }
}
