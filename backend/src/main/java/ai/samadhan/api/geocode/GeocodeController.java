package ai.samadhan.api.geocode;

import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/geocode")
public class GeocodeController {
    private final GeocodeService geocodeService;

    public GeocodeController(GeocodeService geocodeService) {
        this.geocodeService = geocodeService;
    }

    @GetMapping
    public Map<String, Object> reverse(
            @RequestParam double lat,
            @RequestParam double lng) {
        return Map.of("success", true, "locationName", geocodeService.reverse(lat, lng));
    }
}
