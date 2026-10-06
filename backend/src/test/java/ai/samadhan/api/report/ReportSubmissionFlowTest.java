package ai.samadhan.api.report;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.nio.file.Path;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class ReportSubmissionFlowTest {
    private static Path uploadDirectory;

    @TempDir
    static Path temporaryDirectory;

    @Autowired
    MockMvc mockMvc;

    @Autowired
    ObjectMapper objectMapper;

    @Autowired
    ReportRepository reportRepository;

    @DynamicPropertySource
    static void configureUploadDirectory(DynamicPropertyRegistry registry) {
        uploadDirectory = temporaryDirectory.resolve("uploads");
        registry.add("app.images.upload-dir", () -> uploadDirectory.toString());
    }

    @BeforeEach
    void clearReports() {
        reportRepository.deleteAll();
    }

    @Test
    void uploadsImageAndCreatesReportWhenGeminiIsUnavailable() throws Exception {
        byte[] png = new byte[] {
                (byte) 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00
        };
        MockMultipartFile image = new MockMultipartFile("file", "pothole.png", "image/png", png);

        MvcResult uploadResult = mockMvc.perform(multipart("/api/images").file(image))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.imageUrl").isString())
                .andReturn();
        String imageUrl = objectMapper.readTree(uploadResult.getResponse().getContentAsString())
                .path("imageUrl").asText();

        mockMvc.perform(get(imageUrl))
                .andExpect(status().isOk())
                .andExpect(org.springframework.test.web.servlet.result.MockMvcResultMatchers.content()
                        .contentType(MediaType.IMAGE_PNG));

        mockMvc.perform(post("/api/ai/analyze-issue")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"image\":\"data:image/png;base64,iVBORw0KGgoA\"}"))
                .andExpect(status().isServiceUnavailable())
                .andExpect(jsonPath("$.error").value("Gemini API key is not configured"));

        String report = objectMapper.writeValueAsString(new ReportDtos.CreateRequest(
                "Community Issue - Needs Review",
                "Medium",
                "Medium",
                0,
                "Automated analysis was unavailable; please verify this report manually.",
                "Municipal Corporation",
                imageUrl,
                "pothole.png",
                23.2599,
                77.4126,
                "Bhopal",
                "Anonymous Citizen"));

        mockMvc.perform(post("/api/reports")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(report))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").isNotEmpty())
                .andExpect(jsonPath("$.imageUrl").value(imageUrl))
                .andExpect(jsonPath("$.status").value("Reported"));

        mockMvc.perform(get("/api/reports"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].category").value("Community Issue - Needs Review"));
    }
}
