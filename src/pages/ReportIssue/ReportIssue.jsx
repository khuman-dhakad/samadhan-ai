import { useState } from "react";
import { analyzeCommunityIssue } from "../../services/gemini/geminiService";
import { fileToBase64 } from "../../utils/fileToBase64";
import { saveIssueReport } from "../../services/firebase/reportService";

function ReportIssue() {
    const [selectedImage, setSelectedImage] = useState(null);
    const [analysis, setAnalysis] = useState(null);


    const handleImageChange = (event) => {
        const file = event.target.files[0];

        if (file) {
            setSelectedImage(file);
        }
    };
const handleAnalyze = async () => {
    if (!selectedImage) {
        alert("Please select an image first");
        return;
    }

    try {
        const base64Image = await fileToBase64(selectedImage);

        const result = await analyzeCommunityIssue(base64Image);

        console.log("RAW RESULT:");
        console.log(result);

        const cleanedResult = result
            .replace(/```json/g, "")
            .replace(/```/g, "")
            .trim();

       const parsedData = JSON.parse(cleanedResult);

setAnalysis(parsedData);
console.log("Before Firestore Save");

const reportId = await saveIssueReport({
    
    ...parsedData,
    imageName: selectedImage.name,
    createdAt: new Date().toISOString(),
});
console.log("Saved Report ID:", reportId);

console.log("Saved Report ID:", reportId);

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
                            <strong>Category:</strong> {analysis.category}
                        </p>

                        <p>
                            <strong>Severity:</strong> {analysis.severity}
                        </p>

                        <p>
                            <strong>Confidence:</strong> {analysis.confidence}%
                        </p>

                        <p>
                            <strong>Risk:</strong> {analysis.risk}
                        </p>

                        <p>
                            <strong>Department:</strong> {analysis.department}
                        </p>

                        <p>
                            <strong>Priority:</strong> {analysis.priority}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default ReportIssue;