# دليل الإعداد السريع

## الخطوات الأساسية

### 1. إعداد Firebase Project

1. اذهب إلى [Firebase Console](https://console.firebase.google.com/)
2. اضغط "Add project" أو "إضافة مشروع"
3. أدخل اسم المشروع واتبع التعليمات
4. بعد إنشاء المشروع، اضغط على "Add app" واختر "Web" (</>)
5. سجّل اسم التطبيق (مثلاً: "Admin Dashboard")
6. انسخ إعدادات Firebase

### 2. تفعيل الخدمات المطلوبة

#### Authentication
1. من القائمة الجانبية، اختر "Authentication"
2. اضغط "Get started"
3. اضغط "Sign-in method"
4. فعّل "Email/Password"
5. احفظ التغييرات

#### Firestore Database
1. من القائمة الجانبية، اختر "Firestore Database"
2. اضغط "Create database"
3. اختر "Start in test mode" (يمكنك تعديل القواعد لاحقاً)
4. اختر موقع قاعدة البيانات (اختر الأقرب إليك)
5. اضغط "Enable"

#### Storage
1. من القائمة الجانبية، اختر "Storage"
2. اضغط "Get started"
3. اقرأ القواعد واقبلها
4. اختر موقع Storage (يفضل نفس موقع Firestore)
5. اضغط "Done"

### 3. تحديث إعدادات Firebase في الكود

1. افتح ملف `js/firebase-config.js`
2. استبدل القيم التالية بإعدادات مشروعك:

```javascript
const firebaseConfig = {
    apiKey: "AIza...",           // من Firebase Console
    authDomain: "xxx.firebaseapp.com",
    projectId: "xxx",
    storageBucket: "xxx.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:xxx"
};
```

### 4. إنشاء حساب مسؤول

#### الطريقة الأولى: من Firebase Console
1. اذهب إلى "Authentication"
2. اضغط "Add user"
3. أدخل البريد الإلكتروني وكلمة المرور
4. اضغط "Add user"
5. انسخ "User UID"

#### الطريقة الثانية: من التطبيق
1. سجّل مستخدم جديد من صفحة Authentication في Firebase Console
2. انسخ User UID

#### إضافة صلاحيات المسؤول
1. اذهب إلى "Firestore Database"
2. اضغط "Start collection"
3. Collection ID: `admins`
4. Document ID: الصق User UID الذي نسخته
5. أضف حقل:
   - Field: `isAdmin`
   - Type: `boolean`
   - Value: `true`
6. اضغط "Save"

### 5. إعداد قواعد الأمان

#### Firestore Rules
1. اذهب إلى "Firestore Database" > "Rules"
2. استبدل القواعد بـ:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Admins can read/write everything
    match /{document=**} {
      allow read, write: if request.auth != null && 
        exists(/databases/$(database)/documents/admins/$(request.auth.uid)) &&
        get(/databases/$(database)/documents/admins/$(request.auth.uid)).data.isAdmin == true;
    }
  }
}
```

#### Storage Rules
1. اذهب إلى "Storage" > "Rules"
2. استبدل القواعد بـ:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        firestore.get(/databases/(default)/documents/admins/$(request.auth.uid)).data.isAdmin == true;
    }
  }
}
```

### 6. إنشاء الفهارس (Indexes)

Firestore سيطالبك بإنشاء الفهارس تلقائياً عند الحاجة. أو يمكنك إنشائها يدوياً:

1. اذهب إلى "Firestore Database" > "Indexes"
2. اضغط "Create Index"
3. أنشئ الفهارس التالية:

**Index 1:**
- Collection: `orders`
- Fields: `status` (Ascending), `createdAt` (Descending)

**Index 2:**
- Collection: `payments`
- Fields: `status` (Ascending), `createdAt` (Descending)

**Index 3:**
- Collection: `pointsTransactions`
- Fields: `userId` (Ascending), `createdAt` (Descending)

### 7. تشغيل المشروع

#### الطريقة الأولى: فتح مباشر
1. افتح ملف `index.html` في المتصفح
2. قد تواجه مشاكل CORS - استخدم طريقة الخادم المحلي

#### الطريقة الثانية: خادم محلي

**باستخدام Python:**
```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000
```

**باستخدام Node.js:**
```bash
# تثبيت http-server
npm install -g http-server

# تشغيل الخادم
http-server -p 8000
```

**باستخدام VS Code:**
1. ثبت إضافة "Live Server"
2. اضغط بزر الماوس الأيمن على `index.html`
3. اختر "Open with Live Server"

### 8. تسجيل الدخول

1. افتح `http://localhost:8000` (أو الرابط الذي يعرضه الخادم)
2. سجّل الدخول بالبريد الإلكتروني وكلمة المرور التي أنشأتها
3. إذا كان الحساب لديه صلاحيات مسؤول، ستنتقل إلى لوحة التحكم

## حل المشاكل الشائعة

### خطأ: "ليس لديك صلاحية للوصول"
- تأكد من إنشاء مستند في مجموعة `admins` بـ User UID الصحيح
- تأكد من أن حقل `isAdmin` = `true`

### خطأ: "Permission denied"
- تحقق من قواعد Firestore و Storage
- تأكد من تسجيل الدخول

### خطأ: "Index not found"
- أنشئ الفهارس المطلوبة من Firestore Console
- أو انتظر حتى يطلب Firebase إنشاءها تلقائياً

### الصور لا تظهر
- تحقق من قواعد Storage
- تأكد من رفع الصور بشكل صحيح

## الخطوات التالية

1. أضف منتجات تجريبية
2. أنشئ أقسام
3. اختبر إضافة/تعديل/حذف البيانات
4. راجع جميع الصفحات للتأكد من عملها

## ملاحظات أمنية

⚠️ **مهم جداً:**
- لا تشارك إعدادات Firebase في مستودع عام
- استخدم قواعد أمان صارمة في الإنتاج
- لا تضع معلومات حساسة في الكود
- راجع قواعد Firestore و Storage قبل النشر

## الدعم

إذا واجهت أي مشاكل:
1. تحقق من Console في المتصفح (F12)
2. راجع ملف README.md
3. راجع ملف DATABASE_STRUCTURE.md

