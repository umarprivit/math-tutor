import { v4 as uuidv4 } from 'uuid';

export type Message = {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    type?: 'text' | 'image';
    imageUrl?: string;
    timestamp: number;
};

export type ApiResponse = {
    explanation: string;
    encouragement: string;
    debug_pipeline?: any;
    error?: string;
};

const getUserId = (): string => {
    let userId = localStorage.getItem('math_tutor_userid');
    if (!userId) {
        userId = uuidv4();
        localStorage.setItem('math_tutor_userid', userId);
    }
    return userId;
};

export const sendMessage = async (
    message: string,
    baseUrl: string
): Promise<Message> => {
    try {
        const cleanBaseUrl = baseUrl.replace(/\/+$/, '');
        const userId = getUserId();

        const response = await fetch(`${cleanBaseUrl}/api/chat`, {
            method: 'POST',
            mode: 'cors',
            credentials: 'omit',
            headers: {
                'Content-Type': 'application/json',
                'ngrok-skip-browser-warning': 'true',
            },
            body: JSON.stringify({ message, userId }),
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }

        const data: ApiResponse = await response.json();

        if (data.error) {
            throw new Error(data.error);
        }

        return {
            id: uuidv4(),
            role: 'assistant',
            content: `${data.explanation}\n\n_${data.encouragement}_`,
            timestamp: Date.now(),
        };
    } catch (error) {
        console.error('API Call Failed:', error);
        return {
            id: uuidv4(),
            role: 'assistant',
            content: `Error: ${error instanceof Error ? error.message : 'Failed to connect to backend.'}`,
            timestamp: Date.now(),
        };
    }
};

export const sendImage = async (
    imageFile: File,
    message: string,
    baseUrl: string
): Promise<Message> => {
    try {
        const cleanBaseUrl = baseUrl.replace(/\/+$/, '');
        const userId = getUserId();

        const formData = new FormData();
        formData.append('image', imageFile);
        formData.append('userId', userId);
        if (message) {
            formData.append('message', message);
        }

        const response = await fetch(`${cleanBaseUrl}/api/analyze`, {
            method: 'POST',
            mode: 'cors',
            credentials: 'omit',
            headers: {
                'ngrok-skip-browser-warning': 'true',
            },
            body: formData,
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }

        const data: ApiResponse = await response.json();

        if (data.error) {
            throw new Error(data.error);
        }

        return {
            id: uuidv4(),
            role: 'assistant',
            content: `${data.explanation}\n\n_${data.encouragement}_`,
            timestamp: Date.now(),
        };
    } catch (error) {
        console.error('API Call Failed:', error);
        return {
            id: uuidv4(),
            role: 'assistant',
            content: `Error: ${error instanceof Error ? error.message : 'Failed to connect to backend.'}`,
            timestamp: Date.now(),
        };
    }
};
