import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getReportStatistics } from "../../services/firebase/reportService";

function Home() {
    const [stats, setStats] = useState({
        total: 0,
        reported: 0,
        underReview: 0,
        inProgress: 0,
        resolved: 0,
    });

    useEffect(() => {
        let isMounted = true;
        getReportStatistics().then((data) => {
            if (isMounted) setStats(data);
        });
        return () => {
            isMounted = false;
        };
    }, []);

    return (
        <main className="min-h-screen bg-slate-950 text-white selection:bg-blue-600 selection:text-white">
            {/* Hero Section */}
            <section className="relative overflow-hidden pt-12 pb-20 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-slate-950 to-slate-950 pointer-events-none"></div>

                <div className="max-w-5xl mx-auto text-center relative z-10 space-y-6">
                    <div className="flex flex-wrap items-center justify-center gap-2.5">
                        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold tracking-wide">
                            <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping"></span>
                            Next-Gen Civic Governance Platform
                        </div>
                        <a
                            href="https://samadhan-ai-rho.vercel.app"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold tracking-wide hover:bg-emerald-500/20 transition"
                        >
                            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                            <span>Live on Vercel ↗</span>
                        </a>
                    </div>

                    <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-slate-400 leading-tight">
                        Empowering Hyperlocal <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-300">
                            Civic Resolution with AI
                        </span>
                    </h1>

                    <p className="text-base sm:text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed">
                        Snap a photo of any civic issue. Our multimodal Gemini AI categorizes severity, estimates risk, assigns the right municipal department, and places it on the community map for swift resolution.
                    </p>

                    {/* Action CTA Buttons */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                        <Link
                            to="/report"
                            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold text-base shadow-lg shadow-blue-600/25 transition duration-150 transform hover:-translate-y-0.5"
                        >
                            📸 Report an Issue Now
                        </Link>

                        <Link
                            to="/map"
                            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-semibold text-base transition duration-150"
                        >
                            🗺️ Explore Live Map
                        </Link>

                        <Link
                            to="/my-reports"
                            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-slate-900/60 hover:bg-slate-800/80 text-slate-400 hover:text-white border border-slate-800 font-medium text-base transition"
                        >
                            📋 Track My Reports
                        </Link>
                    </div>
                </div>

                {/* Live Stats Counter Strip */}
                <div className="max-w-5xl mx-auto mt-16 grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-slate-900/80 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 text-center transform hover:-translate-y-1 transition duration-200 shadow-md">
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Reports</p>
                        <p className="text-3xl font-extrabold text-blue-400 mt-1">{stats.total}</p>
                    </div>

                    <div className="bg-slate-900/80 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 text-center transform hover:-translate-y-1 transition duration-200 shadow-md">
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">In Progress</p>
                        <p className="text-3xl font-extrabold text-cyan-400 mt-1">{stats.inProgress}</p>
                    </div>

                    <div className="bg-slate-900/80 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 text-center transform hover:-translate-y-1 transition duration-200 shadow-md">
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Under Review</p>
                        <p className="text-3xl font-extrabold text-amber-400 mt-1">{stats.underReview}</p>
                    </div>

                    <div className="bg-slate-900/80 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 text-center transform hover:-translate-y-1 transition duration-200 shadow-md">
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Resolved</p>
                        <p className="text-3xl font-extrabold text-emerald-400 mt-1">{stats.resolved}</p>
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-12">
                <div className="text-center space-y-3">
                    <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-100">
                        How Samadhan AI Works
                    </h2>
                    <p className="text-slate-400 text-sm sm:text-base max-w-2xl mx-auto">
                        From photo capture to municipal action in three frictionless steps.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative group hover:border-blue-500/50 transition">
                        <div className="w-12 h-12 rounded-xl bg-blue-600/20 border border-blue-500/30 text-blue-400 font-black text-xl flex items-center justify-center mb-4">
                            1
                        </div>
                        <h3 className="text-xl font-bold text-slate-100 mb-2">Capture & Geotag</h3>
                        <p className="text-slate-400 text-sm leading-relaxed">
                            Upload a photo of any civic defect and select the exact street location directly on the interactive Leaflet map.
                        </p>
                    </div>

                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative group hover:border-cyan-500/50 transition">
                        <div className="w-12 h-12 rounded-xl bg-cyan-600/20 border border-cyan-500/30 text-cyan-400 font-black text-xl flex items-center justify-center mb-4">
                            2
                        </div>
                        <h3 className="text-xl font-bold text-slate-100 mb-2">Gemini AI Analysis</h3>
                        <p className="text-slate-400 text-sm leading-relaxed">
                            Google Gemini AI instantly identifies category, assesses severity & public risk, calculates confidence, and assigns the responsible department.
                        </p>
                    </div>

                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative group hover:border-emerald-500/50 transition">
                        <div className="w-12 h-12 rounded-xl bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 font-black text-xl flex items-center justify-center mb-4">
                            3
                        </div>
                        <h3 className="text-xl font-bold text-slate-100 mb-2">Track & Resolve</h3>
                        <p className="text-slate-400 text-sm leading-relaxed">
                            Track the real-time progress of your report from submission to review, municipal action, and final resolution.
                        </p>
                    </div>
                </div>
            </section>

            {/* Core Features Grid */}
            <section className="py-16 px-4 sm:px-6 lg:px-8 border-t border-slate-800 bg-slate-900/30">
                <div className="max-w-6xl mx-auto space-y-12">
                    <div className="text-center space-y-3">
                        <h2 className="text-3xl font-extrabold text-slate-100">
                            Built for Citizens & Municipal Administrators
                        </h2>
                        <p className="text-slate-400 text-sm sm:text-base">
                            Engineered for high reliability, real-time sync, and intelligent civic automation.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="bg-slate-900 border border-slate-800/80 hover:border-blue-500/40 rounded-xl p-5 hover:-translate-y-1 transition duration-200 shadow-md">
                            <span className="text-3xl mb-3 block">🤖</span>
                            <h4 className="font-bold text-base text-slate-200 mb-1">Multimodal AI</h4>
                            <p className="text-xs text-slate-400 leading-relaxed">
                                Zero-shot image classification and risk assessment using Gemini 2.5 Flash.
                            </p>
                        </div>

                        <div className="bg-slate-900 border border-slate-800/80 hover:border-cyan-500/40 rounded-xl p-5 hover:-translate-y-1 transition duration-200 shadow-md">
                            <span className="text-3xl mb-3 block">🗺️</span>
                            <h4 className="font-bold text-base text-slate-200 mb-1">Hyperlocal Map</h4>
                            <p className="text-xs text-slate-400 leading-relaxed">
                                Reverse-geocoded OpenStreetMap pins color-coded by urgency level.
                            </p>
                        </div>

                        <div className="bg-slate-900 border border-slate-800/80 hover:border-amber-500/40 rounded-xl p-5 hover:-translate-y-1 transition duration-200 shadow-md">
                            <span className="text-3xl mb-3 block">⚡</span>
                            <h4 className="font-bold text-base text-slate-200 mb-1">Cloud Image Pipeline</h4>
                            <p className="text-xs text-slate-400 leading-relaxed">
                                Cloudinary CDN for instant optimized image delivery and persistent storage.
                            </p>
                        </div>

                        <div className="bg-slate-900 border border-slate-800/80 hover:border-emerald-500/40 rounded-xl p-5 hover:-translate-y-1 transition duration-200 shadow-md">
                            <span className="text-3xl mb-3 block">🛡️</span>
                            <h4 className="font-bold text-base text-slate-200 mb-1">Admin Command Center</h4>
                            <p className="text-xs text-slate-400 leading-relaxed">
                                Role-based dashboard for authorities to review, prioritize, and resolve issues.
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}

export default Home;