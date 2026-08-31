import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getUserReports } from "../../services/firebase/reportService";
import { signInWithGoogle } from "../../services/firebase/authService";

function MyReports({ user, authLoaded, refresh }) {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [signingIn, setSigningIn] = useState(false);

    useEffect(() => {
        if (!user?.uid) {
            return;
        }

        let isMounted = true;

        getUserReports(user.uid)
            .then((data) => {
                if (isMounted) {
                    setReports(data);
                    setLoading(false);
                }
            })
            .catch((error) => {
                console.error("Error loading user reports:", error);
                if (isMounted) {
                    setLoading(false);
                }
            });

        return () => {
            isMounted = false;
        };
    }, [user?.uid, refresh]);

    const handleGoogleSignIn = async () => {
        setSigningIn(true);
        try {
            await signInWithGoogle();
        } catch (err) {
            console.error("Sign in failed:", err);
        } finally {
            setSigningIn(false);
        }
    };

    const getStatusBadge = (status) => {
        const normalized = (status || "Reported").toLowerCase();
        switch (normalized) {
            case "reported":
                return "bg-amber-500/10 text-amber-400 border-amber-500/30";
            case "under review":
                return "bg-orange-500/10 text-orange-400 border-orange-500/30";
            case "in progress":
                return "bg-blue-500/10 text-blue-400 border-blue-500/30";
            case "resolved":
                return "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
            default:
                return "bg-slate-700/30 text-slate-300 border-slate-600/30";
        }
    };

    const getPriorityBadge = (priority) => {
        const normalized = (priority || "Medium").toLowerCase();
        switch (normalized) {
            case "high":
                return "text-red-400 bg-red-950/40 border-red-800/40";
            case "medium":
                return "text-amber-400 bg-amber-950/40 border-amber-800/40";
            case "low":
                return "text-purple-400 bg-purple-950/40 border-purple-800/40";
            default:
                return "text-slate-400 bg-slate-800 border-slate-700";
        }
    };

    // State 1: Auth not resolved yet
    if (!authLoaded) {
        return (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center">
                <div className="inline-block w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-sm text-slate-400 mt-3">Checking authentication state...</p>
            </div>
        );
    }

    // State 2: User is not logged in
    if (!user) {
        return (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-10 text-center space-y-4 max-w-lg mx-auto shadow-xl">
                <div className="w-16 h-16 bg-blue-600/10 text-blue-400 rounded-full flex items-center justify-center text-3xl mx-auto">
                    🔒
                </div>
                <h2 className="text-xl font-bold text-slate-100">
                    Sign in to View Your Reports
                </h2>
                <p className="text-slate-400 text-sm leading-relaxed">
                    Track the real-time resolution status of your submitted civic issues by signing in with your Google account.
                </p>
                <button
                    onClick={handleGoogleSignIn}
                    disabled={signingIn}
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-semibold text-sm px-6 py-3 rounded-xl shadow transition disabled:opacity-50"
                >
                    {signingIn ? "Signing In..." : "Sign In with Google"}
                </button>
            </div>
        );
    }

    // State 3: Fetching user reports
    if (loading) {
        return (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center">
                <div className="inline-block w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-sm text-slate-400 mt-3">Loading your submitted reports...</p>
            </div>
        );
    }

    // State 4: User logged in but has no reports
    if (reports.length === 0) {
        return (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center space-y-4 shadow-xl">
                <div className="w-16 h-16 bg-slate-800 text-slate-400 rounded-full flex items-center justify-center text-3xl mx-auto">
                    📝
                </div>
                <h2 className="text-xl font-bold text-slate-100">
                    No Reports Found Yet
                </h2>
                <p className="text-slate-400 text-sm max-w-md mx-auto">
                    You have not submitted any civic reports with this account. Spot a community issue and report it in seconds.
                </p>
                <Link
                    to="/report"
                    className="inline-block bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm px-6 py-3 rounded-xl shadow transition"
                >
                    📸 Report a Civic Issue
                </Link>
            </div>
        );
    }

    // State 5: Render user reports list
    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center px-1">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Total Submissions ({reports.length})
                </p>
                <Link
                    to="/report"
                    className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1"
                >
                    + Report New Issue
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {reports.map((report) => (
                    <div
                        key={report.id}
                        className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition flex flex-col justify-between shadow-lg"
                    >
                        <div>
                            {report.imageUrl && (
                                <div className="relative w-full h-48 rounded-xl overflow-hidden mb-4 bg-slate-950 border border-slate-800">
                                    <img
                                        src={report.imageUrl}
                                        alt={report.category || "Issue photo"}
                                        className="w-full h-full object-cover"
                                        loading="lazy"
                                    />
                                    <div className="absolute top-2 right-2">
                                        <span
                                            className={`px-2.5 py-1 rounded-full text-xs font-bold border backdrop-blur-md ${getStatusBadge(
                                                report.status
                                            )}`}
                                        >
                                            {report.status || "Reported"}
                                        </span>
                                    </div>
                                </div>
                            )}

                            {!report.imageUrl && (
                                <div className="flex justify-end mb-3">
                                    <span
                                        className={`px-2.5 py-1 rounded-full text-xs font-bold border ${getStatusBadge(
                                            report.status
                                        )}`}
                                    >
                                        {report.status || "Reported"}
                                    </span>
                                </div>
                            )}

                            <h3 className="text-lg font-bold text-slate-100 mb-2">
                                {report.category || "Civic Defect"}
                            </h3>

                            {report.locationName && (
                                <p className="text-xs text-slate-400 mb-3 flex items-start gap-1.5 leading-relaxed">
                                    <span>📍</span>
                                    <span className="break-words">{report.locationName}</span>
                                </p>
                            )}

                            <div className="grid grid-cols-2 gap-2 text-xs py-2 border-y border-slate-800">
                                <div>
                                    <span className="text-slate-500">Priority: </span>
                                    <span className={`font-semibold px-1.5 py-0.5 rounded border text-[11px] ${getPriorityBadge(report.priority)}`}>
                                        {report.priority || "Medium"}
                                    </span>
                                </div>

                                <div>
                                    <span className="text-slate-500">Severity: </span>
                                    <span className="font-medium text-slate-300">{report.severity || "Medium"}</span>
                                </div>

                                <div>
                                    <span className="text-slate-500">Department: </span>
                                    <span className="font-medium text-slate-300 truncate block">{report.department || "Municipal"}</span>
                                </div>

                                <div>
                                    <span className="text-slate-500">Confidence: </span>
                                    <span className="font-medium text-emerald-400">{report.confidence || 85}%</span>
                                </div>
                            </div>

                            {report.risk && (
                                <p className="text-xs text-slate-400 mt-3 italic">
                                    &ldquo;{report.risk}&rdquo;
                                </p>
                            )}
                        </div>

                        <div className="mt-4 pt-3 border-t border-slate-800/60 flex justify-between items-center text-[11px] text-slate-500">
                            <span>Report ID: {report.id.substring(0, 8)}...</span>
                            <span>
                                {report.createdAt
                                    ? new Date(report.createdAt).toLocaleDateString(undefined, {
                                          month: "short",
                                          day: "numeric",
                                          year: "numeric",
                                      })
                                    : "Recently"}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default MyReports;