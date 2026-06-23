import { useEffect, useState } from "react";
import { getAllReports } from "../../services/firebase/reportService";

function ReportsDashboard() {
    const [reports, setReports] = useState([]);

    useEffect(() => {
        loadReports();
    }, []);

    const loadReports = async () => {
        const data = await getAllReports();

        console.log("Reports:", data);

        setReports(data);
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
                        <p>
                            <strong>Category:</strong>{" "}
                            {report.category}
                        </p>

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