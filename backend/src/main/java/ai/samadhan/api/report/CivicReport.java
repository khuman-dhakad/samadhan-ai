package ai.samadhan.api.report;

import ai.samadhan.api.user.AppUser;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "civic_reports")
public class CivicReport {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, length = 100)
    private String category;

    @Column(nullable = false, length = 32)
    private String severity;

    @Column(nullable = false, length = 32)
    private String priority;

    @Column(nullable = false)
    private int confidence;

    @Column(nullable = false, length = 500)
    private String risk;

    @Column(nullable = false, length = 100)
    private String department;

    @Column(nullable = false, length = 1000)
    private String imageUrl;

    @Column(nullable = false, length = 255)
    private String imageName;

    @Column(nullable = false)
    private double latitude;

    @Column(nullable = false)
    private double longitude;

    @Column(nullable = false, length = 500)
    private String locationName;

    @Column(nullable = false, length = 100)
    private String userName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 24)
    private ReportStatus status = ReportStatus.REPORTED;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private AppUser reporter;

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @Column(nullable = false)
    private Instant updatedAt;

    protected CivicReport() {}

    public CivicReport(ReportDtos.CreateRequest request, AppUser reporter) {
        this.category = clean(request.category(), "General Civic Issue", 100);
        this.severity = clean(request.severity(), "Medium", 32);
        this.priority = clean(request.priority(), "Medium", 32);
        this.confidence = Math.max(0, Math.min(100, request.confidence() == null ? 85 : request.confidence()));
        this.risk = clean(request.risk(), "Requires on-site municipal verification", 500);
        this.department = clean(request.department(), "Municipal Corporation", 100);
        this.imageUrl = clean(request.imageUrl(), null, 1000);
        this.imageName = clean(request.imageName(), "issue-image", 255);
        this.latitude = request.latitude();
        this.longitude = request.longitude();
        this.locationName = clean(request.locationName(), request.latitude() + ", " + request.longitude(), 500);
        this.reporter = reporter;
        this.userName = reporter == null
                ? clean(request.userName(), "Anonymous Citizen", 100)
                : reporter.getDisplayName();
    }

    @PrePersist
    void createTimestamps() {
        Instant now = Instant.now();
        if (createdAt == null) createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    void updateTimestamp() {
        updatedAt = Instant.now();
    }

    public void setStatus(ReportStatus status) {
        this.status = status;
    }

    private static String clean(String value, String fallback, int maxLength) {
        String result = value == null || value.isBlank() ? fallback : value.trim();
        if (result == null || result.isBlank()) {
            throw new IllegalArgumentException("Required report field is missing");
        }
        return result.substring(0, Math.min(result.length(), maxLength));
    }

    public UUID getId() { return id; }
    public String getCategory() { return category; }
    public String getSeverity() { return severity; }
    public String getPriority() { return priority; }
    public int getConfidence() { return confidence; }
    public String getRisk() { return risk; }
    public String getDepartment() { return department; }
    public String getImageUrl() { return imageUrl; }
    public String getImageName() { return imageName; }
    public double getLatitude() { return latitude; }
    public double getLongitude() { return longitude; }
    public String getLocationName() { return locationName; }
    public String getUserName() { return userName; }
    public ReportStatus getStatus() { return status; }
    public AppUser getReporter() { return reporter; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
}
