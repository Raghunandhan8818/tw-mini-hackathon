import React, { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext();

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check local storage for user data
        const userData = localStorage.getItem('user');
        if (userData) {
            setCurrentUser(JSON.parse(userData));
        }
        setLoading(false);
    }, []);

    // Login function
    const login = (email, password) => {
        // In a real app, this would be an API call
        // For demo, we'll use mock data
        const mockUser = {
            id: '123',
            name: 'Test User',
            email: email,
            officeSchedule: [],
            pickupLocation: null
        };

        localStorage.setItem('user', JSON.stringify(mockUser));
        setCurrentUser(mockUser);
        return mockUser;
    };

    // Register function
    const register = (name, email, password) => {
        // In a real app, this would be an API call
        const newUser = {
            id: Date.now().toString(),
            name: name,
            email: email,
            officeSchedule: [],
            pickupLocation: null
        };

        localStorage.setItem('user', JSON.stringify(newUser));
        setCurrentUser(newUser);
        return newUser;
    };

    // Logout function
    const logout = () => {
        localStorage.removeItem('user');
        setCurrentUser(null);
    };

    // Update user profile
    const updateProfile = (userData) => {
        const updatedUser = { ...currentUser, ...userData };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setCurrentUser(updatedUser);
        return updatedUser;
    };

    const value = {
        currentUser,
        login,
        register,
        logout,
        updateProfile
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}