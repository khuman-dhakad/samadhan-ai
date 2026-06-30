import { Routes, Route, Navigate } from "react-router-dom";

import Navbar from "./components/Navbar/Navbar";

import Home from "./pages/Home/Home";
import ReportIssue from "./pages/ReportIssue/ReportIssue";
import MyReportsPage from "./pages/MyReports/MyReports";
import CommunityMap from "./pages/CommunityMap/CommunityMap";
import Admin from "./pages/Admin/Admin";

function App() {
    return (
        <>
            <Navbar />

            <Routes>
                <Route
                    path="/"
                    element={<Home />}
                />

                <Route
                    path="/report"
                    element={<ReportIssue />}
                />

                <Route
                    path="/my-reports"
                    element={<MyReportsPage />}
                />

                <Route
                    path="/map"
                    element={<CommunityMap />}
                />

                <Route
                    path="/admin"
                    element={<Admin />}
                />

                <Route
                    path="*"
                    element={<Navigate to="/" />}
                />
            </Routes>
        </>
    );
}

export default App;