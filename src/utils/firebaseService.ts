import { collection, addDoc, getDocs, query, orderBy, where } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { db, storage } from './firebase';

export interface InviteData {
    userId: string;
    userName: string;
    userAvatar: string;
    location: string;
    city: string;
    tags: string[];
    whoCanJoin: string;
    groupSize: number;
    joinedCount: number;
    expiresAt: number; // timestamp
    createdAt: number; // timestamp
    videoUrl: string;
}

// 1. Upload Video to Firebase Storage
export const uploadVideoToStorage = async (
    uri: string,
    onProgress: (progress: number) => void
): Promise<string> => {
    return new Promise(async (resolve, reject) => {
        try {
            // 1. Convert URI to Blob for web/expo
            const response = await fetch(uri);
            const blob = await response.blob();

            // 2. Create Storage Reference
            const filename = `invites/${Date.now()}_video.mp4`;
            const storageRef = ref(storage, filename);

            // 3. Upload File
            const uploadTask = uploadBytesResumable(storageRef, blob);

            uploadTask.on(
                'state_changed',
                (snapshot) => {
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    onProgress(progress);
                },
                (error) => {
                    console.error("Upload failed", error);
                    reject(error);
                },
                async () => {
                    // 4. Get Download URL
                    const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                    resolve(downloadURL);
                }
            );
        } catch (error) {
            reject(error);
        }
    });
};

// 2. Save Invite to Firestore
export const saveInviteToFirestore = async (inviteData: Omit<InviteData, 'id'>) => {
    try {
        const docRef = await addDoc(collection(db, 'invites'), inviteData);
        return docRef.id;
    } catch (e) {
        console.error("Error adding document: ", e);
        throw e;
    }
};

// 3. Fetch Invites
export const getActiveInvitesByCity = async (city: string) => {
    try {
        const invitesRef = collection(db, 'invites');
        const now = Date.now();

        // Query for invites in this city that haven't expired yet
        const q = query(
            invitesRef,
            where('city', '==', city),
            where('expiresAt', '>', now)
            // Note: Firestore requires a composite index if combining == and > queries on different fields.
            // We'll let the app filter out expired ones locally if the index isn't built yet.
        );

        const querySnapshot = await getDocs(q);
        const invites: any[] = [];
        querySnapshot.forEach((doc) => {
            invites.push({ id: doc.id, ...doc.data() });
        });

        // Sort locally by newest
        return invites.sort((a, b) => b.createdAt - a.createdAt);
    } catch (error) {
        console.error("Error fetching invites:", error);
        return [];
    }
};
