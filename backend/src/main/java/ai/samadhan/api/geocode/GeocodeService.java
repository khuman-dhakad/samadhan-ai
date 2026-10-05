package ai.samadhan.api.geocode;

import com.fasterxml.jackson.databind.JsonNode;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.util.UriComponentsBuilder;

@Service
public class GeocodeService {
    private final RestClient restClient;

    public GeocodeService(RestClient.Builder builder) {
        this.restClient = builder.defaultHeader(
                "User-Agent", "Samadhan-AI/1.0 (civic-intelligence-platform)").build();
    }

    public String reverse(double latitude, double longitude) {
        if (!Double.isFinite(latitude) || latitude < -90 || latitude > 90
                || !Double.isFinite(longitude) || longitude < -180 || longitude > 180) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid latitude or longitude");
        }
        String fallback = "Coordinates (%.4f, %.4f)".formatted(latitude, longitude);
        try {
            JsonNode response = restClient.get()
                    .uri(UriComponentsBuilder.fromUriString("https://nominatim.openstreetmap.org/reverse")
                            .queryParam("format", "json")
                            .queryParam("lat", latitude)
                            .queryParam("lon", longitude)
                            .build()
                            .encode()
                            .toUri())
                    .retrieve()
                    .body(JsonNode.class);
            String displayName = response == null ? null : response.path("display_name").asText(null);
            return displayName == null || displayName.isBlank() ? fallback : displayName;
        } catch (Exception exception) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Reverse geocoding failed", exception);
        }
    }
}
