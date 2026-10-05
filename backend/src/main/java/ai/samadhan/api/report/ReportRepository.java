package ai.samadhan.api.report;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ReportRepository extends JpaRepository<CivicReport, UUID> {
    List<CivicReport> findAllByOrderByCreatedAtDesc();
    List<CivicReport> findAllByReporter_EmailIgnoreCaseOrderByCreatedAtDesc(String email);
}
