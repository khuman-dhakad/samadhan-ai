import { useEffect, useState } from "react";
import L from "leaflet";
import {
    MapContainer,
    TileLayer,
    Marker,
    Popup,
    useMapEvents,
} from "react-leaflet";

import { getAllReports } from "../../services/firebase/reportService";

import redMarker from "../../assets/markers/red-marker.png";
import yellowMarker from "../../assets/markers/yellow-marker.png";
import violetMarker from "../../assets/markers/violet-marker.png";
import greyMarker from "../../assets/markers/grey-marker.png";
import selectedMarker from "../../assets/markers/selected-marker.png";
import markerShadow from "../../assets/markers/marker-shadow.png";

const createIcon = (iconUrl) =>
    new L.Icon({
        iconUrl,
        shadowUrl: markerShadow,
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
    });

const highIcon = createIcon(redMarker);
const mediumIcon = createIcon(yellowMarker);
const lowIcon = createIcon(violetMarker);
const unknownIcon = createIcon(greyMarker);
const selectedIcon = createIcon(selectedMarker);

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
        <Marker
            position={selectedLocation}
            icon={selectedIcon}
        />
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

    const getPriorityIcon = (priority) => {
        switch (priority) {
            case "High":
                return highIcon;

            case "Medium":
                return mediumIcon;

            case "Low":
                return lowIcon;

            default:
                return unknownIcon;
        }
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
                            icon={getPriorityIcon(
                                report.priority
                            )}
                        >
                            <Popup>
                                <div className="text-black w-48">
                                    <h3 className="text-lg font-bold">
                                        {report.category}
                                    </h3>

                                    <p className="mt-2">
                                        <strong>
                                            📍 Location
                                        </strong>
                                        <br />
                                        {report.locationName}
                                    </p>

                                    <p className="mt-2">
                                        <strong>
                                            Priority:
                                        </strong>{" "}
                                        {report.priority}
                                    </p>

                                    <p>
                                        <strong>
                                            Status:
                                        </strong>{" "}
                                        {report.status}
                                    </p>

                                    <p>
                                        <strong>
                                            Reporter:
                                        </strong>{" "}
                                        {report.userName}
                                    </p>

                                    {report.imageUrl && (
                                        <img
                                            src={
                                                report.imageUrl
                                            }
                                            alt={
                                                report.category
                                            }
                                            className="w-full h-28 object-cover rounded mt-3"
                                        />
                                    )}
                                </div>
                            </Popup>
                        </Marker>
                    );
                })}

                <LocationMarker
                    selectedLocation={selectedLocation}
                    setSelectedLocation={
                        setSelectedLocation
                    }
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