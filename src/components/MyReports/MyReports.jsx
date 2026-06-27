import { useEffect, useState } from "react";
import { getUserReports } from "../../services/firebase/reportService";

function MyReports({ user , refresh  }) {
    const [reports, setReports] = useState([]);

    useEffect(() => {
        if (!user) return;

        loadReports();
    }, [user , refresh]);

    const loadReports = async () => {
        const data = await getUserReports(user.uid);
        setReports(data);
    };

    return (
        <div className="mt-8 border border-blue-500 rounded-xl p-6">
            <h2 className="text-2xl font-bold mb-4">
                My Reports
            </h2>

            {reports.length === 0 ? (
                <p>No reports found.</p>
            ) : (
                reports.map((report) => (
                    <div
                        key={report.id}
                        className="border border-gray-600 rounded-lg p-4 mb-4"
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

export default MyReports;