import { apiRequest } from "../api/apiClient";

const reportPath = "/api/reports";

export async function saveIssueReport(reportData) {
    if (!reportData) throw new Error("Report data is required");
    const report = await apiRequest(reportPath, {
        method: "POST",
        body: JSON.stringify(reportData),
    });
    return report.id;
}

export async function getAllReports() {
    return apiRequest(reportPath);
}

export async function getUserReports() {
    return apiRequest(`${reportPath}/mine`);
}

export async function updateReportStatus(reportId, newStatus) {
    if (!reportId || !newStatus) throw new Error("Report ID and new status are required");
    await apiRequest(`${reportPath}/${encodeURIComponent(reportId)}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: newStatus }),
    });
}

export async function getReportStatistics() {
    return apiRequest(`${reportPath}/statistics`);
}

export async function deleteReport(reportId) {
    if (!reportId) throw new Error("Report ID is required for deletion");
    await apiRequest(`${reportPath}/${encodeURIComponent(reportId)}`, { method: "DELETE" });
}
