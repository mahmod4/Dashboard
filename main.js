import { onAuthStateChange, logout } from './auth.js';
import { loadDashboard } from './dashboard.js';
import { loadProducts } from './products.js';
import { loadCategories } from './categories.js';
import { loadOrders } from './orders.js';
import { loadUsers } from './users.js';
import { loadOffers } from './offers.js';
import { loadLoyalty } from './loyalty.js';
import { loadPayments } from './payments.js';
import { loadReports } from './reports.js';
import { loadNotifications } from './notifications.js';
import { loadContent } from './content.js';
import { loadSettings } from './settings.js';

// Page elements
const loginPage = document.getElementById('loginPage');
const dashboardPage = document.getElementById('dashboardPage');
const loginForm = document.getElementById('loginForm');
const loginError = document.getElementById('loginError');
const logoutBtn = document.getElementById('logoutBtn');
const pageTitle = document.getElementById('pageTitle');
const pageContent = document.getElementById('pageContent');
const userName = document.getElementById('userName');

// Current page
let currentPage = 'dashboard';

// Page titles
const pageTitles = {
    dashboard: 'الصفحة الرئيسية',
    products: 'إدارة المنتجات',
    categories: 'إدارة الأقسام',
    orders: 'إدارة الطلبات',
    users: 'إدارة المستخدمين',
    offers: 'العروض والخصومات',
    loyalty: 'نقاط الولاء',
    payments: 'الدفع الإلكتروني',
    reports: 'التقارير',
    notifications: 'الإشعارات',
    content: 'إدارة المحتوى',
    settings: 'الإعدادات'
};

// Page loaders
const pageLoaders = {
    dashboard: loadDashboard,
    products: loadProducts,
    categories: loadCategories,
    orders: loadOrders,
    users: loadUsers,
    offers: loadOffers,
    loyalty: loadLoyalty,
    payments: loadPayments,
    reports: loadReports,
    notifications: loadNotifications,
    content: loadContent,
    settings: loadSettings
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Check auth state
    onAuthStateChange((user, isAdmin) => {
        if (user && isAdmin) {
            showDashboard();
            userName.textContent = user.email;
        } else {
            showLogin();
        }
    });

    // Login form
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        
        try {
            const { login } = await import('./auth.js');
            await login(email, password);
            loginError.classList.add('hidden');
        } catch (error) {
            loginError.textContent = error.message || 'حدث خطأ أثناء تسجيل الدخول';
            loginError.classList.remove('hidden');
        }
    });

    // Logout button
    logoutBtn.addEventListener('click', async () => {
        await logout();
        showLogin();
    });

    // Navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const page = item.getAttribute('data-page');
            navigateToPage(page);
        });
    });
});

// Show login page
function showLogin() {
    loginPage.classList.remove('hidden');
    dashboardPage.classList.add('hidden');
    loginForm.reset();
}

// Show dashboard
function showDashboard() {
    loginPage.classList.add('hidden');
    dashboardPage.classList.remove('hidden');
    navigateToPage('dashboard');
}

// Navigate to page
export function navigateToPage(page) {
    currentPage = page;
    
    // Update active nav item
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('data-page') === page) {
            item.classList.add('active');
        }
    });

    // Update page title
    pageTitle.textContent = pageTitles[page] || page;

    // Load page content
    pageContent.innerHTML = '<div class="loading"><div class="spinner"></div><p>جاري التحميل...</p></div>';
    
    if (pageLoaders[page]) {
        pageLoaders[page]();
    } else {
        pageContent.innerHTML = '<div class="card"><p>الصفحة غير متوفرة</p></div>';
    }
}

