import { Routes, Route, Navigate, Link } from "react-router-dom";

import Navbar from "./components/Navbar/Navbar";
import ErrorBoundary from "./components/ErrorBoundary/ErrorBoundary";

import Home from "./pages/Home/Home";
import ReportIssue from "./pages/ReportIssue/ReportIssue";
import MyReportsPage from "./pages/MyReports/MyReports";
import CommunityMap from "./pages/CommunityMap/CommunityMap";
import Admin from "./pages/Admin/Admin";

function App() {
    return (
        <ErrorBoundary>
            <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between selection:bg-blue-600 selection:text-white">
                <Navbar />

                <div className="flex-grow">
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/report" element={<ReportIssue />} />
                        <Route path="/my-reports" element={<MyReportsPage />} />
                        <Route path="/map" element={<CommunityMap />} />
                        <Route path="/admin" element={<Admin />} />
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </div>

                <footer className="bg-slate-950 border-t border-slate-900 py-8 px-4 sm:px-6 lg:px-8 text-center text-xs text-slate-500">
                    <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
                        <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-300">Samadhan AI</span>
                            <span>— Hyperlocal Civic Intelligence Platform</span>
                        </div>

                        <div className="flex items-center gap-4">
                            <Link to="/report" className="hover:text-slate-300 transition">
                                Report Issue
                            </Link>
                            <Link to="/map" className="hover:text-slate-300 transition">
                                Community Map
                            </Link>
                            <Link to="/my-reports" className="hover:text-slate-300 transition">
                                My Reports
                            </Link>
                            <Link to="/admin" className="hover:text-slate-300 transition">
                                Admin Dashboard
                            </Link>
                        </div>
                    </div>
                </footer>
            </div>
        </ErrorBoundary>
    );
}

export default App;