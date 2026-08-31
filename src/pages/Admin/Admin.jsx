import AdminDashboard from "../../components/AdminDashboard/AdminDashboard";

function Admin() {
    return (
        <main className="min-h-screen bg-slate-950 text-white px-4 sm:px-6 lg:px-8 py-8">
            <div className="max-w-7xl mx-auto space-y-6">
                <div>
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-amber-300 to-orange-400">
                        Municipal Admin Command Center
                    </h1>
                    <p className="text-sm sm:text-base text-slate-400 mt-1">
                        Review reported issues, update resolution status, and manage civic infrastructure tasks.
                    </p>
                </div>

                <AdminDashboard />
            </div>
        </main>
    );
}

export default Admin;