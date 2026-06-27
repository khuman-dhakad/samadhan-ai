import { useEffect, useState } from "react";
import { getReportStatistics } from "../../services/firebase/reportService";

function AdminDashboard() {
    const [stats, setStats] = useState({
        total: 0,
        reported: 0,
        underReview: 0,
        inProgress: 0,
        resolved: 0,
    });

    useEffect(() => {
        loadStatistics();
    }, []);

    const loadStatistics = async () => {
        const data = await getReportStatistics();
        setStats(data);
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
        </div>
    );
}

export default AdminDashboard;