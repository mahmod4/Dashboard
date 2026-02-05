# لوحة تحكم متجر إلكتروني

لوحة تحكم كاملة لمتجر إلكتروني باستخدام HTML + CSS + JavaScript + Firebase

## المميزات

✅ **الصفحة الرئيسية (Dashboard)**
- ملخص المبيعات اليوم والشهر
- عدد الطلبات والمستخدمين
- المنتجات الأكثر مبيعًا
- إشعارات سريعة

✅ **إدارة المنتجات**
- إضافة/تعديل/حذف منتجات
- رفع الصور عبر Firebase Storage
- إدارة المخزون والحالة
- السعر قبل وبعد الخصم

✅ **إدارة الأقسام (Categories)**
- إضافة/تعديل/حذف أقسام
- ترتيب الأقسام

✅ **إدارة الطلبات**
- عرض جميع الطلبات
- تفاصيل كل طلب
- تغيير حالة الطلب
- طباعة فاتورة PDF

✅ **إدارة المستخدمين**
- عرض جميع العملاء
- تعديل بيانات العميل
- عرض سجل الطلبات
- حظر/تفعيل حساب

✅ **العروض والخصومات**
- إنشاء عروض جديدة
- تحديد مدة العرض
- كوبونات خصم
- ربط العروض بمنتجات

✅ **نقاط الولاء**
- تحديد نسبة النقاط
- إضافة/خصم نقاط يدويًا
- عرض رصيد النقاط
- سجل المعاملات

✅ **الدفع الإلكتروني**
- عرض عمليات الدفع
- حالات الدفع
- استرداد مبلغ

✅ **التقارير**
- تقرير مبيعات يومي/شهري
- المنتجات الأكثر مبيعًا
- رسوم بيانية
- تصدير Excel/PDF

✅ **الإشعارات**
- إرسال إشعار جماعي
- إشعار لعميل محدد

✅ **إدارة المحتوى**
- بانر الصفحة الرئيسية
- صفحات ثابتة (سياسة الخصوصية، الشروط، من نحن)

✅ **الإعدادات**
- إعدادات المتجر
- إعدادات الشحن
- إعدادات الدفع
- وسائل التواصل

## الإعداد والتثبيت

### 1. إعداد Firebase

1. أنشئ مشروع جديد في [Firebase Console](https://console.firebase.google.com/)
2. فعّل Authentication (Email/Password)
3. أنشئ Firestore Database
4. فعّل Firebase Storage
5. انسخ إعدادات Firebase من Project Settings

### 2. تحديث إعدادات Firebase

افتح ملف `js/firebase-config.js` واستبدل القيم:

```javascript
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};
```

### 3. إعداد قاعدة البيانات

#### إنشاء مجموعة admins

في Firestore، أنشئ مجموعة باسم `admins` مع المستند التالي:

```
Collection: admins
Document ID: [USER_ID]
Fields:
  - isAdmin: true (boolean)
```

#### قواعد الأمان في Firestore

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Admins collection
    match /admins/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Other collections - adjust as needed
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

#### قواعد الأمان في Storage

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
  }
}
```

### 4. إنشاء حساب مسؤول

1. سجّل مستخدم جديد في Authentication
2. انسخ User ID
3. في Firestore، أنشئ مستند في مجموعة `admins`:
   - Document ID: [USER_ID]
   - Field: `isAdmin` = `true`

### 5. تشغيل المشروع

افتح ملف `index.html` في المتصفح أو استخدم خادم محلي:

```bash
# باستخدام Python
python -m http.server 8000

# أو باستخدام Node.js
npx http-server
```

ثم افتح `http://localhost:8000`

## هيكل المشروع

```
Dashboard/
├── index.html          # الصفحة الرئيسية
├── css/
│   └── style.css      # ملفات التنسيق
├── js/
│   ├── firebase-config.js  # إعدادات Firebase
│   ├── auth.js             # نظام المصادقة
│   ├── main.js             # التنقل بين الصفحات
│   ├── dashboard.js        # الصفحة الرئيسية
│   ├── products.js         # إدارة المنتجات
│   ├── categories.js       # إدارة الأقسام
│   ├── orders.js           # إدارة الطلبات
│   ├── users.js            # إدارة المستخدمين
│   ├── offers.js           # العروض والخصومات
│   ├── loyalty.js          # نقاط الولاء
│   ├── payments.js         # الدفع الإلكتروني
│   ├── reports.js          # التقارير
│   ├── notifications.js    # الإشعارات
│   ├── content.js          # إدارة المحتوى
│   └── settings.js         # الإعدادات
└── README.md
```

## هيكل قاعدة البيانات

راجع ملف `DATABASE_STRUCTURE.md` للتفاصيل الكاملة.

## ملاحظات مهمة

1. **الأمان**: تأكد من إعداد قواعد الأمان في Firebase بشكل صحيح
2. **الاسترداد (Refund)**: يحتاج إلى تكامل مع بوابة الدفع الفعلية
3. **الإشعارات**: لإرسال إشعارات Push، تحتاج إلى إعداد Firebase Cloud Messaging
4. **التقارير**: تصدير Excel/PDF يحتاج إلى مكتبات إضافية في الإنتاج

## المتطلبات

- متصفح حديث يدعم ES6 Modules
- اتصال بالإنترنت (لتحميل Firebase SDK و Tailwind CSS)

## الدعم

للمساعدة أو الإبلاغ عن مشاكل، يرجى فتح Issue في المستودع.

## الترخيص

هذا المشروع مفتوح المصدر ومتاح للاستخدام الحر.

