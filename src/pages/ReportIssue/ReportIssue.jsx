import { useState, useEffect } from "react";
import { analyzeCommunityIssue } from "../../services/gemini/geminiService";
import { fileToBase64 } from "../../utils/fileToBase64";
import { saveIssueReport } from "../../services/firebase/reportService";
import { uploadImage } from "../../services/cloudinary/cloudinaryService";
import MapView from "../../components/MapView/MapView";
import { getLocationName } from "../../services/map/locationService";

import {
    signInWithGoogle,
    logoutUser,
    listenForAuthChanges,
} from "../../services/firebase/authService";

function ReportIssue() {
    const [selectedImage, setSelectedImage] = useState(null);
    const [selectedLocation, setSelectedLocation] =
        useState(null);
    const [analysis, setAnalysis] = useState(null);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const unsubscribe =
            listenForAuthChanges(
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
        const loggedInUser =
            await signInWithGoogle();

        if (loggedInUser) {
            setUser(loggedInUser);
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

        if (!selectedLocation) {
            alert(
                "Please select a location on the map"
            );
            return;
        }

        try {
            const imageUrl =
                await uploadImage(selectedImage);

            const base64Image =
                await fileToBase64(selectedImage);

            const result =
                await analyzeCommunityIssue(
                    base64Image
                );

            const cleanedResult = result
                .replace(/```json/g, "")
                .replace(/```/g, "")
                .trim();

            const parsedData =
                JSON.parse(cleanedResult);

            const locationName =
                await getLocationName(
                    selectedLocation.lat,
                    selectedLocation.lng
                );

            setAnalysis(parsedData);

            const reportData = {
                ...parsedData,

                imageName:
                    selectedImage.name,

                imageUrl,

                latitude:
                    selectedLocation.lat,

                longitude:
                    selectedLocation.lng,

                locationName,

                createdAt:
                    new Date().toISOString(),

                userId:
                    user?.uid ||
                    "anonymous",

                userName:
                    user?.displayName ||
                    "Anonymous User",

                userEmail:
                    user?.email || "",
            };

            await saveIssueReport(
                reportData
            );

            alert(
                "Report submitted successfully!"
            );
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

            {/* Google Login */}
            <div className="mb-6">
                {!user ? (
                    <button
                        onClick={handleGoogleLogin}
                        className="bg-red-600 hover:bg-red-700 px-5 py-2 rounded-lg"
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
                            className="mt-3 bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg"
                        >
                            Logout
                        </button>
                    </div>
                )}
            </div>

            {/* Upload Section */}
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
                    className="bg-blue-600 hover:bg-blue-700 px-5 py-2 rounded-lg"
                >
                    Analyze Issue
                </button>

                {analysis && (
                    <div className="mt-6 border border-green-500 rounded-xl p-4">

                        <h2 className="text-2xl font-bold mb-4">
                            AI Analysis
                        </h2>

                        <div className="space-y-2">

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
                    </div>
                )}
            </div>

            {/* Community Map */}
            <MapView
                selectedLocation={selectedLocation}
                setSelectedLocation={setSelectedLocation}
                refresh={true}
                showReports={false}
            />
        </div>
    );
}

export default ReportIssue;