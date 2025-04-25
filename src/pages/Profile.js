import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import MapPicker from '../components/MapPicker';
import SchedulePicker from '../components/SchedulePicker';

function Profile() {
    const { currentUser, updateProfile } = useAuth();
    const [name, setName] = useState('');
    const [pickupLocation, setPickupLocation] = useState(null);
    const [officeSchedule, setOfficeSchedule] = useState([]);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (currentUser) {
            setName(currentUser.name || '');
            setPickupLocation(currentUser.pickupLocation || null);
            setOfficeSchedule(currentUser.officeSchedule || []);
        }
    }, [currentUser]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!pickupLocation) {
            return setError('Please select your pickup location');
        }

        if (officeSchedule.length === 0) {
            return setError('Please select at least one office day');
        }

        try {
            setError('');
            setSuccess('');
            setLoading(true);

            await updateProfile({
                name,
                pickupLocation,
                officeSchedule
            });

            setSuccess('Profile updated successfully!');

            // Redirect to match finder after a delay
            setTimeout(() => {
                navigate('/find-matches');
            }, 2000);
        } catch (error) {
            setError('Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="profile-page">
            <h1>Your Profile</h1>
            {error && <div className="alert error">{error}</div>}
            {success && <div className="alert success">{success}</div>}

            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="name">Full Name</label>
                    <input
                        type="text"
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Office Schedule</label>
                    <SchedulePicker
                        selectedDays={officeSchedule}
                        onChange={setOfficeSchedule}
                    />
                </div>

                <div className="form-group">
                    <label>Your Pickup Location</label>
                    <p className="helper-text">Click on the map to set your pickup location or search for an address.</p>
                    <MapPicker
                        initialLocation={pickupLocation}
                        onLocationSelect={setPickupLocation}
                    />
                </div>

                {pickupLocation && (
                    <div className="selected-location">
                        <h3>Selected Location</h3>
                        <p>{pickupLocation.address}</p>
                    </div>
                )}

                <button
                    type="submit"
                    className="btn primary-btn"
                    disabled={loading}
                >
                    {loading ? 'Saving...' : 'Save Profile'}
                </button>
            </form>
        </div>
    );
}

export default Profile;
