package ai.samadhan.api.media;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import java.io.IOException;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

@Service
public class CloudinaryService {
    private static final Logger LOGGER = LoggerFactory.getLogger(CloudinaryService.class);

    private final String cloudName;
    private final String apiKey;
    private final String apiSecret;
    private final LocalImageStorageService localImageStorage;

    public CloudinaryService(
            @Value("${app.cloudinary.cloud-name:}") String cloudName,
            @Value("${app.cloudinary.api-key:}") String apiKey,
            @Value("${app.cloudinary.api-secret:}") String apiSecret,
            LocalImageStorageService localImageStorage) {
        this.cloudName = cloudName;
        this.apiKey = apiKey;
        this.apiSecret = apiSecret;
        this.localImageStorage = localImageStorage;
    }

    public String upload(MultipartFile file) {
        if (file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Select an image to upload");
        }
        if (file.getSize() > 10 * 1024 * 1024) {
            throw new ResponseStatusException(HttpStatus.PAYLOAD_TOO_LARGE, "Image must be 10 MB or smaller");
        }
        String contentType = file.getContentType();
        if (contentType == null || !contentType.matches("image/(jpeg|png|webp|gif|heic|heif)")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Upload a JPEG, PNG, WEBP, GIF, or HEIC image");
        }
        if (cloudName.isBlank() || apiKey.isBlank() || apiSecret.isBlank()) {
            return storeLocally(file, contentType, "Cloudinary credentials are not configured");
        }
        try {
            Cloudinary cloudinary = new Cloudinary(Map.of(
                    "cloud_name", cloudName,
                    "api_key", apiKey,
                    "api_secret", apiSecret,
                    "secure", true));
            Map<?, ?> result = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap(
                    "resource_type", "image",
                    "folder", "samadhan-ai"));
            Object secureUrl = result.get("secure_url");
            if (!(secureUrl instanceof String url) || url.isBlank()) {
                return storeLocally(file, contentType, "Cloudinary did not return an image URL");
            }
            return url;
        } catch (IOException exception) {
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR, "Image could not be read for upload", exception);
        } catch (RuntimeException exception) {
            LOGGER.warn("Cloudinary upload failed; storing the validated image locally", exception);
            return storeLocally(file, contentType, "Cloudinary upload failed");
        }
    }

    private String storeLocally(MultipartFile file, String contentType, String reason) {
        LOGGER.info("{}; using the configured local image store", reason);
        try {
            return localImageStorage.store(file.getBytes(), contentType);
        } catch (IOException exception) {
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR, "Image could not be saved", exception);
        }
    }
}
