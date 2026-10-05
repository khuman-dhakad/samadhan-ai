package ai.samadhan.api.report;

import ai.samadhan.api.user.UserRepository;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class ReportService {
    private final ReportRepository reports;
    private final UserRepository users;

    public ReportService(ReportRepository reports, UserRepository users) {
        this.reports = reports;
        this.users = users;
    }

    @Transactional(readOnly = true)
    public List<ReportDtos.ReportView> listAll() {
        return reports.findAllByOrderByCreatedAtDesc().stream().map(ReportDtos.ReportView::from).toList();
    }

    @Transactional(readOnly = true)
    public List<ReportDtos.ReportView> listMine(String email) {
        return reports.findAllByReporter_EmailIgnoreCaseOrderByCreatedAtDesc(email)
                .stream().map(ReportDtos.ReportView::from).toList();
    }

    @Transactional
    public ReportDtos.ReportView create(ReportDtos.CreateRequest request, String email) {
        var reporter = email == null ? null : users.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Account no longer exists"));
        return ReportDtos.ReportView.from(reports.save(new CivicReport(request, reporter)));
    }

    @Transactional
    public ReportDtos.ReportView updateStatus(UUID id, String label) {
        final ReportStatus status;
        try {
            status = ReportStatus.fromLabel(label);
        } catch (IllegalArgumentException exception) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, exception.getMessage());
        }
        CivicReport report = reports.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Report not found"));
        report.setStatus(status);
        return ReportDtos.ReportView.from(report);
    }

    @Transactional
    public void delete(UUID id) {
        if (!reports.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Report not found");
        }
        reports.deleteById(id);
    }

    @Transactional(readOnly = true)
    public ReportDtos.Statistics statistics() {
        var allReports = reports.findAll();
        return new ReportDtos.Statistics(
                allReports.size(),
                count(allReports, ReportStatus.REPORTED),
                count(allReports, ReportStatus.UNDER_REVIEW),
                count(allReports, ReportStatus.IN_PROGRESS),
                count(allReports, ReportStatus.RESOLVED));
    }

    private long count(List<CivicReport> allReports, ReportStatus status) {
        return allReports.stream().filter(report -> report.getStatus() == status).count();
    }
}
