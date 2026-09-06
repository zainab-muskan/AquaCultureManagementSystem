"use client";

import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import "leaflet-defaulticon-compatibility";
import { LocateFixed } from "lucide-react";

// Component to handle map clicks and move the marker
function LocationMarker({ position, setPosition, onLocationSelect }) {
    useMapEvents({
        click(e) {
            setPosition(e.latlng);
            onLocationSelect(e.latlng);
        },
    });

    return position === null ? null : (
        <Marker position={position}></Marker>
    );
}

// Component to fly to the user's location when they click the button
function FlyToCurrentLocation({ targetPosition }) {
    const map = useMap();
    useEffect(() => {
        if (targetPosition) {
            map.flyTo(targetPosition, 14, { animate: true });
        }
    }, [targetPosition, map]);
    return null;
}

// Component to fix grey map tiles issue when map is loaded inside a modal or animated container
function MapResizer() {
    const map = useMap();
    useEffect(() => {
        // Trigger invalidateSize and window resize to force tile loading
        const fixMap = () => {
            if (map) {
                map.invalidateSize();
                window.dispatchEvent(new Event('resize'));
            }
        };

        const timers = [50, 250, 500, 1000].map(delay => setTimeout(fixMap, delay));
        return () => timers.forEach(clearTimeout);
    }, [map]);
    return null;
}

const LocationPickerMap = ({ onLocationSelect }) => {
    // Default center to Pakistan area roughly
    const defaultCenter = [30.3753, 69.3451];
    const [position, setPosition] = useState(null);
    const [mapCenter, setMapCenter] = useState(defaultCenter);
    const [isLocating, setIsLocating] = useState(false);
    const [mapReady, setMapReady] = useState(false);

    useEffect(() => {
        // Wait for modal animation to finish before rendering the map
        // This guarantees Leaflet calculates the correct container size
        const timer = setTimeout(() => {
            setMapReady(true);
        }, 150);
        return () => clearTimeout(timer);
    }, []);

    const handleLocateMe = () => {
        setIsLocating(true);

        if (!window.isSecureContext) {
            alert("Auto-location requires a secure connection (HTTPS or localhost). Since you are accessing via local IP, please drop the pin manually on the map.");
            setIsLocating(false);
            return;
        }

        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const newPos = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                    setMapCenter(newPos);
                    setPosition(newPos);
                    onLocationSelect(newPos);
                    setIsLocating(false);
                },
                (err) => {
                    let errMsg = "Unable to retrieve your location. Please drop the pin manually.";
                    if (err.code === err.PERMISSION_DENIED) {
                        errMsg = "Location permission was denied. Please drop the pin manually.";
                    } else if (err.code === err.POSITION_UNAVAILABLE) {
                        errMsg = "Location information is unavailable. Please check your device GPS.";
                    } else if (err.code === err.TIMEOUT) {
                        errMsg = "Location request timed out. Please try again or drop the pin manually.";
                    }
                    alert(errMsg);
                    setIsLocating(false);
                },
                { timeout: 10000, enableHighAccuracy: true }
            );
        } else {
            alert("Geolocation is not supported by your browser");
            setIsLocating(false);
        }
    };

    return (
        <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-gray-700">
                    Farm Location (Optional but recommended)
                </label>
                <button
                    type="button"
                    onClick={handleLocateMe}
                    disabled={isLocating}
                    className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 font-medium bg-blue-50 px-2 py-1 rounded transition disabled:opacity-50"
                >
                    <LocateFixed size={14} />
                    {isLocating ? "Detecting..." : "Find My Location"}
                </button>
            </div>

            <p className="text-xs text-gray-500 mb-1">Click on the map to drop a pin where your farm is located.</p>

            <div className="h-48 w-full rounded-lg overflow-hidden border border-gray-300 shadow-sm relative z-0 bg-gray-100 flex items-center justify-center">
                {mapReady ? (
                    <MapContainer center={defaultCenter} zoom={5} style={{ height: "100%", width: "100%", zIndex: 0 }}>
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <LocationMarker position={position} setPosition={setPosition} onLocationSelect={onLocationSelect} />
                        <FlyToCurrentLocation targetPosition={mapCenter !== defaultCenter ? mapCenter : null} />
                    </MapContainer>
                ) : (
                    <span className="text-xs text-gray-400 font-medium animate-pulse">Loading map...</span>
                )}
            </div>
            {position && (
                <p className="text-xs text-green-600 font-medium">Location selected successfully.</p>
            )}
        </div>
    );
};

export default LocationPickerMap;
