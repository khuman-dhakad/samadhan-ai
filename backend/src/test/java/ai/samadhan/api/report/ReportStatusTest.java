package ai.samadhan.api.report;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

import org.junit.jupiter.api.Test;

class ReportStatusTest {
    @Test
    void mapsPublicStatusLabelsToPersistedEnumValues() {
        assertEquals(ReportStatus.UNDER_REVIEW, ReportStatus.fromLabel("Under Review"));
        assertEquals("Resolved", ReportStatus.RESOLVED.label());
        assertThrows(IllegalArgumentException.class, () -> ReportStatus.fromLabel("Unknown"));
    }
}
