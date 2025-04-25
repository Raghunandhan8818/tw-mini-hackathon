import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function Home() {
    const { currentUser } = useAuth();

    return (
        <div className="home-page">
            <div className="hero-section">
                <h1>Welcome to Thoughtworks Rideshare</h1>
                <p>Save money, reduce your carbon footprint, and connect with colleagues by sharing your commute.</p>

                {currentUser ? (
                    <div className="action-buttons">
                        <Link to="/profile" className="btn primary-btn">Update Profile</Link>
                        <Link to="/find-matches" className="btn secondary-btn">Find Rideshare Matches</Link>
                    </div>
                ) : (
                    <div className="action-buttons">
                        <Link to="/register" className="btn primary-btn">Get Started</Link>
                        <Link to="/login" className="btn secondary-btn">Login</Link>
                    </div>
                )}
            </div>

            <div className="features-section">
                <h2>How It Works</h2>
                <div className="features-grid">
                    <div className="feature-card">
                        <div className="feature-icon">📝</div>
                        <h3>Create Your Profile</h3>
                        <p>Set your home location and which days you come to the office.</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">🔍</div>
                        <h3>Find Matches</h3>
                        <p>Our system finds colleagues with similar commutes and schedules.</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">🚗</div>
                        <h3>Share Rides</h3>
                        <p>Connect with your matches to coordinate rides and save money.</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">💰</div>
                        <h3>Save Money</h3>
                        <p>Split costs and reduce your transportation expenses.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Home;