import React, { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { GOOGLE_MAPS_API_KEY, OFFICE_LOCATION } from '../config';
import './RouteMap.css';

function RouteMap({ currentUser, selectedMatch }) {
    const mapRef = useRef(null);
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        if (!currentUser?.pickupLocation || !selectedMatch?.pickupLocation) return;

        const loadMap = async () => {
            const loader = new Loader({
                apiKey: GOOGLE_MAPS_API_KEY,
                version: 'weekly',
                id: "__googleMapsScriptId",
                libraries: ["places"]
            });

            try {
                const google = await loader.load();
                const mapInstance = new google.maps.Map(mapRef.current, {
                    center: { lat: currentUser.pickupLocation.lat, lng: currentUser.pickupLocation.lng },
                    zoom: 12,
                    fullscreenControl: false,
                    mapTypeControl: false,
                    streetViewControl: false,
                    zoomControl: true,
                });

                // Create markers for pickup locations and office
                const driverMarker = new google.maps.Marker({
                    position: { lat: selectedMatch.driverLocation.lat, lng: selectedMatch.driverLocation.lng },
                    map: mapInstance,
                    title: selectedMatch.isCurrentUserDriver ? 'You (Driver)' : `${selectedMatch.name} (Driver)`,
                    label: 'D'
                });

                const passengerMarker = new google.maps.Marker({
                    position: { lat: selectedMatch.passengerLocation.lat, lng: selectedMatch.passengerLocation.lng },
                    map: mapInstance,
                    title: selectedMatch.isCurrentUserDriver ? `${selectedMatch.name} (Passenger)` : 'You (Passenger)',
                    label: 'P'
                });

                const officeMarker = new google.maps.Marker({
                    position: { lat: OFFICE_LOCATION.lat, lng: OFFICE_LOCATION.lng },
                    map: mapInstance,
                    title: 'Office',
                    label: 'O'
                });

                // Create a DirectionsService object
                const directionsService = new google.maps.DirectionsService();
                const directionsRenderer = new google.maps.DirectionsRenderer({
                    map: mapInstance,
                    suppressMarkers: true, // We'll use our own markers
                    polylineOptions: {
                        strokeColor: '#4285F4',
                        strokeWeight: 3
                    }
                });

                // Calculate the route
                directionsService.route({
                    origin: { lat: selectedMatch.driverLocation.lat, lng: selectedMatch.driverLocation.lng },
                    destination: { lat: OFFICE_LOCATION.lat, lng: OFFICE_LOCATION.lng },
                    waypoints: [
                        {
                            location: { lat: selectedMatch.passengerLocation.lat, lng: selectedMatch.passengerLocation.lng },
                            stopover: true,
                        },
                    ],
                    travelMode: google.maps.TravelMode.DRIVING,
                },
                (response, status) => {
                    if (status === 'OK') {
                        directionsRenderer.setDirections(response);

                        // Adjust map bounds to show the entire route
                        const bounds = new google.maps.LatLngBounds();
                        bounds.extend({ lat: selectedMatch.driverLocation.lat, lng: selectedMatch.driverLocation.lng });
                        bounds.extend({ lat: selectedMatch.passengerLocation.lat, lng: selectedMatch.passengerLocation.lng });
                        bounds.extend({ lat: OFFICE_LOCATION.lat, lng: OFFICE_LOCATION.lng });
                        mapInstance.fitBounds(bounds);
                    } else {
                        console.error('Directions request failed:', status);
                    }
                });

                setLoaded(true);
            } catch (error) {
                console.error('Error loading map:', error);
            }
        };

        loadMap();
    }, [currentUser, selectedMatch, OFFICE_LOCATION]);

    if (!currentUser?.pickupLocation || !selectedMatch?.pickupLocation) {
        return <div className="no-route-message">Please select a match to view the route.</div>;
    }

    return (
        <div className="route-map-container" ref={mapRef} />
    );
}

export default RouteMap;