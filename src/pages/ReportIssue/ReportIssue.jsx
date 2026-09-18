import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { analyzeCommunityIssue, sanitizeAndParseGeminiResponse } from "../../services/gemini/geminiService";
import { fileToBase64 } from "../../utils/fileToBase64";
import { saveIssueReport } from "../../services/firebase/reportService";
import { uploadImage } from "../../services/cloudinary/cloudinaryService";
import MapView from "../../components/MapView/MapView";
import { getLocationName } from "../../services/map/locationService";
import { useAuth } from "../../context/useAuth";

function ReportIssue() {
    const { user, loginWithGoogle, logout } = useAuth();
    const [selectedImage, setSelectedImage] = useState(null);
    const [imagePreviewUrl, setImagePreviewUrl] = useState(null);
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [analysis, setAnalysis] = useState(null);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submissionStep, setSubmissionStep] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [submittedReportId, setSubmittedReportId] = useState(null);

    const fileInputRef = useRef(null);
    const isSubmittingRef = useRef(false);

    // Clean up Object URL on unmount or file change to prevent memory leaks
    useEffect(() => {
        return () => {
            if (imagePreviewUrl) {
                URL.revokeObjectURL(imagePreviewUrl);
            }
        };
    }, [imagePreviewUrl]);

    const handleImageChange = (event) => {
        setErrorMessage("");
        const file = event.target.files?.[0];

        if (!file) return;

        if (!file.type.startsWith("image/")) {
            setErrorMessage("Please select a valid image file (JPEG, PNG, WEBP).");
            return;
        }

        if (file.size > 10 * 1024 * 1024) {
            setErrorMessage("Image file size must be less than 10MB.");
            return;
        }

        if (imagePreviewUrl) {
            URL.revokeObjectURL(imagePreviewUrl);
        }

        setSelectedImage(file);
        setImagePreviewUrl(URL.createObjectURL(file));
    };

    const handleClearImage = () => {
        if (imagePreviewUrl) {
            URL.revokeObjectURL(imagePreviewUrl);
        }
        setSelectedImage(null);
        setImagePreviewUrl(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleGoogleLogin = async () => {
        try {
            await loginWithGoogle();
        } catch (err) {
            console.error("Login error", err);
        }
    };

    const handleLogout = async () => {
        try {
            await logout();
        } catch (err) {
            console.error("Logout error", err);
        }
    };

    const handleSubmit = async (e) => {
        e?.preventDefault();
        setErrorMessage("");

        if (isSubmittingRef.current) return;

        if (!selectedImage) {
            setErrorMessage("Please select or capture a photo of the civic issue.");
            return;
        }

        if (
            !selectedLocation ||
            typeof selectedLocation.lat !== "number" ||
            typeof selectedLocation.lng !== "number" ||
            isNaN(selectedLocation.lat) ||
            isNaN(selectedLocation.lng) ||
            selectedLocation.lat < -90 ||
            selectedLocation.lat > 90 ||
            selectedLocation.lng < -180 ||
            selectedLocation.lng > 180
        ) {
            setErrorMessage("Please pin a valid location on the map (-90..90 lat, -180..180 lng).");
            return;
        }

        isSubmittingRef.current = true;
        setIsSubmitting(true);
        setAnalysis(null);

        try {
            // Step 1: Upload image to Cloudinary CDN
            setSubmissionStep("1/4 Uploading photo to secure cloud storage...");
            const imageUrl = await uploadImage(selectedImage);

            // Step 2: Convert to base64 and analyze with Gemini AI
            setSubmissionStep("2/4 Analyzing issue with Google Gemini AI...");
            const base64Image = await fileToBase64(selectedImage);
            const rawAiResult = await analyzeCommunityIssue(base64Image);
            const parsedData = sanitizeAndParseGeminiResponse(rawAiResult);
            setAnalysis(parsedData);

            // Step 3: Reverse Geocode location
            setSubmissionStep("3/4 Geotagging and resolving street address...");
            const locationName = await getLocationName(
                selectedLocation.lat,
                selectedLocation.lng
            );

            // Step 4: Save Report to Firestore (userEmail is isolated to private metadata)
            setSubmissionStep("4/4 Saving report to community database...");
            const reportData = {
                ...parsedData,
                imageName: selectedImage.name,
                imageUrl,
                latitude: selectedLocation.lat,
                longitude: selectedLocation.lng,
                locationName,
                createdAt: new Date().toISOString(),
                userId: user?.uid || "anonymous",
                userName: user?.displayName || "Anonymous Citizen",
                userEmail: user?.email || "",
                status: "Reported",
            };

            const docId = await saveIssueReport(reportData);
            setSubmittedReportId(docId);
        } catch (error) {
            console.error("Report submission failed:", error);
            setErrorMessage(error?.message || "Failed to submit report. Please check your network and try again.");
        } finally {
            isSubmittingRef.current = false;
            setIsSubmitting(false);
            setSubmissionStep("");
        }
    };

    const handleReset = () => {
        handleClearImage();
        setSelectedLocation(null);
        setAnalysis(null);
        setSubmittedReportId(null);
        setErrorMessage("");
    };

    return (
        <main className="min-h-screen bg-slate-950 text-white px-4 sm:px-6 lg:px-8 py-8">
            <div className="max-w-4xl mx-auto space-y-8">
                {/* Header */}
                <div>
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-300">
                        Report a Civic Issue
                    </h1>
                    <p className="text-sm sm:text-base text-slate-400 mt-1">
                        Upload an image and pinpoint the defect. Gemini AI will automatically categorize, estimate severity, and route to municipal authorities.
                    </p>
                </div>

                {/* User Auth Banner */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 shadow-md">
                    <div className="flex items-center gap-3">
                        <span className="text-2xl">👤</span>
                        <div>
                            <p className="text-xs text-slate-400 font-medium">Reporting As</p>
                            <p className="text-sm font-semibold text-slate-200">
                                {user ? (user.displayName || user.email) : "Guest Citizen (Anonymous)"}
                            </p>
                        </div>
                    </div>

                    {!user ? (
                        <button
                            type="button"
                            onClick={handleGoogleLogin}
                            className="text-xs font-semibold bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 px-3 py-1.5 rounded-lg transition"
                        >
                            Sign In with Google for Report Tracking
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={handleLogout}
                            className="text-xs text-slate-400 hover:text-red-400 px-3 py-1.5 rounded-lg border border-slate-800 hover:border-red-900/50 transition"
                        >
                            Switch Account
                        </button>
                    )}
                </div>

                {/* Success Modal / Banner */}
                {submittedReportId && (
                    <div className="bg-emerald-950/40 border border-emerald-500/50 rounded-2xl p-6 sm:p-8 space-y-4 text-center shadow-2xl">
                        <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center text-3xl mx-auto">
                            ✓
                        </div>
                        <h2 className="text-2xl font-bold text-emerald-300">
                            Issue Reported Successfully!
                        </h2>
                        <p className="text-slate-300 text-sm max-w-md mx-auto">
                            Your civic report has been verified by Gemini AI, geotagged, and submitted for municipal resolution.
                        </p>

                        {analysis && (
                            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 text-left max-w-lg mx-auto text-xs space-y-1.5">
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Category:</span>
                                    <span className="font-semibold text-slate-200">{analysis.category}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Priority & Severity:</span>
                                    <span className="font-semibold text-amber-400">{analysis.priority} ({analysis.severity})</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Department:</span>
                                    <span className="font-semibold text-cyan-400">{analysis.department}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-400">AI Confidence:</span>
                                    <span className="font-semibold text-emerald-400">{analysis.confidence}%</span>
                                </div>
                            </div>
                        )}

                        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                            <Link
                                to="/map"
                                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl shadow transition"
                            >
                                🗺️ View on Community Map
                            </Link>
                            <Link
                                to="/my-reports"
                                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl border border-slate-700 transition"
                            >
                                📋 Track in My Reports
                            </Link>
                            <button
                                type="button"
                                onClick={handleReset}
                                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white font-medium text-xs rounded-xl border border-slate-800 transition"
                            >
                                ➕ Report Another Issue
                            </button>
                        </div>
                    </div>
                )}

                {!submittedReportId && (
                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Error Alert */}
                        {errorMessage && (
                            <div className="bg-red-950/40 border border-red-500/50 rounded-xl p-4 text-sm text-red-200 flex items-start gap-3">
                                <span className="text-lg">⚠️</span>
                                <div>
                                    <p className="font-semibold">Action Required</p>
                                    <p className="text-xs text-red-300 mt-0.5">{errorMessage}</p>
                                </div>
                            </div>
                        )}

                        {/* Step 1: Photo Upload Section */}
                        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
                            <div className="flex justify-between items-center">
                                <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                                    <span>📸</span> Step 1: Select or Capture Photo
                                </h2>
                                {selectedImage && (
                                    <button
                                        type="button"
                                        onClick={handleClearImage}
                                        className="text-xs text-red-400 hover:text-red-300 font-medium"
                                    >
                                        Remove Photo
                                    </button>
                                )}
                            </div>

                            {!imagePreviewUrl ? (
                                <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-700 hover:border-blue-500/60 rounded-xl p-8 cursor-pointer bg-slate-950/50 hover:bg-slate-800/40 transition group">
                                    <div className="w-12 h-12 rounded-full bg-blue-600/10 text-blue-400 flex items-center justify-center text-2xl group-hover:scale-110 transition mb-3">
                                        📁
                                    </div>
                                    <p className="text-sm font-semibold text-slate-200">
                                        Click to browse or drop issue photo
                                    </p>
                                    <p className="text-xs text-slate-500 mt-1">
                                        JPEG, PNG, or WEBP up to 10MB
                                    </p>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="hidden"
                                        aria-label="Upload issue image"
                                    />
                                </label>
                            ) : (
                                <div className="relative rounded-xl overflow-hidden border border-slate-700 max-h-80 bg-black flex items-center justify-center">
                                    <img
                                        src={imagePreviewUrl}
                                        alt="Issue preview"
                                        className="max-h-80 object-contain w-auto rounded-lg"
                                    />
                                    <div className="absolute bottom-2 left-2 bg-slate-900/90 backdrop-blur px-3 py-1 rounded-md text-xs text-slate-300 border border-slate-700">
                                        {selectedImage?.name} ({(selectedImage.size / 1024).toFixed(0)} KB)
                                    </div>
                                </div>
                            )}
                        </section>

                        {/* Step 2: Location Selector Map */}
                        <section className="space-y-2">
                            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2 px-1">
                                <span>📍</span> Step 2: Pin Location on Map
                            </h2>
                            <p className="text-xs text-slate-400 px-1">
                                Click anywhere on the map to place the green pin on the exact location of the civic issue.
                            </p>
                            <MapView
                                selectedLocation={selectedLocation}
                                setSelectedLocation={setSelectedLocation}
                                refresh={true}
                                showReports={false}
                                height="340px"
                            />
                        </section>

                        {/* Submit Action Button */}
                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={isSubmitting || !selectedImage || !selectedLocation}
                                className="w-full py-4 rounded-xl font-bold text-base text-white bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-600/25 transition duration-150 flex items-center justify-center gap-3"
                                aria-label="Submit Issue Report"
                            >
                                {isSubmitting ? (
                                    <>
                                        <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24" fill="none">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                                        </svg>
                                        <span>{submissionStep || "Processing..."}</span>
                                    </>
                                ) : (
                                    <>
                                        <span>🚀</span>
                                        <span>Analyze & Submit Civic Report</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </main>
    );
}

export default ReportIssue;