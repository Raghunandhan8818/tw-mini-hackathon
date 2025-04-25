import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useRideshare } from '../contexts/RideshareContext';
import RouteMap from '../components/RouteMap';
import './MatchFinder.css';

function MatchFinder() {
    const { currentUser } = useAuth();
    const { findMatches, matches, loading } = useRideshare();
    const [selectedMatch, setSelectedMatch] = useState(null);
    const [noProfileData, setNoProfileData] = useState(false);

    useEffect(() => {
        console.log('MatchFinder mounted or currentUser changed:', currentUser);
        if (currentUser) {
            const hasProfileData = currentUser.pickupLocation && 
                                 currentUser.officeSchedule && 
                                 currentUser.officeSchedule.length > 0;
            
            console.log('Has profile data:', hasProfileData);
            setNoProfileData(!hasProfileData);
        }
    }, [currentUser]);

    console.log('Current matches:', matches);
    console.log('Loading state:', loading);

    const handleSelectMatch = (match) => {
        setSelectedMatch(match);
    };

    if (noProfileData) {
        return (
            <div className="match-finder-page">
                <div className="no-profile-data">
                    <h1>Complete Your Profile</h1>
                    <p>Please set your pickup location and office schedule to find rideshare matches.</p>
                    <Link to="/profile" className="btn primary-btn">Update Profile</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="match-finder-page">
            <h1>Find Rideshare Partners</h1>

            <div className="match-finder-container">
                <div className="matches-list">
                    <h2>Potential Matches</h2>

                    {loading ? (
                        <div className="loading-matches">Finding matches...</div>
                    ) : matches.length === 0 ? (
                        <div className="no-matches">
                            <p>No matches found. Try updating your profile or check back later.</p>
                        </div>
                    ) : (
                        <ul className="matches">
                            {matches.map(match => (
                                <li
                                    key={match.id}
                                    className={`match-item ${selectedMatch?.id === match.id ? 'selected' : ''}`}
                                    onClick={() => handleSelectMatch(match)}
                                >
                                    <div className="match-info">
                                        <h3>{match.name}</h3>
                                        <p className="match-address">{match.pickupLocation.address}</p>
                                        <div className="match-details">
                                            <p><strong>Distance:</strong> {match.distanceToMatch.toFixed(2)} km from you</p>
                                            <p><strong>Extra distance:</strong> {match.extraDistance.toFixed(2)} km added to your route</p>
                                            <p><strong>Common days:</strong> {match.commonDays.join(', ')}</p>
                                        </div>
                                    </div>
                                    <button className="contact-btn">Contact</button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                <div className="route-visualization">
                    {selectedMatch ? (
                        <RouteMap currentUser={currentUser} selectedMatch={selectedMatch} />
                    ) : (
                        <div className="no-route-selected">
                            <p>Select a match to view the route details</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default MatchFinder;