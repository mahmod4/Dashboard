import { collection, query, where, getDocs, getCountFromServer, orderBy, limit } from 'https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js';
import { db } from './firebase-config.js';

export async function loadDashboard() {
    const pageContent = document.getElementById('pageContent');
    
    try {
        // Show loading state
        pageContent.innerHTML = '<div class="loading"><div class="spinner"></div><p>جاري تحميل البيانات...</p></div>';
        
        // Get statistics
        const stats = await getDashboardStats();
        
        console.log('Dashboard Stats:', stats);
        
        pageContent.innerHTML = `
            ${stats.totalOrders === 0 && stats.totalUsers === 0 && stats.totalProducts === 0 ? `
                <div class="card mb-6 bg-blue-50 border-r-4 border-blue-500">
                    <div class="p-4">
                        <h3 class="text-blue-800 font-bold mb-2"><i class="fas fa-info-circle ml-2"></i>مرحباً بك في لوحة التحكم</h3>
                        <p class="text-blue-700 mb-3">لا توجد بيانات حتى الآن. ابدأ بإضافة:</p>
                        <ul class="list-disc list-inside text-blue-600 space-y-1">
                            <li>منتجات جديدة من صفحة <strong>إدارة المنتجات</strong></li>
                            <li>أقسام للمنتجات من صفحة <strong>إدارة الأقسام</strong></li>
                        </ul>
                    </div>
                </div>
            ` : ''}
            
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <div class="stats-card" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
                    <h3><i class="fas fa-dollar-sign ml-2"></i>مبيعات اليوم</h3>
                    <div class="value">${stats.todaySales.toFixed(2)} ج.م</div>
                </div>
                <div class="stats-card" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);">
                    <h3><i class="fas fa-calendar ml-2"></i>مبيعات الشهر</h3>
                    <div class="value">${stats.monthSales.toFixed(2)} ج.م</div>
                </div>
                <div class="stats-card" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);">
                    <h3><i class="fas fa-shopping-cart ml-2"></i>عدد الطلبات</h3>
                    <div class="value">${stats.totalOrders}</div>
                </div>
                <div class="stats-card" style="background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);">
                    <h3><i class="fas fa-users ml-2"></i>عدد المستخدمين</h3>
                    <div class="value">${stats.totalUsers}</div>
                </div>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div class="card">
                    <h2 class="text-2xl font-bold mb-4">المنتجات الأكثر مبيعًا</h2>
                    <div id="topProducts" class="space-y-3">
                        ${stats.topProducts.length > 0 
                            ? stats.topProducts.map((product, index) => `
                                <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div class="flex items-center">
                                        <span class="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-bold ml-3">${index + 1}</span>
                                        <div>
                                            <p class="font-semibold">${product.name}</p>
                                            <p class="text-sm text-gray-500">${product.sales} عملية بيع</p>
                                        </div>
                                    </div>
                                    <span class="text-green-600 font-bold">${product.revenue.toFixed(2)} ج.م</span>
                                </div>
                            `).join('')
                            : '<p class="text-gray-500 text-center py-4">لا توجد منتجات مبيعة بعد</p>'
                        }
                    </div>
                </div>

                <div class="card">
                    <h2 class="text-2xl font-bold mb-4">الطلبات الأخيرة</h2>
                    <div id="recentOrders" class="space-y-3">
                        ${stats.recentOrders.length > 0
                            ? stats.recentOrders.map(order => `
                                <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div>
                                        <p class="font-semibold">طلب #${order.id}</p>
                                        <p class="text-sm text-gray-500">${order.date}</p>
                                    </div>
                                    <div class="text-left">
                                        <p class="font-bold text-green-600">${order.total.toFixed(2)} ج.م</p>
                                        <span class="badge badge-${getStatusColor(order.status)}">${getStatusText(order.status)}</span>
                                    </div>
                                </div>
                            `).join('')
                            : '<p class="text-gray-500 text-center py-4">لا توجد طلبات حديثة</p>'
                        }
                    </div>
                </div>
            </div>

            <div class="card mt-6">
                <h2 class="text-2xl font-bold mb-4">إشعارات سريعة</h2>
                <div id="notifications" class="space-y-2">
                    ${stats.notifications.map(notif => `
                        <div class="p-3 bg-${notif.type === 'warning' ? 'yellow' : notif.type === 'danger' ? 'red' : 'blue'}-50 border-r-4 border-${notif.type === 'warning' ? 'yellow' : notif.type === 'danger' ? 'red' : 'blue'}-500 rounded">
                            <p class="font-semibold">${notif.title}</p>
                            <p class="text-sm text-gray-600">${notif.message}</p>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    } catch (error) {
        console.error('Error loading dashboard:', error);
        pageContent.innerHTML = `
            <div class="card">
                <div class="bg-red-50 border-r-4 border-red-500 p-4 rounded">
                    <h3 class="text-red-800 font-bold mb-2">حدث خطأ أثناء تحميل البيانات</h3>
                    <p class="text-red-600 mb-2">${error.message || 'خطأ غير معروف'}</p>
                    <p class="text-sm text-gray-600">تحقق من:</p>
                    <ul class="list-disc list-inside text-sm text-gray-600 mt-2">
                        <li>اتصال Firebase يعمل بشكل صحيح</li>
                        <li>وجود البيانات في Firestore (products, orders, users)</li>
                        <li>قواعد الأمان في Firestore تسمح بالقراءة</li>
                    </ul>
                    <button onclick="location.reload()" class="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                        إعادة المحاولة
                    </button>
                </div>
            </div>
        `;
    }
}

async function getDashboardStats() {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

        // Get orders
        let orders = [];
        try {
            const ordersSnapshot = await getDocs(collection(db, 'orders'));
            orders = ordersSnapshot.docs.map(doc => {
                const data = doc.data();
                return { 
                    id: doc.id, 
                    ...data,
                    createdAt: data.createdAt || data.created_at || null
                };
            });
            console.log(`تم جلب ${orders.length} طلب من Firestore`);
        } catch (error) {
            console.error('خطأ في جلب الطلبات:', error);
            orders = [];
        }

        // Calculate today's sales
        const todayOrders = orders.filter(order => {
            if (!order.createdAt) return false;
            const orderDate = order.createdAt.toDate ? order.createdAt.toDate() : new Date(order.createdAt);
            return orderDate >= today;
        });
        const todaySales = todayOrders.reduce((sum, order) => sum + (parseFloat(order.total) || 0), 0);

        // Calculate month's sales
        const monthOrders = orders.filter(order => {
            if (!order.createdAt) return false;
            const orderDate = order.createdAt.toDate ? order.createdAt.toDate() : new Date(order.createdAt);
            return orderDate >= monthStart;
        });
        const monthSales = monthOrders.reduce((sum, order) => sum + (parseFloat(order.total) || 0), 0);

        // Get users count
        let totalUsers = 0;
        try {
            const usersSnapshot = await getCountFromServer(collection(db, 'users'));
            totalUsers = usersSnapshot.data().count;
            console.log(`عدد المستخدمين: ${totalUsers}`);
        } catch (error) {
            console.error('خطأ في جلب عدد المستخدمين:', error);
            // Try alternative method
            try {
                const usersSnapshot = await getDocs(collection(db, 'users'));
                totalUsers = usersSnapshot.docs.length;
            } catch (e) {
                console.error('خطأ في جلب المستخدمين (طريقة بديلة):', e);
            }
        }

        // Get products
        let products = [];
        try {
            const productsSnapshot = await getDocs(collection(db, 'products'));
            products = productsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            console.log(`تم جلب ${products.length} منتج من Firestore`);
        } catch (error) {
            console.error('خطأ في جلب المنتجات:', error);
            products = [];
        }
        
        // Calculate product sales
        const topProducts = products.length > 0
            ? products
                .map(product => ({
                    name: product.name || 'منتج بدون اسم',
                    sales: product.salesCount || 0,
                    revenue: (product.salesCount || 0) * (parseFloat(product.price) || 0)
                }))
                .filter(p => p.sales > 0 || p.revenue > 0)
                .sort((a, b) => b.sales - a.sales)
                .slice(0, 5)
            : [];

        // Recent orders
        const recentOrders = orders.length > 0
            ? orders
                .sort((a, b) => {
                    const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : (a.createdAt ? new Date(a.createdAt) : new Date(0));
                    const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : (b.createdAt ? new Date(b.createdAt) : new Date(0));
                    return dateB - dateA;
                })
                .slice(0, 5)
                .map(order => {
                    const orderDate = order.createdAt?.toDate ? order.createdAt.toDate() : (order.createdAt ? new Date(order.createdAt) : null);
                    return {
                        id: order.id.substring(0, 8) || 'غير معروف',
                        total: parseFloat(order.total) || 0,
                        status: order.status || 'pending',
                        date: orderDate ? orderDate.toLocaleDateString('ar-SA') : 'غير محدد'
                    };
                })
            : [];

        // Notifications
        const newOrdersCount = orders.filter(o => o.status === 'new' || o.status === 'pending').length;
        const lowStockCount = products.filter(p => (parseInt(p.stock) || 0) < 10 && (parseInt(p.stock) || 0) > 0).length;
        
        const notifications = [];
        
        if (newOrdersCount > 0) {
            notifications.push({
                type: 'info',
                title: 'طلبات جديدة',
                message: `لديك ${newOrdersCount} طلب جديد يحتاج للمراجعة`
            });
        }
        
        if (lowStockCount > 0) {
            notifications.push({
                type: 'warning',
                title: 'منتجات قليلة المخزون',
                message: `${lowStockCount} منتج يحتاج إعادة تخزين`
            });
        }
        
        if (products.length === 0) {
            notifications.push({
                type: 'info',
                title: 'لا توجد منتجات',
                message: 'ابدأ بإضافة منتجات جديدة من صفحة إدارة المنتجات'
            });
        }
        
        if (orders.length === 0) {
            notifications.push({
                type: 'info',
                title: 'لا توجد طلبات',
                message: 'لم يتم تسجيل أي طلبات حتى الآن'
            });
        }

        return {
            todaySales,
            monthSales,
            totalOrders: orders.length,
            totalUsers,
            totalProducts: products.length,
            topProducts: topProducts.length > 0 ? topProducts : [],
            recentOrders: recentOrders.length > 0 ? recentOrders : [],
            notifications: notifications.length > 0 ? notifications : [
                {
                    type: 'info',
                    title: 'مرحباً بك',
                    message: 'لوحة التحكم جاهزة للاستخدام'
                }
            ]
        };
    } catch (error) {
        console.error('خطأ عام في جلب إحصائيات Dashboard:', error);
        throw error;
    }
}

function getStatusColor(status) {
    const colors = {
        'new': 'info',
        'preparing': 'warning',
        'shipped': 'info',
        'completed': 'success',
        'cancelled': 'danger'
    };
    return colors[status] || 'info';
}

function getStatusText(status) {
    const texts = {
        'new': 'جديد',
        'preparing': 'جاري التحضير',
        'shipped': 'تم الشحن',
        'completed': 'مكتمل',
        'cancelled': 'ملغي'
    };
    return texts[status] || status;
}

