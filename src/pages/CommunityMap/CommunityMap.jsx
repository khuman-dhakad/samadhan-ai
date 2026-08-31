import { useState } from "react";
import MapView from "../../components/MapView/MapView";

function CommunityMap() {
    const [priorityFilter, setPriorityFilter] = useState("All");

    return (
        <main className="min-h-screen bg-slate-950 text-white px-4 sm:px-6 lg:px-8 py-8">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header & Controls */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-300">
                            Hyperlocal Community Map
                        </h1>
                        <p className="text-sm sm:text-base text-slate-400 mt-1">
                            Live geotagged visual tracker of verified citizen reports in your neighborhood.
                        </p>
                    </div>

                    {/* Filter Pills */}
                    <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 p-1.5 rounded-xl self-start md:self-auto">
                        <span className="text-xs text-slate-400 font-medium px-2">Priority:</span>
                        {["All", "High", "Medium", "Low"].map((filter) => (
                            <button
                                key={filter}
                                onClick={() => setPriorityFilter(filter)}
                                className={`px-3 py-1 text-xs font-semibold rounded-lg transition ${
                                    priorityFilter === filter
                                        ? filter === "High"
                                            ? "bg-red-600 text-white"
                                            : filter === "Medium"
                                            ? "bg-amber-600 text-white"
                                            : filter === "Low"
                                            ? "bg-purple-600 text-white"
                                            : "bg-blue-600 text-white"
                                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                                }`}
                                aria-label={`Filter by ${filter} priority`}
                            >
                                {filter}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Map Component */}
                <MapView
                    refresh={priorityFilter}
                    showReports={true}
                    height="540px"
                    priorityFilter={priorityFilter}
                />

                {/* Marker Legend & Info Card */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center gap-3">
                        <span className="w-3.5 h-3.5 rounded-full bg-red-500 shadow-md shadow-red-500/50"></span>
                        <div>
                            <p className="text-xs font-bold text-slate-200">High Priority</p>
                            <p className="text-xs text-slate-400">Severe safety hazards, open manholes, active water bursts</p>
                        </div>
                    </div>

                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center gap-3">
                        <span className="w-3.5 h-3.5 rounded-full bg-amber-400 shadow-md shadow-amber-400/50"></span>
                        <div>
                            <p className="text-xs font-bold text-slate-200">Medium Priority</p>
                            <p className="text-xs text-slate-400">Potholes, garbage accumulation, streetlight outages</p>
                        </div>
                    </div>

                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center gap-3">
                        <span className="w-3.5 h-3.5 rounded-full bg-purple-400 shadow-md shadow-purple-400/50"></span>
                        <div>
                            <p className="text-xs font-bold text-slate-200">Low Priority</p>
                            <p className="text-xs text-slate-400">Minor cosmetic damage, overgrown grass, graffiti</p>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}

export default CommunityMap;