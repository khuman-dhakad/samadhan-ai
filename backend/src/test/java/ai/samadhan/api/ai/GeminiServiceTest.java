package ai.samadhan.api.ai;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.method;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestClient;
import org.springframework.web.server.ResponseStatusException;

class GeminiServiceTest {
    @Test
    void analyzesImageAndNormalizesTheReturnedFields() {
        RestClient.Builder builder = RestClient.builder();
        MockRestServiceServer server = MockRestServiceServer.bindTo(builder).build();
        server.expect(requestTo(org.hamcrest.Matchers.containsString("generateContent")))
                .andExpect(method(HttpMethod.POST))
                .andRespond(withSuccess("""
                        {"candidates":[{"content":{"parts":[{"text":"{\\"category\\":\\"Pothole\\",\\"severity\\":\\"critical\\",\\"confidence\\":91,\\"risk\\":\\"Traffic hazard\\",\\"department\\":\\"Public Works\\",\\"priority\\":\\"urgent\\"}"}]}}]}
                        """, MediaType.APPLICATION_JSON));
        GeminiService service = new GeminiService(builder, new ObjectMapper(), "test-key", "gemini-test");

        var result = service.analyze("data:image/jpeg;base64,dGVzdA==");

        assertEquals("Pothole", result.get("category"));
        assertEquals("High", result.get("severity"));
        assertEquals("High", result.get("priority"));
        assertEquals(91, result.get("confidence"));
        server.verify();
    }

    @Test
    void reportsMissingApiKeyInsteadOfReturningAFalseAnalysis() {
        GeminiService service = new GeminiService(RestClient.builder(), new ObjectMapper(), "", "gemini-test");
        assertThrows(ResponseStatusException.class, () -> service.analyze("dGVzdA=="));
    }
}
