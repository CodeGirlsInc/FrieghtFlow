import { useAuthStore } from '@/store/useAuthStore';
import React from 'react';

const UserProfile: React.FC = () => {
    const { isAuthenticated, user, logout } = useAuthStore();

    if (!isAuthenticated) {
        return <div>Please log in.</div>;
    }

    return (
        <div>
            <h1>Welcome, {user?.name}!</h1>
            <p>Email: {user?.email}</p>
            <button onClick={logout}>Logout</button>
        </div>
    );
};

export default UserProfile;