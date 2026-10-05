package ai.samadhan.api.report;

import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/reports")
public class ReportController {
    private final ReportService reportService;

    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    @GetMapping
    public List<ReportDtos.ReportView> listAll() {
        return reportService.listAll();
    }

    @GetMapping("/mine")
    public List<ReportDtos.ReportView> listMine(Authentication authentication) {
        return reportService.listMine(authentication.getName());
    }

    @GetMapping("/statistics")
    public ReportDtos.Statistics statistics() {
        return reportService.statistics();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ReportDtos.ReportView create(
            @Valid @RequestBody ReportDtos.CreateRequest request,
            Authentication authentication) {
        String email = authentication == null || "anonymousUser".equals(authentication.getName())
                ? null : authentication.getName();
        return reportService.create(request, email);
    }

    @PatchMapping("/{id}/status")
    public ReportDtos.ReportView updateStatus(
            @PathVariable UUID id,
            @Valid @RequestBody ReportDtos.StatusRequest request) {
        return reportService.updateStatus(id, request.status());
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable UUID id) {
        reportService.delete(id);
    }
}
