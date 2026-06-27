import {
    MapContainer,
    TileLayer,
} from "react-leaflet";

function MapView() {
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
                    attribution='&copy; OpenStreetMap contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
            </MapContainer>
        </div>
    );
}

export default MapView;