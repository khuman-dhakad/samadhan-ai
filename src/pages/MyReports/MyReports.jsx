import MyReports from "../../components/MyReports/MyReports";
import { useAuth } from "../../context/useAuth";

function MyReportsPage() {
    const { user, authLoaded } = useAuth();

    return (
        <main className="min-h-screen bg-slate-950 text-white px-4 sm:px-6 lg:px-8 py-8">
            <div className="max-w-6xl mx-auto space-y-6">
                <div>
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-300">
                        My Civic Reports
                    </h1>
                    <p className="text-sm sm:text-base text-slate-400 mt-1">
                        Monitor the status, severity, and resolution lifecycle of issues you reported.
                    </p>
                </div>

                <MyReports user={user} authLoaded={authLoaded} />
            </div>
        </main>
    );
}

export default MyReportsPage;