import { useEffect, useState } from "react";
import {
    MapContainer,
    TileLayer,
    Marker,
    Popup,
    useMapEvents,
} from "react-leaflet";

import { getAllReports } from "../../services/firebase/reportService";

function LocationMarker({
    selectedLocation,
    setSelectedLocation,
}) {
    useMapEvents({
        click(event) {
            setSelectedLocation(event.latlng);
        },
    });

    return selectedLocation ? (
        <Marker position={selectedLocation} />
    ) : null;
}

function MapView({
    selectedLocation,
    setSelectedLocation,
    refresh,
}) {
    const [reports, setReports] = useState([]);

    useEffect(() => {
        loadReports();
    }, [refresh]);

    const loadReports = async () => {
        const data = await getAllReports();
        setReports(data);
    };

    return (
        <div className="mt-8 border border-green-500 rounded-xl p-4">
            <h2 className="text-2xl font-bold mb-4">
                Community Issues Map
            </h2>

            <MapContainer
                center={[23.2599, 77.4126]}
                zoom={13}
                style={{
                    height: "500px",
                    width: "100%",
                }}
            >
                <TileLayer
                    attribution="&copy; OpenStreetMap contributors"
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {reports.map((report) => {
                    if (
                        !report.latitude ||
                        !report.longitude
                    ) {
                        return null;
                    }

                    return (
                        <Marker
                            key={report.id}
                            position={[
                                report.latitude,
                                report.longitude,
                            ]}
                        >
                            <Popup>
                                <div className="text-black">
                                    <h3 className="font-bold text-lg">
                                        {report.category}
                                    </h3>

                                    <p className="mt-2">
                                        <strong>📍 Location:</strong>
                                        <br />
                                        {report.locationName}
                                    </p>

                                    <p className="mt-2">
                                        <strong>Priority:</strong>{" "}
                                        {report.priority}
                                    </p>

                                    <p>
                                        <strong>Status:</strong>{" "}
                                        {report.status}
                                    </p>

                                    {report.imageUrl && (
                                        <img
                                            src={report.imageUrl}
                                            alt={report.category}
                                            className="w-40 h-28 object-cover rounded mt-3"
                                        />
                                    )}
                                </div>
                            </Popup>
                        </Marker>
                    );
                })}

                <LocationMarker
                    selectedLocation={selectedLocation}
                    setSelectedLocation={setSelectedLocation}
                />
            </MapContainer>

            {selectedLocation && (
                <div className="mt-4 bg-slate-800 rounded-lg p-4">
                    <p>
                        <strong>Latitude:</strong>{" "}
                        {selectedLocation.lat.toFixed(
                            6
                        )}
                    </p>

                    <p>
                        <strong>Longitude:</strong>{" "}
                        {selectedLocation.lng.toFixed(
                            6
                        )}
                    </p>
                </div>
            )}
        </div>
    );
}

export default MapView;