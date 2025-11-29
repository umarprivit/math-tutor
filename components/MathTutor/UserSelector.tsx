import React from 'react';
import { Users } from 'lucide-react';

interface UserSelectorProps {
    currentUserId: string;
    onUserChange: (userId: string) => void;
}

const USERS = [
    { id: 'user_1', name: 'Demo User 1' },
    { id: 'user_2', name: 'Demo User 2' },
    { id: 'user_3', name: 'Demo User 3' },
];

export const UserSelector: React.FC<UserSelectorProps> = ({ currentUserId, onUserChange }) => {
    return (
        <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg">
            <Users className="w-4 h-4 text-gray-500 ml-2" />
            <div className="flex gap-1">
                {USERS.map((user) => (
                    <button
                        key={user.id}
                        onClick={() => onUserChange(user.id)}
                        className={`
                            px-3 py-1 text-sm rounded-md transition-colors
                            ${currentUserId === user.id
                                ? 'bg-white text-black shadow-sm font-medium'
                                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200'}
                        `}
                    >
                        {user.name}
                    </button>
                ))}
            </div>
        </div>
    );
};
