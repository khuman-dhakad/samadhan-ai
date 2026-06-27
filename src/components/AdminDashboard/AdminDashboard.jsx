import { useEffect, useState } from "react";
import {
    getReportStatistics,
    getAllReports,
    updateReportStatus,
    deleteReport,
} from "../../services/firebase/reportService";

function AdminDashboard() {
    const [stats, setStats] = useState({
        total: 0,
        reported: 0,
        underReview: 0,
        inProgress: 0,
        resolved: 0,
    });

    const [reports, setReports] = useState([]);

    useEffect(() => {
        loadStatistics();
        loadReports();
    }, []);

    const loadStatistics = async () => {
        const data = await getReportStatistics();
        setStats(data);
    };

    const loadReports = async () => {
        const data = await getAllReports();
        setReports(data);
    };

    const handleStatusChange = async (
        reportId,
        newStatus
    ) => {
        await updateReportStatus(
            reportId,
            newStatus
        );

        await loadReports();
        await loadStatistics();
    };

    const handleDeleteReport = async (reportId) => {
    const confirmDelete = window.confirm(
        "Are you sure you want to delete this report?"
    );

    if (!confirmDelete) return;

    await deleteReport(reportId);

    await loadReports();
    await loadStatistics();
    };

    return (
        <div className="mt-8 border border-red-500 rounded-xl p-6">
            <h2 className="text-3xl font-bold mb-6">
                Admin Dashboard
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="bg-slate-800 rounded-lg p-4 text-center">
                    <h3 className="text-lg font-semibold">
                        Total
                    </h3>

                    <p className="text-3xl font-bold text-blue-400">
                        {stats.total}
                    </p>
                </div>

                <div className="bg-slate-800 rounded-lg p-4 text-center">
                    <h3 className="text-lg font-semibold">
                        Reported
                    </h3>

                    <p className="text-3xl font-bold text-yellow-400">
                        {stats.reported}
                    </p>
                </div>

                <div className="bg-slate-800 rounded-lg p-4 text-center">
                    <h3 className="text-lg font-semibold">
                        Under Review
                    </h3>

                    <p className="text-3xl font-bold text-orange-400">
                        {stats.underReview}
                    </p>
                </div>

                <div className="bg-slate-800 rounded-lg p-4 text-center">
                    <h3 className="text-lg font-semibold">
                        In Progress
                    </h3>

                    <p className="text-3xl font-bold text-cyan-400">
                        {stats.inProgress}
                    </p>
                </div>

                <div className="bg-slate-800 rounded-lg p-4 text-center">
                    <h3 className="text-lg font-semibold">
                        Resolved
                    </h3>

                    <p className="text-3xl font-bold text-green-400">
                        {stats.resolved}
                    </p>
                </div>
            </div>
            <div className="mt-8">
                <h3 className="text-2xl font-bold mb-4">
                    All Reports
                </h3>

                <div className="overflow-x-auto">
                    <table className="w-full border border-gray-700">
                        <thead className="bg-slate-800">
                            <tr>
                                <th className="p-3 border">Category</th>
                                <th className="p-3 border">User</th>
                                <th className="p-3 border">Action</th>
                                <th className="p-3 border">Priority</th>
                                <th className="p-3 border">Status</th>
                            </tr>
                        </thead>

                        <tbody>
                            {reports.map((report) => (
                                <tr key={report.id}>
                                    <td className="p-3 border">
                                        {report.category}
                                    </td>

                                    <td className="p-3 border">
                                        {report.userName}
                                    </td>

                                    <td className="p-3 border">
                                        {report.priority}
                                    </td>

                                    <td className="p-3 border">
                                        <select
                                            value={report.status || "Reported"}
                                            onChange={(e) =>
                                                handleStatusChange(
                                                    report.id,
                                                    e.target.value
                                                )
                                            }
                                            className="bg-slate-800 p-2 rounded text-white"
                                        >
                                            <option>Reported</option>
                                            <option>Under Review</option>
                                            <option>In Progress</option>
                                            <option>Resolved</option>
                                        </select>
                                    </td>
                                    <td className="p-3 border text-center">
    <button
        onClick={() =>
            handleDeleteReport(report.id)
        }
        className="bg-red-600 hover:bg-red-700 px-3 py-2 rounded"
    >
        Delete
    </button>
</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default AdminDashboard;