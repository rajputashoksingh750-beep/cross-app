// Mock data for the CROSS app demo
export interface VideoInvite {
    id: string;
    user: {
        name: string;
        avatar: string;
        verified: boolean;
        age: number;
    };
    description: string;
    location: string;
    city: string;
    tags: string[];
    whoCanJoin: 'Anyone' | 'Only Girls' | 'Only Boys';
    groupSize: number;
    joinedCount: number;
    createdAt: Date;
    expiresAt: Date;
    thumbnailColor: string;
}

export interface MapPin {
    id: string;
    user: {
        name: string;
        avatar: string;
    };
    note: string;
    latitude: number;
    longitude: number;
    createdAt: Date;
    expiresAt: Date;
    hasPhoto: boolean;
}

export interface NearbyUser {
    id: string;
    name: string;
    avatar: string;
    latitude: number;
    longitude: number;
    openUntil: Date;
}

const now = new Date();
const twoHoursLater = new Date(now.getTime() + 2 * 60 * 60 * 1000);
const oneHourLater = new Date(now.getTime() + 1 * 60 * 60 * 1000);
const thirtyMinLater = new Date(now.getTime() + 30 * 60 * 1000);

export const MOCK_VIDEOS: VideoInvite[] = [
    {
        id: '1',
        user: { name: 'Arjun Patel', avatar: '🧑🏽', verified: true, age: 24 },
        description: 'Sitting at CCD, bored AF. Anyone into startup discussions? Let\'s brainstorm over coffee ☕',
        location: 'CCD, Vesu',
        city: 'Surat',
        tags: ['☕ Coffee', '🚀 Startup Talk'],
        whoCanJoin: 'Anyone',
        groupSize: 3,
        joinedCount: 1,
        createdAt: new Date(now.getTime() - 25 * 60 * 1000),
        expiresAt: twoHoursLater,
        thumbnailColor: '#6C63FF',
    },
    {
        id: '2',
        user: { name: 'Priya Sharma', avatar: '👩🏻', verified: true, age: 22 },
        description: 'Want to jam at the park! Bring your guitar or just vibe with me 🎵',
        location: 'Sarthana Nature Park',
        city: 'Surat',
        tags: ['🎵 Music', '🌍 Culture'],
        whoCanJoin: 'Anyone',
        groupSize: 5,
        joinedCount: 2,
        createdAt: new Date(now.getTime() - 40 * 60 * 1000),
        expiresAt: twoHoursLater,
        thumbnailColor: '#FF6584',
    },
    {
        id: '3',
        user: { name: 'Ravi Kumar', avatar: '👨🏾', verified: true, age: 26 },
        description: 'Looking for gym buddy at Gold\'s Gym. Let\'s crush leg day together 💪',
        location: 'Gold\'s Gym, Adajan',
        city: 'Surat',
        tags: ['🏋️ Fitness'],
        whoCanJoin: 'Only Boys',
        groupSize: 1,
        joinedCount: 0,
        createdAt: new Date(now.getTime() - 10 * 60 * 1000),
        expiresAt: twoHoursLater,
        thumbnailColor: '#4ADE80',
    },
    {
        id: '4',
        user: { name: 'Meera Joshi', avatar: '👩🏽', verified: true, age: 23 },
        description: 'Street food hunt! Let\'s try all the golas and pav bhaji near station 🍕',
        location: 'Surat Station Area',
        city: 'Surat',
        tags: ['🍕 Food', '✈️ Travel'],
        whoCanJoin: 'Anyone',
        groupSize: 4,
        joinedCount: 3,
        createdAt: new Date(now.getTime() - 55 * 60 * 1000),
        expiresAt: oneHourLater,
        thumbnailColor: '#FBBF24',
    },
    {
        id: '5',
        user: { name: 'Karan Singh', avatar: '🧔🏻', verified: false, age: 25 },
        description: 'Photography walk along Tapi riverfront at sunset 📷 Bring your camera!',
        location: 'Tapi Riverfront',
        city: 'Surat',
        tags: ['📷 Photography', '🎨 Art'],
        whoCanJoin: 'Anyone',
        groupSize: 3,
        joinedCount: 0,
        createdAt: new Date(now.getTime() - 5 * 60 * 1000),
        expiresAt: twoHoursLater,
        thumbnailColor: '#38BDF8',
    },
];

export const MOCK_MAP_PINS: MapPin[] = [
    {
        id: 'p1',
        user: { name: 'Aisha', avatar: '👩🏻' },
        note: 'Met an amazing guitarist here yesterday! If you\'re reading this, let\'s connect 🎸',
        latitude: 21.1702,
        longitude: 72.8311,
        createdAt: new Date(now.getTime() - 12 * 60 * 60 * 1000),
        expiresAt: new Date(now.getTime() + 36 * 60 * 60 * 1000),
        hasPhoto: false,
    },
    {
        id: 'p2',
        user: { name: 'Vikram', avatar: '🧑🏽' },
        note: 'Great co-working spot with fast WiFi. Anyone wants to build something here? 💻',
        latitude: 21.1860,
        longitude: 72.7944,
        createdAt: new Date(now.getTime() - 6 * 60 * 60 * 1000),
        expiresAt: new Date(now.getTime() + 42 * 60 * 60 * 1000),
        hasPhoto: true,
    },
    {
        id: 'p3',
        user: { name: 'Neha', avatar: '👩🏾' },
        note: 'Best chai in Surat! Come try it. I\'m here every evening at 5pm ☕',
        latitude: 21.1950,
        longitude: 72.8200,
        createdAt: new Date(now.getTime() - 3 * 60 * 60 * 1000),
        expiresAt: new Date(now.getTime() + 45 * 60 * 60 * 1000),
        hasPhoto: false,
    },
];

export const MOCK_NEARBY_USERS: NearbyUser[] = [
    { id: 'n1', name: 'Ankit', avatar: '🧑🏻', latitude: 21.1710, longitude: 72.8315, openUntil: thirtyMinLater },
    { id: 'n2', name: 'Sara', avatar: '👩🏼', latitude: 21.1690, longitude: 72.8290, openUntil: thirtyMinLater },
    { id: 'n3', name: 'Dev', avatar: '👨🏽', latitude: 21.1720, longitude: 72.8340, openUntil: thirtyMinLater },
];

export const MOCK_USER_PROFILE = {
    name: 'Ashok Singh',
    avatar: '🧑🏽',
    city: 'Surat',
    verified: true,
    joinedDate: '2026-01-15',
    totalInvites: 12,
    totalJoins: 8,
    pastInvites: [
        { id: 'h1', description: 'Coffee chat at CCD', date: '2026-02-27', joined: 3 },
        { id: 'h2', description: 'Startup brainstorm session', date: '2026-02-25', joined: 2 },
        { id: 'h3', description: 'Evening walk at Dumas beach', date: '2026-02-22', joined: 5 },
    ],
};
