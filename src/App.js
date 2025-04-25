import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { RideshareProvider } from './contexts/RideshareContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import MatchFinder from './pages/MatchFinder';
import PrivateRoute from './components/PrivateRoute';
import './App.css';

function App() {
    return (
        <AuthProvider>
            <RideshareProvider>
                <Router>
                    <div className="app">
                        <Navbar />
                        <div className="container">
                            <Routes>
                                <Route path="/" element={<Home />} />
                                <Route path="/login" element={<Login />} />
                                <Route path="/register" element={<Register />} />
                                <Route
                                    path="/profile"
                                    element={
                                        <PrivateRoute>
                                            <Profile />
                                        </PrivateRoute>
                                    }
                                />
                                <Route
                                    path="/find-matches"
                                    element={
                                        <PrivateRoute>
                                            <MatchFinder />
                                        </PrivateRoute>
                                    }
                                />
                            </Routes>
                        </div>
                    </div>
                </Router>
            </RideshareProvider>
        </AuthProvider>
    );
}

export default App;