// Firebase Configuration
import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.9.0/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/12.9.0/firebase-auth.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js';
import { getStorage } from 'https://www.gstatic.com/firebasejs/12.9.0/firebase-storage.js';
import { getAnalytics } from 'https://www.gstatic.com/firebasejs/12.9.0/firebase-analytics.js';

// إعدادات Firebase - متجر الخديوي
// تم تحديث الإعدادات لتطابق متجر الخديوي
const firebaseConfig = {
    apiKey: "AIzaSyBBo0T68WHTINwU8VET_Zm1Nc6eLGSd1u0",
    authDomain: "hibr-2e6f7.firebaseapp.com",
    projectId: "hibr-2e6f7",
    storageBucket: "hibr-2e6f7.firebasestorage.app",
    messagingSenderId: "38236776445",
    appId: "1:38236776445:web:94d5c7112933a6084fdb94"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Initialize Analytics (optional - only in browser environment)
let analytics = null;
if (typeof window !== 'undefined') {
    try {
        analytics = getAnalytics(app);
    } catch (error) {
        console.log('Analytics initialization skipped:', error);
    }
}
export { analytics };

