package ai.samadhan.api.media;

import static org.junit.jupiter.api.Assertions.assertArrayEquals;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

import java.nio.file.Files;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.web.server.ResponseStatusException;

class LocalImageStorageServiceTest {
    @TempDir
    java.nio.file.Path temporaryDirectory;

    @Test
    void storesAndRetrievesSupportedImagesUsingGeneratedNames() throws Exception {
        LocalImageStorageService storage = new LocalImageStorageService(temporaryDirectory.toString());
        byte[] png = new byte[] {
                (byte) 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00
        };

        String url = storage.store(png, "image/png");
        String fileName = url.substring("/api/images/".length());

        assertEquals("image/png", storage.contentTypeFor(fileName));
        assertArrayEquals(png, Files.readAllBytes(storage.find(fileName)));
    }

    @Test
    void rejectsContentThatDoesNotMatchAnImageSignature() {
        LocalImageStorageService storage = new LocalImageStorageService(temporaryDirectory.toString());
        assertThrows(ResponseStatusException.class,
                () -> storage.store("not an image".getBytes(), "image/png"));
    }

    @Test
    void doesNotAllowUnrecognizedOrPathTraversalNames() {
        LocalImageStorageService storage = new LocalImageStorageService(temporaryDirectory.toString());
        assertThrows(ResponseStatusException.class, () -> storage.find("../../secret.png"));
    }
}
