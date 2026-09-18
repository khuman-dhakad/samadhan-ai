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

// Unify default Leaflet marker assets for Vite production bundling
if (L?.Icon?.Default?.prototype?._getIconUrl) {
    delete L.Icon.Default.prototype._getIconUrl;
}
L.Icon.Default.mergeOptions({
    iconRetinaUrl: selectedMarker,
    iconUrl: selectedMarker,
    shadowUrl: markerShadow,
});

function LocationPickerMarker({
    selectedLocation,
    setSelectedLocation,
}) {
    useMapEvents({
        click(e) {
            if (setSelectedLocation && e.latlng) {
                const lat = Number(e.latlng.lat);
                const lng = Number(e.latlng.lng);
                if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
                    setSelectedLocation({ lat, lng });
                }
            }
        },
    });

    if (!selectedLocation || isNaN(selectedLocation.lat) || isNaN(selectedLocation.lng)) {
        return null;
    }

    return (
        <Marker
            position={[selectedLocation.lat, selectedLocation.lng]}
            icon={selectedIcon}
        >
            <Popup>
                <div className="text-slate-900 font-medium text-xs">
                    📍 Selected Location<br />
                    Lat: {selectedLocation.lat.toFixed(5)}<br />
                    Lng: {selectedLocation.lng.toFixed(5)}
                </div>
            </Popup>
        </Marker>
    );
}

function MapView({
    selectedLocation,
    setSelectedLocation,
    refresh,
    showReports = true,
    height = "420px",
    title,
    priorityFilter = "All",
}) {
    const [reports, setReports] = useState([]);

    useEffect(() => {
        if (!showReports) return;
        let isMounted = true;
        getAllReports().then((data) => {
            if (isMounted) {
                setReports(data);
            }
        }).catch((err) => {
            console.error("Error loading map reports:", err);
        });
        return () => {
            isMounted = false;
        };
    }, [showReports, refresh]);

    const getPriorityIcon = (priority) => {
        switch ((priority || "").toLowerCase()) {
            case "high":
            case "critical":
                return highIcon;
            case "medium":
                return mediumIcon;
            case "low":
                return lowIcon;
            default:
                return unknownIcon;
        }
    };

    const validReports = reports.filter((report) => {
        const lat = Number(report.latitude);
        const lng = Number(report.longitude);
        const hasValidCoords = !isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
        const matchesPriority =
            priorityFilter === "All" ||
            (report.priority || "").toLowerCase() === priorityFilter.toLowerCase();
        return hasValidCoords && matchesPriority;
    });

    return (
        <div className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl">
            {title && (
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                        {title}
                    </h2>
                </div>
            )}

            <div className="relative rounded-xl overflow-hidden border border-slate-700/80 shadow-inner">
                <MapContainer
                    center={[23.2599, 77.4126]}
                    zoom={13}
                    style={{
                        height: height,
                        width: "100%",
                        zIndex: 10,
                    }}
                    scrollWheelZoom={false}
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    {showReports &&
                        validReports.map((report) => {
                            const lat = Number(report.latitude);
                            const lng = Number(report.longitude);

                            return (
                                <Marker
                                    key={report.id}
                                    position={[lat, lng]}
                                    icon={getPriorityIcon(report.priority)}
                                >
                                    <Popup>
                                        <div className="text-slate-900 w-56 p-1 text-xs">
                                            <div className="flex items-center justify-between gap-1 mb-1">
                                                <h3 className="font-bold text-sm text-slate-900 truncate">
                                                    {report.category || "Civic Issue"}
                                                </h3>
                                                <span
                                                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                                                        (report.priority || "").toLowerCase() === "high"
                                                            ? "bg-red-100 text-red-700"
                                                            : (report.priority || "").toLowerCase() === "medium"
                                                            ? "bg-yellow-100 text-yellow-800"
                                                            : "bg-purple-100 text-purple-700"
                                                    }`}
                                                >
                                                    {report.priority || "Med"}
                                                </span>
                                            </div>

                                            <p className="text-slate-600 mb-1">
                                                📍 {report.locationName || `${lat.toFixed(4)}, ${lng.toFixed(4)}`}
                                            </p>

                                            <div className="grid grid-cols-2 gap-1 py-1 border-t border-slate-200 text-[11px]">
                                                <div>
                                                    <span className="text-slate-500">Status: </span>
                                                    <span className="font-semibold text-blue-700">{report.status || "Reported"}</span>
                                                </div>
                                                <div>
                                                    <span className="text-slate-500">Dept: </span>
                                                    <span className="font-medium truncate">{report.department || "Municipal"}</span>
                                                </div>
                                            </div>

                                            {report.imageUrl && (
                                                <img
                                                    src={report.imageUrl}
                                                    alt={report.category || "Issue photo"}
                                                    className="w-full h-24 object-cover rounded mt-2 border border-slate-200"
                                                    loading="lazy"
                                                />
                                            )}
                                        </div>
                                    </Popup>
                                </Marker>
                            );
                        })}

                    {setSelectedLocation && (
                        <LocationPickerMarker
                            selectedLocation={selectedLocation}
                            setSelectedLocation={setSelectedLocation}
                        />
                    )}
                </MapContainer>
            </div>

            {selectedLocation && (
                <div className="mt-4 bg-slate-800/80 border border-slate-700 rounded-xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <div>
                        <p className="text-xs text-slate-400 font-medium">Selected Coordinates</p>
                        <p className="text-sm font-mono text-slate-200">
                            Lat: <span className="text-blue-400">{selectedLocation.lat.toFixed(6)}</span> | Lng: <span className="text-blue-400">{selectedLocation.lng.toFixed(6)}</span>
                        </p>
                    </div>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold rounded-full">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                        Location Marked
                    </span>
                </div>
            )}
        </div>
    );
}

export default MapView;