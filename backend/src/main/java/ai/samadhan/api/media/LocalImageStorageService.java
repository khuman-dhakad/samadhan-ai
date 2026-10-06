package ai.samadhan.api.media;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class LocalImageStorageService {
    private final Path uploadDirectory;

    public LocalImageStorageService(@Value("${app.images.upload-dir:./uploads}") String uploadDirectory) {
        this.uploadDirectory = Path.of(uploadDirectory).toAbsolutePath().normalize();
    }

    public String store(byte[] content, String declaredContentType) throws IOException {
        String extension = imageExtension(content);
        if (extension == null || !compatibleContentType(declaredContentType, contentType(extension))) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "The uploaded file is not a supported image");
        }
        Files.createDirectories(uploadDirectory);
        String fileName = UUID.randomUUID() + "." + extension;
        Files.write(uploadDirectory.resolve(fileName), content);
        return "/api/images/" + fileName;
    }

    public Path find(String fileName) {
        if (fileName == null || !fileName.matches("[0-9a-fA-F-]{36}\\.(jpg|png|gif|webp|heic)")) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Image not found");
        }
        Path image = uploadDirectory.resolve(fileName).normalize();
        if (!image.getParent().equals(uploadDirectory) || !Files.isRegularFile(image)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Image not found");
        }
        return image;
    }

    public String contentTypeFor(String fileName) {
        String extension = fileName.substring(fileName.lastIndexOf('.') + 1);
        return contentType(extension);
    }

    private String imageExtension(byte[] bytes) {
        if (startsWith(bytes, 0xFF, 0xD8, 0xFF)) return "jpg";
        if (startsWith(bytes, 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A)) return "png";
        if (bytes.length >= 6
                && (new String(bytes, 0, 6, java.nio.charset.StandardCharsets.US_ASCII).equals("GIF87a")
                || new String(bytes, 0, 6, java.nio.charset.StandardCharsets.US_ASCII).equals("GIF89a"))) return "gif";
        if (bytes.length >= 12) {
            String signature = new String(bytes, 0, 4, java.nio.charset.StandardCharsets.US_ASCII);
            String brand = new String(bytes, 8, 4, java.nio.charset.StandardCharsets.US_ASCII);
            if (signature.equals("RIFF") && brand.equals("WEBP")) return "webp";
            if (signature.equals("ftyp")
                    && java.util.Set.of("heic", "heix", "hevc", "hevx", "mif1", "msf1").contains(brand)) return "heic";
        }
        return null;
    }

    private boolean startsWith(byte[] bytes, int... signature) {
        if (bytes.length < signature.length) return false;
        for (int index = 0; index < signature.length; index++) {
            if ((bytes[index] & 0xFF) != signature[index]) return false;
        }
        return true;
    }

    private boolean compatibleContentType(String declared, String detected) {
        return declared.equalsIgnoreCase(detected)
                || (declared.equalsIgnoreCase("image/jpg") && detected.equals("image/jpeg"))
                || (declared.equalsIgnoreCase("image/heif") && detected.equals("image/heic"));
    }

    private String contentType(String extension) {
        return switch (extension) {
            case "jpg" -> "image/jpeg";
            case "png" -> "image/png";
            case "gif" -> "image/gif";
            case "webp" -> "image/webp";
            case "heic" -> "image/heic";
            default -> throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Image not found");
        };
    }
}
