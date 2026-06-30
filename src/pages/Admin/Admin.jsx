import AdminDashboard from "../../components/AdminDashboard/AdminDashboard";

function Admin() {
    return (
        <div className="min-h-screen bg-slate-950 text-white p-8">
            <h1 className="text-4xl font-bold mb-8">
                Admin Dashboard
            </h1>

            <AdminDashboard />
        </div>
    );
}

export default Admin;