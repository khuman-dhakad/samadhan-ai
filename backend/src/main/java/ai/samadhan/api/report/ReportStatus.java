package ai.samadhan.api.report;

public enum ReportStatus {
    REPORTED("Reported"),
    UNDER_REVIEW("Under Review"),
    IN_PROGRESS("In Progress"),
    RESOLVED("Resolved");

    private final String label;

    ReportStatus(String label) {
        this.label = label;
    }

    public String label() {
        return label;
    }

    public static ReportStatus fromLabel(String label) {
        for (ReportStatus status : values()) {
            if (status.label.equalsIgnoreCase(label)) {
                return status;
            }
        }
        throw new IllegalArgumentException("Unsupported report status: " + label);
    }
}
