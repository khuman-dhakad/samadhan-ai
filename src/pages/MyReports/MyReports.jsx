import { useEffect, useState } from "react";
import MyReports from "../../components/MyReports/MyReports";
import { listenForAuthChanges } from "../../services/firebase/authService";

function MyReportsPage() {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const unsubscribe = listenForAuthChanges(
            (currentUser) => {
                setUser(currentUser);
            }
        );

        return () => unsubscribe();
    }, []);

    return (
        <div className="min-h-screen bg-slate-950 text-white p-8">
            <h1 className="text-4xl font-bold mb-8">
                My Reports
            </h1>

            <MyReports user={user} />
        </div>
    );
}

export default MyReportsPage;