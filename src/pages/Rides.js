import React, { useState, useEffect } from 'react';
import { GoogleMap, LoadScript, Marker, DirectionsRenderer } from '@react-google-maps/api';
import './Rides.css';

const Rides = () => {
    const [matches, setMatches] = useState([]);
    const [selectedMatch, setSelectedMatch] = useState(null);
    const [directions, setDirections] = useState(null);

    // Mock data - replace with actual API call
    useEffect(() => {
        // This would be replaced with an actual API call to get matches
        const mockMatches = [
            {
                id: 1,
                name: 'John Doe',
                pickupLocation: { lat: 12.934533, lng: 77.626579 },
                officeDays: ['Monday', 'Wednesday', 'Friday'],
                distance: '2.5 km'
            },
            {
                id: 2,
                name: 'Jane Smith',
                pickupLocation: { lat: 12.944533, lng: 77.636579 },
                officeDays: ['Monday', 'Wednesday', 'Friday'],
                distance: '3.1 km'
            }
        ];
        setMatches(mockMatches);
    }, []);

    const calculateRoute = (match) => {
        const directionsService = new window.google.maps.DirectionsService();
        
        directionsService.route(
            {
                origin: match.pickupLocation,
                destination: { lat: 12.934533, lng: 77.626579 }, // Office location
                travelMode: window.google.maps.TravelMode.DRIVING,
            },
            (result, status) => {
                if (status === window.google.maps.DirectionsStatus.OK) {
                    setDirections(result);
                }
            }
        );
    };

    const handleMatchSelect = (match) => {
        setSelectedMatch(match);
        calculateRoute(match);
    };

    return (
        <div className="rides-container">
            <h1>Find Ride Matches</h1>
            
            <div className="rides-content">
                <div className="matches-list">
                    <h2>Potential Matches</h2>
                    {matches.map(match => (
                        <div 
                            key={match.id} 
                            className={`match-card ${selectedMatch?.id === match.id ? 'selected' : ''}`}
                            onClick={() => handleMatchSelect(match)}
                        >
                            <h3>{match.name}</h3>
                            <p>Distance: {match.distance}</p>
                            <p>Office Days: {match.officeDays.join(', ')}</p>
                        </div>
                    ))}
                </div>

                <div className="map-container">
                    <LoadScript googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}>
                        <GoogleMap
                            mapContainerStyle={{ width: '100%', height: '100%' }}
                            center={{ lat: 12.934533, lng: 77.626579 }}
                            zoom={12}
                        >
                            {matches.map(match => (
                                <Marker
                                    key={match.id}
                                    position={match.pickupLocation}
                                    title={match.name}
                                />
                            ))}
                            {directions && <DirectionsRenderer directions={directions} />}
                        </GoogleMap>
                    </LoadScript>
                </div>
            </div>
        </div>
    );
};

export default Rides; 