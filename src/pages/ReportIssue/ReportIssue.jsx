import { useState, useEffect } from "react";
import { analyzeCommunityIssue } from "../../services/gemini/geminiService";
import { fileToBase64 } from "../../utils/fileToBase64";
import { saveIssueReport } from "../../services/firebase/reportService";
import ReportsDashboard from "../../components/ReportsDashboard/ReportsDashboard";
import MyReports from "../../components/MyReports/MyReports";
import AdminDashboard from "../../components/AdminDashboard/AdminDashboard";
import { uploadImage } from "../../services/cloudinary/cloudinaryService";
import MapView from "../../components/MapView/MapView";

import {
    signInWithGoogle,
    logoutUser,
    listenForAuthChanges,
} from "../../services/firebase/authService";

function ReportIssue() {
    const [selectedImage, setSelectedImage] = useState(null);
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [analysis, setAnalysis] = useState(null);
    const [user, setUser] = useState(null);
    const [refreshDashboard, setRefreshDashboard] = useState(false);

    useEffect(() => {
        const unsubscribe = listenForAuthChanges(
            (currentUser) => {
                setUser(currentUser);
            }
        );

        return () => unsubscribe();
    }, []);

    const handleImageChange = (event) => {
        const file = event.target.files[0];

        if (file) {
            setSelectedImage(file);
        }
    };

    const handleGoogleLogin = async () => {
        const loggedInUser = await signInWithGoogle();

        if (loggedInUser) {
            setUser(loggedInUser);
            console.log("Logged In:", loggedInUser);
        }
    };

    const handleLogout = async () => {
        await logoutUser();
        setUser(null);
    };

    const handleAnalyze = async () => {
        if (!selectedImage) {
            alert("Please select an image first");
            return;
        }

        try {
            // ============================
            // STEP 1: Upload Image First
            // ============================
            const imageUrl = await uploadImage(selectedImage);

            console.log("Uploaded Image URL:", imageUrl);

            // ============================
            // STEP 2: Convert Image
            // ============================
            const base64Image = await fileToBase64(selectedImage);

            // ============================
            // STEP 3: Analyze with Gemini
            // ============================
            const result = await analyzeCommunityIssue(base64Image);

            console.log("RAW RESULT:");
            console.log(result);

            const cleanedResult = result
                .replace(/```json/g, "")
                .replace(/```/g, "")
                .trim();

            const parsedData = JSON.parse(cleanedResult);

            setAnalysis(parsedData);

            console.log("Current User:", user);

            // ============================
            // STEP 4: Save Report
            // ============================
            const reportId = await saveIssueReport({
                ...parsedData,

                imageName: selectedImage.name,
                imageUrl,

                createdAt: new Date().toISOString(),

                userId: user?.uid || "anonymous",

                userName:
                    user?.displayName ||
                    "Anonymous User",

                userEmail:
                    user?.email || "",
            });

            console.log("Saved Report ID:", reportId);

            setRefreshDashboard((prev) => !prev);
        } catch (error) {
            console.error(error);
            alert("Analysis Failed");
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-white p-8">
            <h1 className="text-4xl font-bold mb-6">
                Report Community Issue
            </h1>

            <div className="mb-6">
                {!user ? (
                    <button
                        onClick={handleGoogleLogin}
                        className="bg-red-600 px-5 py-2 rounded-lg"
                    >
                        Sign In With Google
                    </button>
                ) : (
                    <div className="border border-green-500 rounded-lg p-4">
                        <p>
                            <strong>Name:</strong>{" "}
                            {user.displayName}
                        </p>

                        <p>
                            <strong>Email:</strong>{" "}
                            {user.email}
                        </p>

                        <button
                            onClick={handleLogout}
                            className="mt-3 bg-red-600 px-4 py-2 rounded-lg"
                        >
                            Logout
                        </button>
                    </div>
                )}
            </div>

            <div className="border border-gray-700 rounded-xl p-6">
                <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="mb-4"
                />

                {selectedImage && (
                    <p className="mb-4 text-green-400">
                        Selected: {selectedImage.name}
                    </p>
                )}

                <button
                    onClick={handleAnalyze}
                    className="bg-blue-600 px-5 py-2 rounded-lg"
                >
                    Analyze Issue
                </button>

                {analysis && (
                    <div className="mt-6 border border-green-500 rounded-xl p-4">
                        <h2 className="text-2xl font-bold mb-3">
                            AI Analysis
                        </h2>

                        <p>
                            <strong>Category:</strong>{" "}
                            {analysis.category}
                        </p>

                        <p>
                            <strong>Severity:</strong>{" "}
                            {analysis.severity}
                        </p>

                        <p>
                            <strong>Confidence:</strong>{" "}
                            {analysis.confidence}%
                        </p>

                        <p>
                            <strong>Risk:</strong>{" "}
                            {analysis.risk}
                        </p>

                        <p>
                            <strong>Department:</strong>{" "}
                            {analysis.department}
                        </p>

                        <p>
                            <strong>Priority:</strong>{" "}
                            {analysis.priority}
                        </p>
                    </div>
                )}
            </div>

            <ReportsDashboard refresh={refreshDashboard} />

            <MyReports
                user={user}
                refresh={refreshDashboard}
            />

            <AdminDashboard />
            <MapView
                selectedLocation={selectedLocation}
                setSelectedLocation={setSelectedLocation}
            />
        </div>
    );
}

export default ReportIssue;