import { useState } from "react";
import MapView from "../../components/MapView/MapView";

function CommunityMap() {
    const [selectedLocation, setSelectedLocation] =
        useState(null);

    return (
        <div className="min-h-screen bg-slate-950 text-white p-8">
            <h1 className="text-4xl font-bold mb-8">
                Community Issues Map
            </h1>

            <MapView
                refresh={true}
                showReports={true}
            />
        </div>
    );
}

export default CommunityMap;