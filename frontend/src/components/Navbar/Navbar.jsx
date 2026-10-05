import { useState } from "react";
import { NavLink, Link } from "react-router-dom";
import { useAuth } from "../../context/useAuth";

function Navbar() {
    const { user, isSigningIn, openAuthDialog, logout } = useAuth();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleLogout = async () => {
        try {
            await logout();
        } catch (error) {
            console.error("Logout failed", error);
        }
    };

    const linkStyle = ({ isActive }) =>
        `px-3 py-2 rounded-lg text-sm font-medium transition duration-150 ${
            isActive
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-300 hover:bg-slate-800 hover:text-white"
        }`;

    const mobileLinkStyle = ({ isActive }) =>
        `block px-3 py-2 rounded-lg text-base font-medium transition ${
            isActive
                ? "bg-blue-600 text-white"
                : "text-slate-300 hover:bg-slate-800 hover:text-white"
        }`;

    return (
        <header className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur border-b border-slate-800 shadow-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Brand / Home Link */}
                    <Link
                        to="/"
                        className="flex items-center gap-2 text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-300 hover:opacity-90 transition"
                        aria-label="Samadhan AI Home"
                    >
                        <span>🏛️</span>
                        <span>Samadhan AI</span>
                    </Link>

                    {/* Desktop Navigation Links */}
                    <nav
                        className="hidden md:flex items-center gap-2"
                        aria-label="Main Navigation"
                    >
                        <NavLink to="/report" className={linkStyle}>
                            📝 Report Issue
                        </NavLink>

                        <NavLink to="/my-reports" className={linkStyle}>
                            📋 My Reports
                        </NavLink>

                        <NavLink to="/map" className={linkStyle}>
                            🗺️ Community Map
                        </NavLink>

                        <NavLink to="/admin" className={linkStyle}>
                            👑 Admin
                        </NavLink>
                    </nav>

                    {/* Desktop Auth Section */}
                    <div className="hidden md:flex items-center gap-3">
                        <a
                            href="https://github.com/khuman-dhakad/samadhan-ai"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white px-2.5 py-1.5 rounded-lg border border-slate-800 hover:border-slate-700 bg-slate-800/40 hover:bg-slate-800 transition"
                            aria-label="GitHub Repository"
                            title="View Source on GitHub"
                        >
                            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                            </svg>
                            <span>GitHub</span>
                        </a>

                        {!user ? (
                            <button
                                onClick={openAuthDialog}
                                disabled={isSigningIn}
                                className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-100 text-sm font-medium px-3.5 py-2 rounded-lg border border-slate-700 hover:border-slate-600 transition shadow-sm disabled:opacity-50"
                                aria-label="Sign in"
                            >
                                <span aria-hidden="true">🔐</span>
                                {isSigningIn ? "Signing In..." : "Sign In"}
                            </button>
                        ) : (
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs">
                                        {(user.displayName || user.email || "U")[0].toUpperCase()}
                                    </div>
                                    <span className="text-xs text-slate-300 font-medium max-w-[120px] truncate">
                                        {user.displayName || user.email?.split("@")[0]}
                                    </span>
                                </div>

                                <button
                                    onClick={handleLogout}
                                    className="text-xs text-slate-400 hover:text-red-400 px-2.5 py-1.5 rounded border border-slate-800 hover:border-red-900/50 hover:bg-red-950/20 transition"
                                    aria-label="Log Out"
                                >
                                    Logout
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Mobile Hamburger Button */}
                    <div className="md:hidden flex items-center gap-2">
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            aria-expanded={isMobileMenuOpen}
                            aria-label="Toggle navigation menu"
                        >
                            <svg
                                className="w-6 h-6"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                {isMobileMenuOpen ? (
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                ) : (
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M4 6h16M4 12h16M4 18h16"
                                    />
                                )}
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu Dropdown */}
            {isMobileMenuOpen && (
                <div className="md:hidden border-t border-slate-800 bg-slate-900 px-4 pt-2 pb-4 space-y-2">
                    <NavLink
                        to="/report"
                        className={mobileLinkStyle}
                        onClick={() => setIsMobileMenuOpen(false)}
                    >
                        📝 Report Issue
                    </NavLink>

                    <NavLink
                        to="/my-reports"
                        className={mobileLinkStyle}
                        onClick={() => setIsMobileMenuOpen(false)}
                    >
                        📋 My Reports
                    </NavLink>

                    <NavLink
                        to="/map"
                        className={mobileLinkStyle}
                        onClick={() => setIsMobileMenuOpen(false)}
                    >
                        🗺️ Community Map
                    </NavLink>

                    <NavLink
                        to="/admin"
                        className={mobileLinkStyle}
                        onClick={() => setIsMobileMenuOpen(false)}
                    >
                        👑 Admin
                    </NavLink>

                    <a
                        href="https://github.com/khuman-dhakad/samadhan-ai"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 text-xs font-semibold text-slate-300 hover:text-white py-2 px-3 rounded-lg border border-slate-800 bg-slate-800/50 hover:bg-slate-800 transition"
                    >
                        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                            <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                        </svg>
                        <span>Star on GitHub</span>
                    </a>

                    <div className="pt-3 border-t border-slate-800">
                        {!user ? (
                            <button
                                onClick={() => {
                                    openAuthDialog();
                                    setIsMobileMenuOpen(false);
                                }}
                                disabled={isSigningIn}
                                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg text-sm"
                            >
                                {isSigningIn ? "Signing In..." : "Sign In"}
                            </button>
                        ) : (
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-slate-300">
                                        {user.displayName || user.email}
                                    </span>
                                </div>
                                <button
                                    onClick={() => {
                                        handleLogout();
                                        setIsMobileMenuOpen(false);
                                    }}
                                    className="text-xs text-red-400 hover:text-red-300 py-1 px-2 border border-red-800 rounded"
                                >
                                    Logout
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </header>
    );
}

export default Navbar;