package ai.samadhan.api.ai;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.util.Map;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/ai")
public class AiController {
    private final GeminiService geminiService;

    public AiController(GeminiService geminiService) {
        this.geminiService = geminiService;
    }

    @PostMapping("/analyze-issue")
    public Map<String, Object> analyze(@Valid @RequestBody AnalysisRequest request) {
        return Map.of("success", true, "data", geminiService.analyze(request.image()));
    }

    public record AnalysisRequest(@NotBlank @Size(max = 15 * 1024 * 1024) String image) {}
}
