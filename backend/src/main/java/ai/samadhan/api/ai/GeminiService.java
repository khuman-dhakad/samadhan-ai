package ai.samadhan.api.ai;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.Base64;
import java.util.List;
import java.util.Map;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.server.ResponseStatusException;

@Service
public class GeminiService {
    private static final String INSTRUCTIONS = """
            You are an expert civic infrastructure analyst. Analyze the attached community image.
            Return only JSON with keys category, severity, confidence, risk, department, priority.
            For a civic issue, severity and priority must be High, Medium, or Low.
            If the image is not a civic issue, use category Not a Community Issue, severity N/A,
            confidence 100, risk None, department None, priority None.
            """;

    private final RestClient restClient;
    private final ObjectMapper objectMapper;
    private final String apiKey;
    private final String model;

    public GeminiService(
            RestClient.Builder restClientBuilder,
            ObjectMapper objectMapper,
            @Value("${app.gemini.api-key:}") String apiKey,
            @Value("${app.gemini.model:gemini-2.5-flash}") String model) {
        this.restClient = restClientBuilder.build();
        this.objectMapper = objectMapper;
        this.apiKey = apiKey;
        this.model = model;
    }

    public Map<String, Object> analyze(String imageData) {
        if (apiKey.isBlank()) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Gemini API key is not configured");
        }
        if (imageData == null || imageData.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Image data is required");
        }

        String mimeType = "image/jpeg";
        String base64 = imageData;
        if (imageData.startsWith("data:")) {
            int separator = imageData.indexOf(',');
            if (separator < 0) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid image data URL");
            }
            String metadata = imageData.substring(5, separator);
            int mimeSeparator = metadata.indexOf(';');
            mimeType = mimeSeparator < 0 ? metadata : metadata.substring(0, mimeSeparator);
            base64 = imageData.substring(separator + 1);
        }

        try {
            byte[] decoded = Base64.getDecoder().decode(base64);
            if (decoded.length > 10 * 1024 * 1024) {
                throw new ResponseStatusException(HttpStatus.PAYLOAD_TOO_LARGE, "Image must be 10 MB or smaller");
            }
        } catch (IllegalArgumentException exception) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Image data must be valid base64");
        }

        Map<String, Object> requestBody = Map.of("contents", List.of(Map.of("parts", List.of(
                Map.of("text", INSTRUCTIONS),
                Map.of("inline_data", Map.of("mime_type", mimeType, "data", base64))))));
        try {
            JsonNode response = restClient.post()
                    .uri("https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={key}",
                            model, apiKey)
                    .body(requestBody)
                    .retrieve()
                    .body(JsonNode.class);
            String text = response == null ? null
                    : response.path("candidates").path(0).path("content").path("parts").path(0).path("text").asText(null);
            if (text == null || text.isBlank()) {
                throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Gemini returned an empty analysis");
            }
            return normalize(parseJson(text));
        } catch (ResponseStatusException exception) {
            throw exception;
        } catch (Exception exception) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Gemini analysis failed", exception);
        }
    }

    private JsonNode parseJson(String text) throws Exception {
        String cleaned = text.replaceAll("(?i)```json", "").replace("```", "").trim();
        int firstBrace = cleaned.indexOf('{');
        int lastBrace = cleaned.lastIndexOf('}');
        if (firstBrace >= 0 && lastBrace >= firstBrace) {
            cleaned = cleaned.substring(firstBrace, lastBrace + 1);
        }
        return objectMapper.readTree(cleaned);
    }

    private Map<String, Object> normalize(JsonNode json) {
        return Map.of(
                "category", text(json, "category", "General Civic Issue", 100),
                "severity", normalizeSeverity(text(json, "severity", "Medium", 32)),
                "confidence", Math.clamp(json.path("confidence").asInt(85), 0, 100),
                "risk", text(json, "risk", "Requires on-site municipal verification", 500),
                "department", text(json, "department", "Municipal Corporation", 100),
                "priority", normalizePriority(text(json, "priority", "Medium", 32)));
    }

    private String text(JsonNode json, String key, String fallback, int maxLength) {
        String value = json.path(key).asText(fallback).trim();
        if (value.isBlank()) value = fallback;
        return value.substring(0, Math.min(value.length(), maxLength));
    }

    private String normalizeSeverity(String severity) {
        String value = severity.toLowerCase();
        if (value.contains("high") || value.contains("severe") || value.contains("critical")) return "High";
        if (value.contains("low") || value.contains("minor")) return "Low";
        if (value.contains("none") || value.contains("n/a")) return "N/A";
        return "Medium";
    }

    private String normalizePriority(String priority) {
        String value = priority.toLowerCase();
        if (value.contains("high") || value.contains("critical") || value.contains("urgent")) return "High";
        if (value.contains("low") || value.contains("minor")) return "Low";
        if (value.contains("none") || value.contains("n/a")) return "None";
        return "Medium";
    }
}
