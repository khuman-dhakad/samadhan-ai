import { useEffect, useState } from "react";
import { getAllReports } from "../../services/firebase/reportService";

function ReportsDashboard({ refresh }) {
    const [reports, setReports] = useState([]);

    useEffect(() => {
        loadReports();
    }, [refresh]);

    const loadReports = async () => {
        const data = await getAllReports();
        console.log("Reports:", data);
        setReports(data);
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case "Reported":
                return "bg-yellow-500 text-black";

            case "Under Review":
                return "bg-orange-500 text-white";

            case "In Progress":
                return "bg-blue-600 text-white";

            case "Resolved":
                return "bg-green-600 text-white";

            default:
                return "bg-gray-600 text-white";
        }
    };

    return (
        <div className="mt-8 border border-blue-500 rounded-xl p-6">
            <h2 className="text-2xl font-bold mb-4">
                Submitted Reports
            </h2>

            {reports.length === 0 ? (
                <p className="text-gray-400">
                    No reports found.
                </p>
            ) : (
                reports.map((report) => (
                    <div
                        key={report.id}
                        className="border border-gray-700 rounded-lg p-4 mb-4"
                    >
                        {report.imageUrl && (
                            <img
                                src={report.imageUrl}
                                alt={report.category}
                                className="w-full h-56 object-cover rounded-lg mb-4"
                            />
                        )}

                        <div className="flex justify-between items-center mb-3">
                            <h3 className="text-lg font-semibold">
                                {report.category}
                            </h3>

                            <span
                                className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusStyle(
                                    report.status || "Reported"
                                )}`}
                            >
                                {report.status || "Reported"}
                            </span>
                        </div>

                        <p>
                            <strong>Severity:</strong>{" "}
                            {report.severity}
                        </p>

                        <p>
                            <strong>Department:</strong>{" "}
                            {report.department}
                        </p>

                        <p>
                            <strong>Priority:</strong>{" "}
                            {report.priority}
                        </p>
                    </div>
                ))
            )}
        </div>
    );
}

export default ReportsDashboard;