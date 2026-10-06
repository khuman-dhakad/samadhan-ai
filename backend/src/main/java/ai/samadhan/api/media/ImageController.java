package ai.samadhan.api.media;

import java.util.Map;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.CacheControl;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import java.nio.file.Path;
import java.time.Duration;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/images")
public class ImageController {
    private final CloudinaryService cloudinaryService;
    private final LocalImageStorageService localImageStorage;

    public ImageController(CloudinaryService cloudinaryService, LocalImageStorageService localImageStorage) {
        this.cloudinaryService = cloudinaryService;
        this.localImageStorage = localImageStorage;
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public Map<String, String> upload(@RequestParam("file") MultipartFile file) {
        return Map.of("imageUrl", cloudinaryService.upload(file));
    }

    @org.springframework.web.bind.annotation.GetMapping("/{fileName}")
    public ResponseEntity<Resource> get(@org.springframework.web.bind.annotation.PathVariable String fileName) {
        Path path = localImageStorage.find(fileName);
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(localImageStorage.contentTypeFor(fileName)))
                .cacheControl(CacheControl.maxAge(Duration.ofDays(30)).cachePublic())
                .header("X-Content-Type-Options", "nosniff")
                .body(new FileSystemResource(path));
    }
}
