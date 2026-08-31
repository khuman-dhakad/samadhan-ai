import { useEffect, useState, useMemo } from "react";
import {
    getReportStatistics,
    getAllReports,
    updateReportStatus,
    deleteReport,
} from "../../services/firebase/reportService";
import { signInWithGoogle, listenForAuthChanges } from "../../services/firebase/authService";

function AdminDashboard() {
    const [user, setUser] = useState(null);
    const [authLoaded, setAuthLoaded] = useState(false);
    const [signingIn, setSigningIn] = useState(false);

    const [stats, setStats] = useState({
        total: 0,
        reported: 0,
        underReview: 0,
        inProgress: 0,
        resolved: 0,
    });

    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoadingId, setActionLoadingId] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [previewImage, setPreviewImage] = useState(null);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [refreshIndex, setRefreshIndex] = useState(0);

    // List of configured admin emails
    const adminEmails = useMemo(() => {
        const envAdmins = import.meta.env.VITE_ADMIN_EMAILS || "";
        return envAdmins
            .split(",")
            .map((email) => email.trim().toLowerCase())
            .filter(Boolean);
    }, []);

    // Listen for auth state
    useEffect(() => {
        const unsubscribe = listenForAuthChanges((currentUser) => {
            setUser(currentUser);
            setAuthLoaded(true);
        });

        return () => unsubscribe();
    }, []);

    // Check if the current authenticated user is an authorized admin
    const isAuthorizedAdmin = useMemo(() => {
        if (!user || !user.email) return false;
        if (adminEmails.length === 0) return true;
        return adminEmails.includes(user.email.toLowerCase());
    }, [user, adminEmails]);

    // Data fetching effect
    useEffect(() => {
        if (!isAuthorizedAdmin) return;

        let isMounted = true;

        Promise.all([getReportStatistics(), getAllReports()])
            .then(([statsData, reportsData]) => {
                if (isMounted) {
                    setStats(statsData);
                    setReports(reportsData);
                    setLoading(false);
                }
            })
            .catch((err) => {
                console.error("Admin dashboard fetch error:", err);
                if (isMounted) {
                    setLoading(false);
                }
            });

        return () => {
            isMounted = false;
        };
    }, [isAuthorizedAdmin, refreshIndex]);

    const handleGoogleSignIn = async () => {
        setSigningIn(true);
        try {
            await signInWithGoogle();
        } catch (err) {
            console.error("Admin sign in failed:", err);
        } finally {
            setSigningIn(false);
        }
    };

    const handleStatusChange = async (reportId, newStatus) => {
        setActionLoadingId(reportId);
        try {
            await updateReportStatus(reportId, newStatus);
            setRefreshIndex((prev) => prev + 1);
        } catch (err) {
            console.error("Status update failed:", err);
            alert("Failed to update status: " + (err?.message || "Unknown error"));
        } finally {
            setActionLoadingId(null);
        }
    };

    const handleDeleteReport = async (reportId) => {
        const confirmDelete = window.confirm(
            "Are you sure you want to permanently delete this report from the database?"
        );

        if (!confirmDelete) return;

        setActionLoadingId(reportId);
        try {
            await deleteReport(reportId);
            setRefreshIndex((prev) => prev + 1);
        } catch (err) {
            console.error("Report deletion failed:", err);
            alert("Failed to delete report: " + (err?.message || "Unknown error"));
        } finally {
            setActionLoadingId(null);
        }
    };

    const filteredReports = reports.filter((report) => {
        const matchesSearch =
            (report.category || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
            (report.userName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
            (report.locationName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
            (report.department || "").toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus =
            statusFilter === "All" ||
            (report.status || "Reported").toLowerCase() === statusFilter.toLowerCase();

        return matchesSearch && matchesStatus;
    });

    // Case 1: Auth listener resolving
    if (!authLoaded) {
        return (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center">
                <div className="inline-block w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-sm text-slate-400 mt-3">Verifying administrator authorization...</p>
            </div>
        );
    }

    // Case 2: Not logged in
    if (!user) {
        return (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-10 text-center space-y-4 max-w-lg mx-auto shadow-2xl">
                <div className="w-16 h-16 bg-red-500/10 text-red-400 rounded-full flex items-center justify-center text-3xl mx-auto">
                    👑
                </div>
                <h2 className="text-2xl font-bold text-slate-100">
                    Administrator Authentication Required
                </h2>
                <p className="text-slate-400 text-sm leading-relaxed">
                    Access to municipal report triage, status updates, and deletion is restricted to authorized municipal officers and administrators.
                </p>
                <button
                    onClick={handleGoogleSignIn}
                    disabled={signingIn}
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-semibold text-sm px-6 py-3 rounded-xl shadow transition disabled:opacity-50"
                >
                    {signingIn ? "Signing In..." : "Sign In with Google"}
                </button>
            </div>
        );
    }

    // Case 3: Logged in, but email not in VITE_ADMIN_EMAILS list
    if (!isAuthorizedAdmin) {
        return (
            <div className="bg-slate-900 border border-red-500/40 rounded-2xl p-10 text-center space-y-4 max-w-lg mx-auto shadow-2xl">
                <div className="w-16 h-16 bg-red-500/20 text-red-400 rounded-full flex items-center justify-center text-3xl mx-auto">
                    ⛔
                </div>
                <h2 className="text-2xl font-bold text-slate-100">
                    Access Denied
                </h2>
                <p className="text-slate-300 text-sm">
                    Logged in as <span className="font-semibold text-white">{user.email}</span>
                </p>
                <p className="text-slate-400 text-xs leading-relaxed">
                    This account is not authorized as a municipal administrator. Contact your platform administrator to configure your email in <code className="text-red-300 bg-red-950/60 px-1 py-0.5 rounded">VITE_ADMIN_EMAILS</code>.
                </p>
            </div>
        );
    }

    // Case 4: Authorized Admin view
    return (
        <div className="space-y-8">
            {/* Header Admin Info */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-slate-900 border border-slate-800 rounded-2xl p-5 gap-3 shadow-lg">
                <div>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                        Admin Session Active
                    </span>
                    <p className="text-sm font-semibold text-slate-200 mt-1">
                        {user.displayName || user.email}
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => {
                            setLoading(true);
                            setRefreshIndex((prev) => prev + 1);
                        }}
                        disabled={loading}
                        className="text-xs text-slate-300 bg-slate-800 hover:bg-slate-700 px-3 py-2 rounded-lg border border-slate-700 transition"
                    >
                        🔄 Refresh Data
                    </button>
                </div>
            </div>

            {/* Live Statistics Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-center shadow">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Reports</p>
                    <p className="text-2xl sm:text-3xl font-extrabold text-blue-400 mt-1">
                        {stats.total}
                    </p>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-center shadow">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Reported</p>
                    <p className="text-2xl sm:text-3xl font-extrabold text-amber-400 mt-1">
                        {stats.reported}
                    </p>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-center shadow">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Under Review</p>
                    <p className="text-2xl sm:text-3xl font-extrabold text-orange-400 mt-1">
                        {stats.underReview}
                    </p>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-center shadow">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">In Progress</p>
                    <p className="text-2xl sm:text-3xl font-extrabold text-cyan-400 mt-1">
                        {stats.inProgress}
                    </p>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-center shadow col-span-2 sm:col-span-1">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Resolved</p>
                    <p className="text-2xl sm:text-3xl font-extrabold text-emerald-400 mt-1">
                        {stats.resolved}
                    </p>
                </div>
            </div>

            {/* Reports Triage Table & Filters */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-xl font-bold text-slate-100">
                            Issue Reports Triage ({filteredReports.length})
                        </h2>
                        <p className="text-xs text-slate-400 mt-0.5">
                            Filter, inspect full resolution images, update municipal status, or purge records.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                        <input
                            type="text"
                            placeholder="Search category, citizen, location..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 w-full sm:w-64"
                        />

                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                        >
                            <option value="All">All Statuses</option>
                            <option value="Reported">Reported</option>
                            <option value="Under Review">Under Review</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Resolved">Resolved</option>
                        </select>
                    </div>
                </div>

                {loading ? (
                    <div className="py-16 text-center">
                        <div className="inline-block w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-xs text-slate-400 mt-3">Loading triage records...</p>
                    </div>
                ) : filteredReports.length === 0 ? (
                    <div className="py-12 text-center text-slate-400 text-sm">
                        No issue reports found matching the selected filters.
                    </div>
                ) : (
                    <div className="overflow-x-auto rounded-xl border border-slate-800">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                                <tr>
                                    <th className="p-3.5">Image</th>
                                    <th className="p-3.5">Category & Risk</th>
                                    <th className="p-3.5">Citizen</th>
                                    <th className="p-3.5">Location & Dept</th>
                                    <th className="p-3.5">Priority</th>
                                    <th className="p-3.5">Status Action</th>
                                    <th className="p-3.5 text-center">Delete</th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-slate-800/80">
                                {filteredReports.map((report) => (
                                    <tr key={report.id} className="hover:bg-slate-800/40 transition">
                                        <td className="p-3.5">
                                            {report.imageUrl ? (
                                                <img
                                                    src={report.imageUrl}
                                                    alt={report.category || "Issue"}
                                                    className="w-14 h-14 object-cover rounded-lg cursor-pointer hover:ring-2 hover:ring-blue-500 transition shadow"
                                                    onClick={() => {
                                                        setPreviewImage(report.imageUrl);
                                                        setIsPreviewOpen(true);
                                                    }}
                                                    loading="lazy"
                                                />
                                            ) : (
                                                <div className="w-14 h-14 bg-slate-800 rounded-lg flex items-center justify-center text-slate-500 text-[10px]">
                                                    No photo
                                                </div>
                                            )}
                                        </td>

                                        <td className="p-3.5 max-w-[200px]">
                                            <p className="font-bold text-slate-200 truncate">
                                                {report.category || "Civic Defect"}
                                            </p>
                                            {report.risk && (
                                                <p className="text-[11px] text-slate-400 truncate mt-0.5">
                                                    {report.risk}
                                                </p>
                                            )}
                                        </td>

                                        <td className="p-3.5 max-w-[140px]">
                                            <p className="font-medium text-slate-300 truncate">
                                                {report.userName || "Anonymous"}
                                            </p>
                                            {report.userEmail && (
                                                <p className="text-[10px] text-slate-500 truncate">
                                                    {report.userEmail}
                                                </p>
                                            )}
                                        </td>

                                        <td className="p-3.5 max-w-[220px]">
                                            <p className="text-slate-300 truncate">
                                                📍 {report.locationName || `${Number(report.latitude).toFixed(3)}, ${Number(report.longitude).toFixed(3)}`}
                                            </p>
                                            <p className="text-[10px] text-cyan-400 truncate mt-0.5">
                                                🏛️ {report.department || "Municipal Corp"}
                                            </p>
                                        </td>

                                        <td className="p-3.5">
                                            <span
                                                className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase ${
                                                    (report.priority || "").toLowerCase() === "high"
                                                        ? "bg-red-950/60 text-red-400 border border-red-800/50"
                                                        : (report.priority || "").toLowerCase() === "medium"
                                                        ? "bg-amber-950/60 text-amber-400 border border-amber-800/50"
                                                        : "bg-purple-950/60 text-purple-400 border border-purple-800/50"
                                                }`}
                                            >
                                                {report.priority || "Medium"}
                                            </span>
                                        </td>

                                        <td className="p-3.5">
                                            <select
                                                disabled={actionLoadingId === report.id}
                                                value={report.status || "Reported"}
                                                onChange={(e) =>
                                                    handleStatusChange(report.id, e.target.value)
                                                }
                                                className="bg-slate-950 border border-slate-700 p-1.5 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500 disabled:opacity-50"
                                            >
                                                <option value="Reported">Reported</option>
                                                <option value="Under Review">Under Review</option>
                                                <option value="In Progress">In Progress</option>
                                                <option value="Resolved">Resolved</option>
                                            </select>
                                        </td>

                                        <td className="p-3.5 text-center">
                                            <button
                                                disabled={actionLoadingId === report.id}
                                                onClick={() => handleDeleteReport(report.id)}
                                                className="text-xs text-red-400 hover:text-red-300 hover:bg-red-950/40 border border-transparent hover:border-red-800/60 px-2.5 py-1.5 rounded-lg transition disabled:opacity-50"
                                                aria-label="Delete report"
                                            >
                                                {actionLoadingId === report.id ? "..." : "🗑️"}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* High-Res Image Lightbox Modal */}
            {isPreviewOpen && (
                <div
                    className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                    onClick={() => setIsPreviewOpen(false)}
                >
                    <div
                        className="relative max-w-4xl max-h-[90vh] bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden shadow-2xl p-2"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            className="absolute top-4 right-4 bg-slate-800 hover:bg-red-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shadow-md transition z-10"
                            onClick={() => setIsPreviewOpen(false)}
                            aria-label="Close image preview"
                        >
                            ✕
                        </button>

                        <img
                            src={previewImage}
                            alt="Report Full Resolution Preview"
                            className="max-w-full max-h-[80vh] object-contain rounded-xl"
                        />
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminDashboard;