import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, getDoc, query, orderBy } from 'https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'https://www.gstatic.com/firebasejs/12.9.0/firebase-storage.js';
import { db, storage } from './firebase-config.js';

export async function loadProducts() {
    const pageContent = document.getElementById('pageContent');
    
    try {
        const products = await getProducts();
        
        pageContent.innerHTML = `
            <div class="card mb-6">
                <div class="flex justify-between items-center">
                    <h2 class="text-2xl font-bold">المنتجات</h2>
                    <button onclick="openProductModal()" class="btn-primary">
                        <i class="fas fa-plus ml-2"></i>إضافة منتج جديد
                    </button>
                </div>
            </div>

            <div class="card">
                <div class="overflow-x-auto">
                    <table class="table">
                        <thead>
                            <tr>
                                <th>الصورة</th>
                                <th>الاسم</th>
                                <th>القسم</th>
                                <th>السعر</th>
                                <th>السعر بعد الخصم</th>
                                <th>المخزون</th>
                                <th>الحالة</th>
                                <th>الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody id="productsTable">
                            ${products.map(product => `
                                <tr>
                                    <td>
                                        <img src="${product.image || 'https://via.placeholder.com/50'}" 
                                             alt="${product.name}" 
                                             class="w-12 h-12 object-cover rounded">
                                    </td>
                                    <td>${product.name}</td>
                                    <td>${product.category || 'غير محدد'}</td>
                                    <td>${product.price?.toFixed(2) || 0} ر.س</td>
                                    <td>${product.discountPrice ? product.discountPrice.toFixed(2) + ' ر.س' : '-'}</td>
                                    <td>${product.stock || 0}</td>
                                    <td>
                                        <span class="badge badge-${product.available ? 'success' : 'danger'}">
                                            ${product.available ? 'متوفر' : 'غير متوفر'}
                                        </span>
                                    </td>
                                    <td>
                                        <button onclick="editProduct('${product.id}')" 
                                                class="btn-primary text-sm py-1 px-3 ml-2">
                                            <i class="fas fa-edit"></i>
                                        </button>
                                        <button onclick="deleteProduct('${product.id}')" 
                                                class="btn-danger text-sm py-1 px-3">
                                            <i class="fas fa-trash"></i>
                                        </button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Product Modal -->
            <div id="productModal" class="modal">
                <div class="modal-content">
                    <span class="close" onclick="closeProductModal()">&times;</span>
                    <h2 class="text-2xl font-bold mb-6" id="modalTitle">إضافة منتج جديد</h2>
                    <form id="productForm" onsubmit="saveProduct(event)">
                        <input type="hidden" id="productId">
                        
                        <div class="form-group">
                            <label>اسم المنتج *</label>
                            <input type="text" id="productName" required>
                        </div>

                        <div class="form-group">
                            <label>الوصف</label>
                            <textarea id="productDescription" rows="4"></textarea>
                        </div>

                        <div class="grid grid-cols-2 gap-4">
                            <div class="form-group">
                                <label>السعر (ر.س) *</label>
                                <input type="number" id="productPrice" step="0.01" required>
                            </div>

                            <div class="form-group">
                                <label>السعر بعد الخصم (ر.س)</label>
                                <input type="number" id="productDiscountPrice" step="0.01">
                            </div>
                        </div>

                        <div class="grid grid-cols-2 gap-4">
                            <div class="form-group">
                                <label>القسم</label>
                                <select id="productCategory">
                                    <option value="">اختر القسم</option>
                                </select>
                            </div>

                            <div class="form-group">
                                <label>المخزون</label>
                                <input type="number" id="productStock" min="0" value="0">
                            </div>
                        </div>

                        <div class="form-group">
                            <label>الحالة</label>
                            <select id="productAvailable">
                                <option value="true">متوفر</option>
                                <option value="false">غير متوفر</option>
                            </select>
                        </div>

                        <div class="form-group">
                            <label>صورة المنتج</label>
                            <input type="file" id="productImage" accept="image/*" onchange="previewImage(event)">
                            <img id="imagePreview" class="mt-3 max-w-xs hidden rounded">
                        </div>

                        <div class="flex justify-end space-x-3 space-x-reverse mt-6">
                            <button type="button" onclick="closeProductModal()" 
                                    class="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                                إلغاء
                            </button>
                            <button type="submit" class="btn-primary">
                                <i class="fas fa-save ml-2"></i>حفظ
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        // Load categories
        await loadCategoriesForSelect();
    } catch (error) {
        console.error('Error loading products:', error);
        pageContent.innerHTML = '<div class="card"><p class="text-red-600">حدث خطأ أثناء تحميل المنتجات</p></div>';
    }
}

async function getProducts() {
    const snapshot = await getDocs(query(collection(db, 'products'), orderBy('createdAt', 'desc')));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

async function loadCategoriesForSelect() {
    try {
        const categoriesSnapshot = await getDocs(collection(db, 'categories'));
        const categories = categoriesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        const select = document.getElementById('productCategory');
        if (select) {
            categories.forEach(cat => {
                const option = document.createElement('option');
                option.value = cat.id;
                option.textContent = cat.name;
                select.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Error loading categories:', error);
    }
}

window.openProductModal = function() {
    document.getElementById('productModal').style.display = 'block';
    document.getElementById('modalTitle').textContent = 'إضافة منتج جديد';
    document.getElementById('productForm').reset();
    document.getElementById('productId').value = '';
    document.getElementById('imagePreview').classList.add('hidden');
}

window.closeProductModal = function() {
    document.getElementById('productModal').style.display = 'none';
}

window.previewImage = function(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const preview = document.getElementById('imagePreview');
            preview.src = e.target.result;
            preview.classList.remove('hidden');
        };
        reader.readAsDataURL(file);
    }
}

window.editProduct = async function(productId) {
    try {
        const productDoc = await getDoc(doc(db, 'products', productId));
        if (productDoc.exists()) {
            const product = { id: productDoc.id, ...productDoc.data() };
            
            document.getElementById('productId').value = product.id;
            document.getElementById('productName').value = product.name || '';
            document.getElementById('productDescription').value = product.description || '';
            document.getElementById('productPrice').value = product.price || '';
            document.getElementById('productDiscountPrice').value = product.discountPrice || '';
            document.getElementById('productCategory').value = product.categoryId || '';
            document.getElementById('productStock').value = product.stock || 0;
            document.getElementById('productAvailable').value = product.available ? 'true' : 'false';
            
            if (product.image) {
                const preview = document.getElementById('imagePreview');
                preview.src = product.image;
                preview.classList.remove('hidden');
            }
            
            document.getElementById('modalTitle').textContent = 'تعديل المنتج';
            document.getElementById('productModal').style.display = 'block';
            
            await loadCategoriesForSelect();
        }
    } catch (error) {
        console.error('Error loading product:', error);
        alert('حدث خطأ أثناء تحميل المنتج');
    }
}

window.deleteProduct = async function(productId) {
    if (!confirm('هل أنت متأكد من حذف هذا المنتج؟')) return;
    
    try {
        // Delete image from storage if exists
        const productDoc = await getDoc(doc(db, 'products', productId));
        if (productDoc.exists()) {
            const product = productDoc.data();
            if (product.imagePath) {
                try {
                    await deleteObject(ref(storage, product.imagePath));
                } catch (error) {
                    console.error('Error deleting image:', error);
                }
            }
        }
        
        await deleteDoc(doc(db, 'products', productId));
        alert('تم حذف المنتج بنجاح');
        loadProducts();
    } catch (error) {
        console.error('Error deleting product:', error);
        alert('حدث خطأ أثناء حذف المنتج');
    }
}

window.saveProduct = async function(event) {
    event.preventDefault();
    
    const productId = document.getElementById('productId').value;
    const name = document.getElementById('productName').value;
    const description = document.getElementById('productDescription').value;
    const price = parseFloat(document.getElementById('productPrice').value);
    const discountPrice = document.getElementById('productDiscountPrice').value ? 
                         parseFloat(document.getElementById('productDiscountPrice').value) : null;
    const categoryId = document.getElementById('productCategory').value;
    const stock = parseInt(document.getElementById('productStock').value) || 0;
    const available = document.getElementById('productAvailable').value === 'true';
    const imageFile = document.getElementById('productImage').files[0];
    
    try {
        let imageUrl = '';
        let imagePath = '';
        
        // Upload image if new file selected
        if (imageFile) {
            imagePath = `products/${Date.now()}_${imageFile.name}`;
            const imageRef = ref(storage, imagePath);
            await uploadBytes(imageRef, imageFile);
            imageUrl = await getDownloadURL(imageRef);
        } else if (productId) {
            // Keep existing image if editing and no new image
            const productDoc = await getDoc(doc(db, 'products', productId));
            if (productDoc.exists()) {
                imageUrl = productDoc.data().image || '';
                imagePath = productDoc.data().imagePath || '';
            }
        }
        
        const productData = {
            name,
            description,
            price,
            discountPrice,
            categoryId,
            stock,
            available,
            image: imageUrl,
            imagePath: imagePath,
            updatedAt: new Date()
        };
        
        if (productId) {
            // Update existing product
            await updateDoc(doc(db, 'products', productId), productData);
            alert('تم تحديث المنتج بنجاح');
        } else {
            // Add new product
            productData.createdAt = new Date();
            await addDoc(collection(db, 'products'), productData);
            alert('تم إضافة المنتج بنجاح');
        }
        
        closeProductModal();
        loadProducts();
    } catch (error) {
        console.error('Error saving product:', error);
        alert('حدث خطأ أثناء حفظ المنتج');
    }
}

