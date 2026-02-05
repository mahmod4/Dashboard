# هيكل قاعدة البيانات في Firestore

## المجموعات (Collections)

### 1. admins
مجموعة المسؤولين

```
admins/
  {userId}/
    isAdmin: true (boolean)
```

### 2. products
المنتجات

```
products/
  {productId}/
    name: string
    description: string
    price: number
    discountPrice: number (optional)
    categoryId: string
    stock: number
    available: boolean
    image: string (URL)
    imagePath: string
    salesCount: number (optional)
    createdAt: timestamp
    updatedAt: timestamp
```

### 3. categories
الأقسام

```
categories/
  {categoryId}/
    name: string
    description: string
    order: number
    createdAt: timestamp
    updatedAt: timestamp
```

### 4. orders
الطلبات

```
orders/
  {orderId}/
    userId: string
    customerName: string
    userName: string
    items: array [
      {
        productId: string
        name: string
        price: number
        quantity: number
      }
    ]
    total: number
    status: string (new, preparing, shipped, completed, cancelled)
    shippingAddress: string
    createdAt: timestamp
    updatedAt: timestamp
```

### 5. users
المستخدمين

```
users/
  {userId}/
    name: string
    email: string
    phone: string (optional)
    points: number
    active: boolean
    createdAt: timestamp
    updatedAt: timestamp
```

### 6. offers
العروض والخصومات

```
offers/
  {offerId}/
    name: string
    description: string
    discountType: string (percentage, fixed)
    discountValue: number
    startDate: timestamp
    endDate: timestamp
    couponCode: string (optional)
    products: array (optional) [productId1, productId2, ...]
    active: boolean
    createdAt: timestamp
    updatedAt: timestamp
```

### 7. pointsTransactions
معاملات نقاط الولاء

```
pointsTransactions/
  {transactionId}/
    userId: string
    type: string (add, subtract)
    amount: number
    reason: string (optional)
    previousPoints: number
    newPoints: number
    createdAt: timestamp
```

### 8. payments
عمليات الدفع

```
payments/
  {paymentId}/
    userId: string
    orderId: string
    customerName: string
    amount: number
    method: string (credit_card, debit_card, bank_transfer, wallet, cash_on_delivery)
    status: string (success, failed, pending, refunded)
    transactionId: string (optional)
    refundedAt: timestamp (optional)
    createdAt: timestamp
    updatedAt: timestamp
```

### 9. notifications
الإشعارات

```
notifications/
  {notificationId}/
    type: string (all, single)
    userId: string (optional, if type is single)
    title: string
    message: string
    category: string (info, offer, order, general)
    read: boolean
    createdAt: timestamp
```

### 10. settings
الإعدادات

```
settings/
  general/
    storeName: string
    storeEmail: string
    storePhone: string
    storeAddress: string
    storeLogo: string (URL)
    shippingBaseCost: number
    shippingFreeThreshold: number
    shippingDays: number
    paymentCardEnabled: boolean
    paymentApiKey: string
    paymentCashOnDeliveryEnabled: boolean
    socialFacebook: string (URL)
    socialTwitter: string (URL)
    socialInstagram: string (URL)
    socialWhatsapp: string
    updatedAt: timestamp

  loyalty/
    pointsPercentage: number
    pointValue: number
    updatedAt: timestamp
```

### 11. content
المحتوى

```
content/
  main/
    bannerImage: string (URL)
    bannerImagePath: string
    bannerLink: string (optional)
    bannerText: string (optional)
    privacyPolicy: {
      title: string
      content: string
      updatedAt: timestamp
    }
    termsAndConditions: {
      title: string
      content: string
      updatedAt: timestamp
    }
    aboutUs: {
      title: string
      content: string
      updatedAt: timestamp
    }
    updatedAt: timestamp
```

## Firebase Storage

### المجلدات

```
products/
  {timestamp}_{filename}  # صور المنتجات

banners/
  {timestamp}_{filename}  # صور البانر

logos/
  {timestamp}_{filename}  # شعار المتجر
```

## الفهارس المطلوبة (Indexes)

في Firestore Console، أنشئ الفهارس التالية:

1. **orders**: `createdAt` (Descending)
2. **orders**: `status` + `createdAt` (Descending)
3. **payments**: `createdAt` (Descending)
4. **payments**: `status` + `createdAt` (Descending)
5. **pointsTransactions**: `userId` + `createdAt` (Descending)
6. **notifications**: `createdAt` (Descending)

## ملاحظات

- جميع التواريخ تستخدم `timestamp` من Firestore
- الحقول الاختيارية يمكن أن تكون `null` أو غير موجودة
- تأكد من إنشاء قواعد الأمان المناسبة في Firebase Console

