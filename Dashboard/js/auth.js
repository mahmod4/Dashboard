import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/12.9.0/firebase-auth.js';
import { doc, getDoc } from 'https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js';
import { auth, db } from './firebase-config.js';

// Check if user is admin
export async function checkAdminStatus(userId) {
    try {
        const userDoc = await getDoc(doc(db, 'admins', userId));
        return userDoc.exists() && userDoc.data().isAdmin === true;
    } catch (error) {
        console.error('Error checking admin status:', error);
        return false;
    }
}

// Login function
export async function login(email, password) {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const isAdmin = await checkAdminStatus(userCredential.user.uid);
        
        if (!isAdmin) {
            await signOut(auth);
            throw new Error('ليس لديك صلاحية للوصول إلى لوحة التحكم');
        }
        
        return userCredential.user;
    } catch (error) {
        throw error;
    }
}

// Logout function
export async function logout() {
    try {
        await signOut(auth);
    } catch (error) {
        console.error('Error logging out:', error);
    }
}

// Auth state observer
export function onAuthStateChange(callback) {
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            const isAdmin = await checkAdminStatus(user.uid);
            callback(user, isAdmin);
        } else {
            callback(null, false);
        }
    });
}

