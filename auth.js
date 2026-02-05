import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/12.9.0/firebase-auth.js';
import { doc, getDoc } from 'https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js';
import { auth, db } from './firebase-config.js';

// Check if user is admin
export async function checkAdminStatus(userId) {
    try {
        const userDoc = await getDoc(doc(db, 'admins', userId));
        console.log('Admin document exists:', userDoc.exists());
        if (userDoc.exists()) {
            const data = userDoc.data();
            console.log('Admin document data:', data);
            console.log('isAdmin value:', data.isAdmin, 'Type:', typeof data.isAdmin);
            return data.isAdmin === true;
        }
        return false;
    } catch (error) {
        console.error('Error checking admin status:', error);
        return false;
    }
}

// Login function
export async function login(email, password) {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        console.log('Login successful, checking admin status for:', userCredential.user.uid);
        
        const isAdmin = await checkAdminStatus(userCredential.user.uid);
        console.log('Admin status:', isAdmin);
        
        if (!isAdmin) {
            await signOut(auth);
            throw new Error('ليس لديك صلاحية للوصول إلى لوحة التحكم. تأكد من إضافة حسابك في مجموعة admins في Firestore.');
        }
        
        return userCredential.user;
    } catch (error) {
        console.error('Login error:', error);
        // Preserve original error message if it exists
        if (error.message) {
            throw error;
        }
        // Otherwise create a user-friendly message
        throw new Error('حدث خطأ أثناء تسجيل الدخول. تحقق من البريد وكلمة المرور.');
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

