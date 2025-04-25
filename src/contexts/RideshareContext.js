import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { GOOGLE_MAPS_API_KEY, OFFICE_LOCATION } from '../config';
import { Loader } from '@googlemaps/js-api-loader';

export const RideshareContext = createContext();

export function RideshareProvider({ children }) {
    const { currentUser } = useAuth();
    const [users, setUsers] = useState([]);
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(false);
    const [directionsService, setDirectionsService] = useState(null);
    const [google, setGoogle] = useState(null);

    // Initialize Google Maps Directions Service
    useEffect(() => {
        const initDirectionsService = async () => {
            const loader = new Loader({
                apiKey: GOOGLE_MAPS_API_KEY,
                version: 'weekly',
                libraries: ["places"]
            });
            const googleInstance = await loader.load();
            setGoogle(googleInstance);
            setDirectionsService(new googleInstance.maps.DirectionsService());
        };
        initDirectionsService();
    }, []);

    // Load mock users
    useEffect(() => {
        const mockUsers = [
            {
                id: '1',
                name: 'John Doe',
                email: 'john@thoughtworks.com',
                officeSchedule: ['Monday', 'Wednesday', 'Friday'],
                pickupLocation: {
                    address: '123 Main St, Bangalore',
                    lat: OFFICE_LOCATION.lat + 0.02,
                    lng: OFFICE_LOCATION.lng + 0.01
                }
            },
            {
                id: '2',
                name: 'Jane Smith',
                email: 'jane@thoughtworks.com',
                officeSchedule: ['Monday', 'Tuesday', 'Thursday'],
                pickupLocation: {
                    address: '456 Park Ave, Bangalore',
                    lat: OFFICE_LOCATION.lat + 0.03,
                    lng: OFFICE_LOCATION.lng + 0.02
                }
            },
            {
                id: '3',
                name: 'Bob Johnson',
                email: 'bob@thoughtworks.com',
                officeSchedule: ['Tuesday', 'Wednesday', 'Friday'],
                pickupLocation: {
                    address: '789 Oak St, Bangalore',
                    lat: OFFICE_LOCATION.lat - 0.01,
                    lng: OFFICE_LOCATION.lng - 0.02
                }
            },
            {
                id: '4',
                name: 'Alice Brown',
                email: 'alice@thoughtworks.com',
                officeSchedule: ['Monday', 'Wednesday', 'Thursday'],
                pickupLocation: {
                    address: '321 Pine St, Bangalore',
                    lat: OFFICE_LOCATION.lat - 0.02,
                    lng: OFFICE_LOCATION.lng - 0.01
                }
            }
        ];
        setUsers(mockUsers);
    }, []);

    // Initialize matches when context mounts or currentUser changes
    useEffect(() => {
        const initializeMatches = async () => {
            if (currentUser?.pickupLocation && currentUser?.officeSchedule?.length > 0) {
                console.log('Initializing matches for user:', currentUser);
                await findMatches();
            }
        };
        initializeMatches();
    }, [currentUser?.id, currentUser?.pickupLocation?.lat, currentUser?.pickupLocation?.lng]); // Also run when pickup location changes

    // Find potential carpool matches
    const findMatches = async () => {
        console.log('findMatches called with currentUser:', currentUser);
        if (!currentUser || !currentUser.pickupLocation || !currentUser.officeSchedule || currentUser.officeSchedule.length === 0) {
            console.log('Invalid user data for finding matches');
            return [];
        }

        setLoading(true);
        console.log('Finding matches for user:', currentUser);

        // Filter users who have office days that match the current user
        const potentialMatches = users.filter(user => {
            if (user.id === currentUser.id) return false;
            if (!user.pickupLocation) return false;
            if (!user.officeSchedule || user.officeSchedule.length === 0) return false;
            return user.officeSchedule.some(day => currentUser.officeSchedule.includes(day));
        });

        console.log('Potential matches found:', potentialMatches.length);

        // Calculate distances and find optimal matches
        const matchesWithRouteInfo = await Promise.all(
            potentialMatches.map(async (user) => {
                // Scenario 1: Current user as driver
                const route1ToPassenger = await calculateRoadDistance(
                    currentUser.pickupLocation,
                    user.pickupLocation
                );

                const route1ToOffice = await calculateRoadDistance(
                    user.pickupLocation,
                    OFFICE_LOCATION
                );

                // Scenario 2: Match as driver
                const route2ToPassenger = await calculateRoadDistance(
                    user.pickupLocation,
                    currentUser.pickupLocation
                );

                const route2ToOffice = await calculateRoadDistance(
                    currentUser.pickupLocation,
                    OFFICE_LOCATION
                );

                if (!route1ToPassenger || !route1ToOffice || !route2ToPassenger || !route2ToOffice) {
                    return null;
                }

                // Calculate total distances for both scenarios
                const totalDistance1 = route1ToPassenger.distance + route1ToOffice.distance;
                const totalDistance2 = route2ToPassenger.distance + route2ToOffice.distance;

                // Calculate total times for both scenarios
                const totalTime1 = route1ToPassenger.duration + route1ToOffice.duration;
                const totalTime2 = route2ToPassenger.duration + route2ToOffice.duration;

                // Choose the more efficient scenario
                const isScenario2Better = totalDistance2 < totalDistance1;
                const totalDistance = isScenario2Better ? totalDistance2 : totalDistance1;
                const totalTime = isScenario2Better ? totalTime2 : totalTime1;

                // Calculate common days
                const commonDays = user.officeSchedule.filter(day =>
                    currentUser.officeSchedule.includes(day)
                );

                // Calculate match score based on multiple factors
                const matchScore = calculateMatchScore({
                    totalDistance,
                    totalTime,
                    commonDays: commonDays.length,
                    totalDays: currentUser.officeSchedule.length
                });

                return {
                    ...user,
                    isCurrentUserDriver: !isScenario2Better, // If scenario 2 is better, match is driver
                    driverLocation: isScenario2Better ? user.pickupLocation : currentUser.pickupLocation,
                    passengerLocation: isScenario2Better ? currentUser.pickupLocation : user.pickupLocation,
                    totalDistance,
                    totalTime,
                    commonDays,
                    matchScore,
                    routeComparison: {
                        scenario1Distance: totalDistance1,
                        scenario2Distance: totalDistance2,
                        chosenScenario: isScenario2Better ? 2 : 1
                    }
                };
            })
        );

        // Filter out null results and sort by match score
        const validMatches = matchesWithRouteInfo.filter(match => match !== null);
        const sortedMatches = validMatches.sort((a, b) => b.matchScore - a.matchScore);

        console.log('Final matches:', sortedMatches);
        setMatches(sortedMatches);
        setLoading(false);
        return sortedMatches;
    };

    // Calculate actual road distance using Google Maps Directions API
    const calculateRoadDistance = async (origin, destination) => {
        if (!directionsService || !google) return null;

        try {
            const response = await new Promise((resolve, reject) => {
                directionsService.route({
                    origin: { lat: origin.lat, lng: origin.lng },
                    destination: { lat: destination.lat, lng: destination.lng },
                    travelMode: google.maps.TravelMode.DRIVING,
                }, (result, status) => {
                    if (status === 'OK') {
                        resolve(result);
                    } else {
                        reject(new Error('Directions request failed'));
                    }
                });
            });

            // Get distance in kilometers
            const distance = response.routes[0].legs[0].distance.value / 1000;
            const duration = response.routes[0].legs[0].duration.value / 60; // in minutes
            return { distance, duration };
        } catch (error) {
            console.error('Error calculating road distance:', error);
            return null;
        }
    };

    // Calculate a match score based on multiple factors
    const calculateMatchScore = ({ totalDistance, totalTime, commonDays, totalDays }) => {
        // Normalize factors
        const distanceScore = Math.max(0, 1 - (totalDistance / 20)); // Penalize longer distances
        const timeScore = Math.max(0, 1 - (totalTime / 60)); // Penalize longer times
        const scheduleScore = commonDays / totalDays; // Higher score for more common days

        // Weight the factors
        const weights = {
            distance: 0.4,
            time: 0.3,
            schedule: 0.3
        };

        return (
            distanceScore * weights.distance +
            timeScore * weights.time +
            scheduleScore * weights.schedule
        );
    };

    const value = {
        users,
        matches,
        loading,
        findMatches
    };

    return (
        <RideshareContext.Provider value={value}>
            {children}
        </RideshareContext.Provider>
    );
}

export function useRideshare() {
    return useContext(RideshareContext);
}