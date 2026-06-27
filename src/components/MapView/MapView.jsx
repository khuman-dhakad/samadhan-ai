import {
    MapContainer,
    TileLayer,
    Marker,
    useMapEvents,
} from "react-leaflet";

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
}) {
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

                <LocationMarker
                    selectedLocation={selectedLocation}
                    setSelectedLocation={setSelectedLocation}
                />
            </MapContainer>

            {selectedLocation && (
                <div className="mt-4 bg-slate-800 rounded-lg p-4">
                    <p>
                        <strong>Latitude:</strong>{" "}
                        {selectedLocation.lat.toFixed(6)}
                    </p>

                    <p>
                        <strong>Longitude:</strong>{" "}
                        {selectedLocation.lng.toFixed(6)}
                    </p>
                </div>
            )}
        </div>
    );
}

export default MapView;