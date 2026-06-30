import { NavLink } from "react-router-dom";

function Navbar() {
    const linkStyle = ({ isActive }) =>
        `px-4 py-2 rounded-lg transition ${
            isActive
                ? "bg-blue-600 text-white"
                : "text-gray-300 hover:bg-slate-800 hover:text-white"
        }`;

    return (
        <nav className="sticky top-0 z-50 bg-slate-900 border-b border-slate-700 shadow-lg">
            <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
                <h1 className="text-2xl font-bold text-blue-400">
                    Samadhan AI
                </h1>

                <div className="flex gap-3">
                    <NavLink
                        to="/report"
                        className={linkStyle}
                    >
                        📝 Report
                    </NavLink>

                    <NavLink
                        to="/my-reports"
                        className={linkStyle}
                    >
                        📋 My Reports
                    </NavLink>

                    <NavLink
                        to="/map"
                        className={linkStyle}
                    >
                        🗺️ Community Map
                    </NavLink>

                    <NavLink
                        to="/admin"
                        className={linkStyle}
                    >
                        👑 Admin
                    </NavLink>
                </div>
            </div>
        </nav>
    );
}

export default Navbar;