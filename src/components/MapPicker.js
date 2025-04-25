import React, { useState, useEffect, useRef } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { GOOGLE_MAPS_API_KEY, OFFICE_LOCATION } from '../config';

function MapPicker({ initialLocation, onLocationSelect }) {
    const mapRef = useRef(null);
    const [map, setMap] = useState(null);
    const [marker, setMarker] = useState(null);
    const [address, setAddress] = useState('');
    const [showMap, setShowMap] = useState(false);

    useEffect(() => {
        if (initialLocation?.address) {
            setAddress(initialLocation.address);
        }
    }, [initialLocation]);

    const initializeMap = async () => {
        const loader = new Loader({
            apiKey: GOOGLE_MAPS_API_KEY,
            version: 'weekly',
            libraries: ['places']
        });

        try {
            const google = await loader.load();
            const center = initialLocation ?
                { lat: initialLocation.lat, lng: initialLocation.lng } :
                { lat: OFFICE_LOCATION.lat, lng: OFFICE_LOCATION.lng };

            const mapInstance = new google.maps.Map(mapRef.current, {
                center: center,
                zoom: 13,
            });

            const geocoder = new google.maps.Geocoder();
            let markerInstance;

            if (initialLocation) {
                markerInstance = new google.maps.Marker({
                    position: center,
                    map: mapInstance,
                    draggable: true,
                });
            }

            // Add click event to map
            mapInstance.addListener('click', (e) => {
                const clickedLocation = e.latLng;

                if (markerInstance) {
                    markerInstance.setPosition(clickedLocation);
                } else {
                    markerInstance = new google.maps.Marker({
                        position: clickedLocation,
                        map: mapInstance,
                        draggable: true,
                    });
                    setMarker(markerInstance);
                }

                // Get address from coordinates
                geocoder.geocode({ location: clickedLocation }, (results, status) => {
                    if (status === 'OK' && results[0]) {
                        const addressText = results[0].formatted_address;
                        setAddress(addressText);
                        onLocationSelect({
                            lat: clickedLocation.lat(),
                            lng: clickedLocation.lng(),
                            address: addressText
                        });
                    }
                });
            });

            // Add search box
            const input = document.getElementById('address-input');
            const searchBox = new google.maps.places.SearchBox(input);

            mapInstance.controls[google.maps.ControlPosition.TOP_CENTER].push(input);

            searchBox.addListener('places_changed', () => {
                const places = searchBox.getPlaces();

                if (places.length === 0) return;

                const place = places[0];
                if (!place.geometry || !place.geometry.location) return;

                // Set map center to search result
                mapInstance.setCenter(place.geometry.location);

                // Create or update marker
                if (markerInstance) {
                    markerInstance.setPosition(place.geometry.location);
                } else {
                    markerInstance = new google.maps.Marker({
                        position: place.geometry.location,
                        map: mapInstance,
                        draggable: true,
                    });
                    setMarker(markerInstance);
                }

                setAddress(place.formatted_address);
                onLocationSelect({
                    lat: place.geometry.location.lat(),
                    lng: place.geometry.location.lng(),
                    address: place.formatted_address
                });
            });

            setMap(mapInstance);
            setMarker(markerInstance);
        } catch (error) {
            console.error('Error loading Google Maps:', error);
        }
    };

    const handleShowMap = () => {
        setShowMap(true);
        setTimeout(initializeMap, 100);
    };

    return (
        <div className="map-picker">
            <div className="address-search">
                <input
                    id="address-input"
                    type="text"
                    placeholder="Search for an address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="address-input"
                />
            </div>

            {!showMap ? (
                <button onClick={handleShowMap} className="show-map-btn">Show Map</button>
            ) : (
                <div ref={mapRef} className="map-container" style={{ width: '100%', height: '400px' }}></div>
            )}
        </div>
    );
}

export default MapPicker;