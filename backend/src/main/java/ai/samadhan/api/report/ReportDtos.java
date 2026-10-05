package ai.samadhan.api.report;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.Instant;
import java.util.UUID;

public final class ReportDtos {
    private ReportDtos() {}

    public record CreateRequest(
            @Size(max = 100) String category,
            @Size(max = 32) String severity,
            @Size(max = 32) String priority,
            Integer confidence,
            @Size(max = 500) String risk,
            @Size(max = 100) String department,
            @NotBlank @Size(max = 1000) String imageUrl,
            @Size(max = 255) String imageName,
            @NotNull @DecimalMin("-90.0") @DecimalMax("90.0") Double latitude,
            @NotNull @DecimalMin("-180.0") @DecimalMax("180.0") Double longitude,
            @Size(max = 500) String locationName,
            @Size(max = 100) String userName) {}

    public record StatusRequest(@NotBlank String status) {}

    public record ReportView(
            UUID id,
            String category,
            String severity,
            String priority,
            int confidence,
            String risk,
            String department,
            String imageUrl,
            String imageName,
            double latitude,
            double longitude,
            String locationName,
            String userId,
            String userName,
            String status,
            Instant createdAt,
            Instant updatedAt) {
        public static ReportView from(CivicReport report) {
            return new ReportView(
                    report.getId(),
                    report.getCategory(),
                    report.getSeverity(),
                    report.getPriority(),
                    report.getConfidence(),
                    report.getRisk(),
                    report.getDepartment(),
                    report.getImageUrl(),
                    report.getImageName(),
                    report.getLatitude(),
                    report.getLongitude(),
                    report.getLocationName(),
                    report.getReporter() == null ? "anonymous" : report.getReporter().getId().toString(),
                    report.getUserName(),
                    report.getStatus().label(),
                    report.getCreatedAt(),
                    report.getUpdatedAt());
        }
    }

    public record Statistics(long total, long reported, long underReview, long inProgress, long resolved) {}
}
