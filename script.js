// script.js - منطق موقع تسويق الجزائر VIPs

// بيانات التطبيق
const App = {
    currentUser: null,
    users: [],
    posts: [],
    products: [],
    groups: [],
    notifications: [],
    isInitialized: false,
    
    // بيانات المسؤول الافتراضية
    adminUser: {
        id: 'admin-001',
        name: 'أيوب',
        username: 'ayoubabd',
        email: 'AyuobAyuob5565@gmail.com',
        password: 'AyuobAyuob2000',
        phone: '+213550123456',
        city: 'الجزائر العاصمة',
        birthdate: '1990-01-01',
        bio: 'مدير منصة تسويق الجزائر VIPs',
        role: 'مدير المنصة',
        isAdmin: true,
        isVerified: true,
        avatar: 'default-avatar.jpg',
        cover: 'default-cover.jpg',
        joined: '2023-01-01',
        friends: [],
        products: []
    },
    
    // تهيئة التطبيق
    init() {
        this.loadData();
        this.bindEvents();
        this.checkLoginStatus();
        this.isInitialized = true;
        console.log('✅ تطبيق تسويق الجزائر VIPs جاهز للاستخدام');
    },
    
    // تحميل البيانات من LocalStorage
    loadData() {
        // تحميل المستخدمين
        const usersData = localStorage.getItem('algeria_vips_users');
        if (usersData) {
            this.users = JSON.parse(usersData);
        } else {
            // بيانات أولية
            this.users = [this.adminUser];
            this.saveUsers();
        }
        
        // تحميل المنشورات
        const postsData = localStorage.getItem('algeria_vips_posts');
        if (postsData) {
            this.posts = JSON.parse(postsData);
        } else {
            this.posts = this.getSamplePosts();
            this.savePosts();
        }
        
        // تحميل المنتجات
        const productsData = localStorage.getItem('algeria_vips_products');
        if (productsData) {
            this.products = JSON.parse(productsData);
        } else {
            this.products = this.getSampleProducts();
            this.saveProducts();
        }
        
        // تحميل المجموعات
        const groupsData = localStorage.getItem('algeria_vips_groups');
        if (groupsData) {
            this.groups = JSON.parse(groupsData);
        } else {
            this.groups = this.getSampleGroups();
            this.saveGroups();
        }
        
        // تحميل الإشعارات
        const notificationsData = localStorage.getItem('algeria_vips_notifications');
        if (notificationsData) {
            this.notifications = JSON.parse(notificationsData);
        }
    },
    
    // حفظ البيانات في LocalStorage
    saveUsers() {
        localStorage.setItem('algeria_vips_users', JSON.stringify(this.users));
    },
    
    savePosts() {
        localStorage.setItem('algeria_vips_posts', JSON.stringify(this.posts));
    },
    
    saveProducts() {
        localStorage.setItem('algeria_vips_products', JSON.stringify(this.products));
    },
    
    saveGroups() {
        localStorage.setItem('algeria_vips_groups', JSON.stringify(this.groups));
    },
    
    saveNotifications() {
        localStorage.setItem('algeria_vips_notifications', JSON.stringify(this.notifications));
    },
    
    // ربط الأحداث
    bindEvents() {
        // تسجيل الدخول
        document.getElementById('login-form')?.addEventListener('submit', (e) => this.handleLogin(e));
        
        // التسجيل
        document.getElementById('register-form')?.addEventListener('submit', (e) => this.handleRegister(e));
        
        // تبديل بين صفحتي الدخول والتسجيل
        document.getElementById('show-register')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.switchPage('register-page');
        });
        
        document.getElementById('show-login')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.switchPage('login-page');
        });
        
        // تسجيل الخروج
        document.getElementById('logout-btn')?.addEventListener('click', (e) => this.handleLogout(e));
        document.getElementById('sidebar-logout')?.addEventListener('click', (e) => this.handleLogout(e));
        
        // نشر منشور
        document.getElementById('publish-post')?.addEventListener('click', () => this.publishPost());
        
        // إضافة صورة للمنشور
        document.getElementById('add-photo')?.addEventListener('click', () => {
            document.getElementById('photo-input').click();
        });
        
        document.getElementById('photo-input')?.addEventListener('change', (e) => this.handleImageUpload(e));
        
        // البحث
        document.getElementById('search-btn')?.addEventListener('click', () => this.handleSearch());
        document.getElementById('search-input')?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handleSearch();
        });
        
        // التنقل بين الصفحات
        document.querySelectorAll('[data-page]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const pageId = link.getAttribute('data-page') + '-page';
                this.switchPage(pageId);
                this.loadPageContent(pageId);
            });
        });
        
        // إضافة منتج
        document.getElementById('add-product-btn')?.addEventListener('click', () => this.showModal('add-product-modal'));
        
        // نموذج إضافة منتج
        document.getElementById('add-product-form')?.addEventListener('submit', (e) => this.handleAddProduct(e));
        
        // نموذج تحديث الملف الشخصي
        document.getElementById('profile-form')?.addEventListener('submit', (e) => this.updateProfile(e));
        
        // نموذج تغيير كلمة المرور
        document.getElementById('password-form')?.addEventListener('submit', (e) => this.changePassword(e));
        
        // إغلاق النماذج المنبثقة
        document.querySelectorAll('.close-modal').forEach(btn => {
            btn.addEventListener('click', () => this.hideAllModals());
        });
        
        // النقر خارج النماذج لإغلاقها
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.hideAllModals();
            }
        });
        
        // تحميل صورة الملف الشخصي
        document.getElementById('user-avatar')?.addEventListener('click', () => {
            this.showModal('upload-avatar-modal');
        });
        
        document.getElementById('upload-avatar-form')?.addEventListener('submit', (e) => this.uploadAvatar(e));
        
        document.getElementById('avatar-input')?.addEventListener('change', (e) => {
            this.previewImage(e, 'avatar-preview');
        });
    },
    
    // التحقق من حالة الدخول
    checkLoginStatus() {
        const savedUser = localStorage.getItem('algeria_vips_current_user');
        if (savedUser) {
            this.currentUser = JSON.parse(savedUser);
            this.showMainApp();
        }
    },
    
    // تسجيل الدخول
    handleLogin(e) {
        e.preventDefault();
        
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const remember = document.getElementById('remember').checked;
        
        // التحقق من المدخلات
        if (!email || !password) {
            this.showAlert('يرجى ملء جميع الحقول', 'error');
            return;
        }
        
        // البحث عن المستخدم
        const user = this.users.find(u => u.email === email && u.password === password);
        
        if (user) {
            this.currentUser = user;
            
            // حفظ حالة الدخول
            if (remember) {
                localStorage.setItem('algeria_vips_current_user', JSON.stringify(user));
            } else {
                sessionStorage.setItem('algeria_vips_current_user', JSON.stringify(user));
            }
            
            // إظهار التطبيق الرئيسي
            this.showMainApp();
            this.showAlert(`مرحباً بعودتك ${user.name}!`, 'success');
        } else {
            this.showAlert('البريد الإلكتروني أو كلمة المرور غير صحيحة', 'error');
        }
    },
    
    // التسجيل
    handleRegister(e) {
        e.preventDefault();
        
        // جمع البيانات
        const userData = {
            id: 'user-' + Date.now(),
            name: document.getElementById('reg-name').value.trim(),
            username: document.getElementById('reg-username').value.trim(),
            email: document.getElementById('reg-email').value.trim(),
            password: document.getElementById('reg-password').value,
            phone: document.getElementById('reg-phone').value.trim(),
            city: document.getElementById('reg-city').value,
            birthdate: document.getElementById('reg-birthdate').value,
            bio: '',
            role: 'مستخدم جديد',
            isAdmin: false,
            isVerified: false,
            avatar: 'default-avatar.jpg',
            cover: 'default-cover.jpg',
            joined: new Date().toISOString().split('T')[0],
            friends: [],
            products: []
        };
        
        // التحقق من المدخلات
        if (!userData.name || !userData.username || !userData.email || !userData.password) {
            this.showAlert('يرجى ملء جميع الحقول المطلوبة', 'error');
            return;
        }
        
        if (userData.password.length < 6) {
            this.showAlert('كلمة المرور يجب أن تكون 6 أحرف على الأقل', 'error');
            return;
        }
        
        if (userData.password !== document.getElementById('reg-confirm-password').value) {
            this.showAlert('كلمات المرور غير متطابقة', 'error');
            return;
        }
        
        // التحقق من عدم وجود حساب بنفس البريد
        if (this.users.some(u => u.email === userData.email)) {
            this.showAlert('هذا البريد الإلكتروني مسجل بالفعل', 'error');
            return;
        }
        
        // التحقق من عدم وجود حساب بنفس اسم المستخدم
        if (this.users.some(u => u.username === userData.username)) {
            this.showAlert('اسم المستخدم هذا مستخدم بالفعل', 'error');
            return;
        }
        
        // إضافة المستخدم
        this.users.push(userData);
        this.saveUsers();
        
        // تسجيل الدخول تلقائياً
        this.currentUser = userData;
        localStorage.setItem('algeria_vips_current_user', JSON.stringify(userData));
        
        // إظهار التطبيق الرئيسي
        this.showMainApp();
        this.showAlert(`تم إنشاء حسابك بنجاح ${userData.name}!`, 'success');
    },
    
    // تسجيل الخروج
    handleLogout(e) {
        e.preventDefault();
        
        if (confirm('هل أنت متأكد من تسجيل الخروج؟')) {
            this.currentUser = null;
            localStorage.removeItem('algrria_vips_current_user');
            sessionStorage.removeItem('algeria_vips_current_user');
            
            this.hideMainApp();
            this.switchPage('login-page');
            
            // إعادة تعيين النماذج
            document.getElementById('login-form')?.reset();
            document.getElementById('register-form')?.reset();
            
            this.showAlert('تم تسجيل الخروج بنجاح', 'success');
        }
    },
    
    // إظهار التطبيق الرئيسي
    showMainApp() {
        document.getElementById('login-page').classList.remove('active');
        document.getElementById('register-page').classList.remove('active');
        document.getElementById('main-app').style.display = 'block';
        
        // تحديث واجهة المستخدم
        this.updateUI();
        
        // تحميل المحتوى الأولي
        this.loadPageContent('home-page');
    },
    
    // إخفاء التطبيق الرئيسي
    hideMainApp() {
        document.getElementById('main-app').style.display = 'none';
        document.getElementById('login-page').classList.add('active');
    },
    
    // تبديل بين الصفحات
    switchPage(pageId) {
        // إخفاء جميع الصفحات
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });
        
        // إظهار الصفحة المحددة
        const targetPage = document.getElementById(pageId);
        if (targetPage) {
            targetPage.classList.add('active');
        }
        
        // تحديث القائمة الجانبية النشطة
        document.querySelectorAll('.sidebar-menu a').forEach(link => {
            link.classList.remove('active');
            const linkPage = link.getAttribute('data-page');
            if (pageId === `${linkPage}-page`) {
                link.classList.add('active');
            }
        });
    },
    
    // تحديث واجهة المستخدم
    updateUI() {
        if (!this.currentUser) return;
        
        // تحديث المعلومات الشخصية
        document.getElementById('user-name').textContent = this.currentUser.name;
        document.getElementById('user-role').innerHTML = this.currentUser.role + 
            (this.currentUser.isAdmin ? ' <span class="admin-badge">ADMIN</span>' : '');
        
        // تحديث الصورة
        const avatarUrl = this.currentUser.avatar === 'default-avatar.jpg' 
            ? 'https://via.placeholder.com/150' 
            : this.currentUser.avatar;
        
        document.getElementById('user-avatar').src = avatarUrl;
        document.getElementById('header-user-avatar').src = avatarUrl;
        document.getElementById('post-user-avatar').src = avatarUrl;
        
        // تحديث الإحصائيات
        this.updateStats();
        
        // تحديث لوحة التحكم
        if (this.currentUser.isAdmin) {
            this.loadAdminPanel();
        }
    },
    
    // تحديث الإحصائيات
    updateStats() {
        // عدد الأصدقاء
        const friendsCount = this.currentUser.friends?.length || 0;
        document.getElementById('friends-count').textContent = friendsCount;
        
        // عدد المنشورات
        const userPosts = this.posts.filter(p => p.userId === this.currentUser.id).length;
        document.getElementById('posts-count').textContent = userPosts;
        
        // إحصائيات الموقع
        document.getElementById('site-users-count').textContent = this.users.length;
        document.getElementById('site-products-count').textContent = this.products.length;
        
        const todayPosts = this.posts.filter(p => {
            const postDate = new Date(p.createdAt).toDateString();
            const today = new Date().toDateString();
            return postDate === today;
        }).length;
        
        document.getElementById('site-posts-count').textContent = todayPosts;
    },
    
    // نشر منشور
    publishPost() {
        const content = document.getElementById('post-content').value.trim();
        
        if (!content) {
            this.showAlert('يرجى كتابة محتوى للمنشور', 'error');
            return;
        }
        
        const newPost = {
            id: 'post-' + Date.now(),
            userId: this.currentUser.id,
            userName: this.currentUser.name,
            userAvatar: this.currentUser.avatar,
            content: content,
            image: document.getElementById('photo-input').files[0] ? 
                   URL.createObjectURL(document.getElementById('photo-input').files[0]) : null,
            likes: [],
            comments: [],
            shares: 0,
            createdAt: new Date().toISOString(),
            isPending: !this.currentUser.isAdmin,
            isApproved: this.currentUser.isAdmin
        };
        
        this.posts.unshift(newPost);
        this.savePosts();
        
        // تحديث الواجهة
        this.loadPosts();
        
        // إعادة تعيين النموذج
        document.getElementById('post-content').value = '';
        document.getElementById('post-preview').style.display = 'none';
        document.getElementById('post-preview').innerHTML = '';
        document.getElementById('photo-input').value = '';
        
        this.showAlert('تم نشر منشورك بنجاح!', 'success');
        
        // إذا كان المستخدم غير مسؤول، إضافة إشعار للمسؤول
        if (!this.currentUser.isAdmin) {
            this.addNotification({
                id: 'notif-' + Date.now(),
                userId: 'admin-001',
                type: 'pending_post',
                title: 'منشور جديد يحتاج موافقة',
                message: `${this.currentUser.name} نشر منشوراً جديداً يحتاج إلى مراجعتك`,
                read: false,
                createdAt: new Date().toISOString()
            });
        }
    },
    
    // تحميل المنشورات
    loadPosts() {
        const container = document.getElementById('posts-container');
        if (!container) return;
        
        // الحصول على المنشورات المعتمدة فقط
        const approvedPosts = this.posts.filter(post => 
            post.isApproved || post.userId === this.currentUser.id
        );
        
        if (approvedPosts.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-newspaper"></i>
                    <h3>لا توجد منشورات بعد</h3>
                    <p>كن أول من ينشر على المنصة!</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = approvedPosts.map(post => `
            <div class="post" data-post-id="${post.id}">
                <div class="post-header">
                    <img src="${post.userAvatar === 'default-avatar.jpg' ? 'https://via.placeholder.com/50' : post.userAvatar}" 
                         alt="صورة ${post.userName}">
                    <div class="post-info">
                        <h4>${post.userName} 
                            ${post.userId === 'admin-001' ? '<i class="fas fa-check-circle verified-badge"></i>' : ''}
                        </h4>
                        <span>${this.formatDate(post.createdAt)} · 
                            ${post.isPending ? '<i class="fas fa-clock" style="color: #ffc107;"></i>' : '<i class="fas fa-globe-africa"></i>'}</span>
                    </div>
                    ${this.currentUser.isAdmin && post.isPending ? `
                        <div class="post-actions-admin">
                            <button class="btn btn-primary btn-sm" onclick="App.approvePost('${post.id}')">قبول</button>
                            <button class="btn btn-secondary btn-sm" onclick="App.rejectPost('${post.id}')">رفض</button>
                        </div>
                    ` : ''}
                </div>
                <div class="post-content">
                    <p>${post.content}</p>
                </div>
                ${post.image ? `
                    <img src="${post.image}" alt="صورة المنشور" class="post-image">
                ` : ''}
                <div class="post-stats">
                    <div><i class="fas fa-thumbs-up"></i> <span class="like-count">${post.likes.length}</span></div>
                    <div><span class="comment-count">${post.comments.length}</span> تعليق · 
                         <span class="share-count">${post.shares}</span> مشاركة</div>
                </div>
                <div class="post-buttons">
                    <div class="post-button like-btn ${post.likes.includes(this.currentUser.id) ? 'active' : ''}" 
                         onclick="App.toggleLike('${post.id}')">
                        <i class="${post.likes.includes(this.currentUser.id) ? 'fas' : 'far'} fa-thumbs-up"></i>
                        <span>إعجاب</span>
                    </div>
                    <div class="post-button" onclick="App.showComments('${post.id}')">
                        <i class="fas fa-comment"></i>
                        <span>تعليق</span>
                    </div>
                    <div class="post-button" onclick="App.sharePost('${post.id}')">
                        <i class="fas fa-share"></i>
                        <span>مشاركة</span>
                    </div>
                </div>
                <div class="comments-section" id="comments-${post.id}" style="display: none;">
                    <!-- التعليقات تظهر هنا -->
                </div>
            </div>
        `).join('');
    },
    
    // الموافقة على منشور
    approvePost(postId) {
        const postIndex = this.posts.findIndex(p => p.id === postId);
        if (postIndex !== -1) {
            this.posts[postIndex].isApproved = true;
            this.posts[postIndex].isPending = false;
            this.savePosts();
            this.loadPosts();
            this.showAlert('تمت الموافقة على المنشور', 'success');
        }
    },
    
    // رفض منشور
    rejectPost(postId) {
        if (confirm('هل أنت متأكد من رفض هذا المنشور؟')) {
            this.posts = this.posts.filter(p => p.id !== postId);
            this.savePosts();
            this.loadPosts();
            this.showAlert('تم رفض المنشور', 'success');
        }
    },
    
    // الإعجاب بالمنشور
    toggleLike(postId) {
        const postIndex = this.posts.findIndex(p => p.id === postId);
        if (postIndex === -1) return;
        
        const post = this.posts[postIndex];
        const likeIndex = post.likes.indexOf(this.currentUser.id);
        
        if (likeIndex === -1) {
            post.likes.push(this.currentUser.id);
        } else {
            post.likes.splice(likeIndex, 1);
        }
        
        this.savePosts();
        this.loadPosts();
    },
    
    // تحميل المحتوى حسب الصفحة
    loadPageContent(pageId) {
        switch (pageId) {
            case 'home-page':
                this.loadPosts();
                break;
            case 'market-page':
                this.loadProducts();
                break;
            case 'admin-page':
                this.loadAdminPanel();
                break;
            case 'profile-page':
                this.loadProfile();
                break;
            case 'friends-page':
                this.loadFriends();
                break;
            case 'groups-page':
                this.loadGroups();
                break;
            case 'settings-page':
                this.loadSettings();
                break;
        }
    },
    
    // تحميل المنتجات
    loadProducts() {
        const container = document.getElementById('products-container');
        if (!container) return;
        
        const userProducts = this.products.filter(p => p.userId === this.currentUser.id);
        
        if (userProducts.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-store"></i>
                    <h3>لا توجد منتجات معروضة</h3>
                    <p>أضف منتجاتك الأولى للبيع!</p>
                    <button class="btn btn-primary" onclick="App.showModal('add-product-modal')">إضافة منتج جديد</button>
                </div>
            `;
            return;
        }
        
        container.innerHTML = userProducts.map(product => `
            <div class="product-card">
                <img src="${product.image || 'https://via.placeholder.com/300x200'}" 
                     alt="${product.name}" class="product-image">
                <div class="product-info">
                    <h4>${product.name}</h4>
                    <div class="product-price">${product.price} دج</div>
                    <p class="product-description">${product.description}</p>
                    <div class="product-category">
                        <span class="tag">${product.category}</span>
                    </div>
                    <div class="product-actions">
                        <button class="btn btn-primary btn-sm" onclick="App.editProduct('${product.id}')">تعديل</button>
                        <button class="btn btn-secondary btn-sm" onclick="App.deleteProduct('${product.id}')">حذف</button>
                    </div>
                </div>
            </div>
        `).join('');
    },
    
    // إضافة منتج جديد
    handleAddProduct(e) {
        e.preventDefault();
        
        const product = {
            id: 'product-' + Date.now(),
            userId: this.currentUser.id,
            name: document.getElementById('product-name').value.trim(),
            price: parseInt(document.getElementById('product-price').value),
            description: document.getElementById('product-description').value.trim(),
            category: document.getElementById('product-category').value,
            image: null,
            createdAt: new Date().toISOString(),
            isActive: true
        };
        
        // معالجة صورة المنتج
        const imageInput = document.getElementById('product-image');
        if (imageInput.files[0]) {
            product.image = URL.createObjectURL(imageInput.files[0]);
        }
        
        this.products.push(product);
        this.saveProducts();
        
        this.hideAllModals();
        this.loadProducts();
        this.showAlert('تم إضافة المنتج بنجاح', 'success');
    },
    
    // تحميل لوحة التحكم
    loadAdminPanel() {
        if (!this.currentUser.isAdmin) return;
        
        // تحديث اسم المسؤول
        document.getElementById('admin-name').textContent = this.currentUser.name;
        
        // تحميل المنشورات المعلقة
        this.loadPendingPosts();
        
        // تحميل إحصائيات المسؤول
        this.loadAdminStats();
    },
    
    // تحميل المنشورات المعلقة
    loadPendingPosts() {
        const container = document.getElementById('pending-posts-container');
        if (!container) return;
        
        const pendingPosts = this.posts.filter(p => p.isPending && !p.isApproved);
        
        if (pendingPosts.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-check-circle"></i>
                    <h3>لا توجد منشورات معلقة</h3>
                    <p>كل المنشورات معتمدة ✓</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = pendingPosts.map(post => `
            <div class="post pending-post">
                <div class="post-header">
                    <img src="${post.userAvatar === 'default-avatar.jpg' ? 'https://via.placeholder.com/50' : post.userAvatar}" 
                         alt="صورة ${post.userName}">
                    <div class="post-info">
                        <h4>${post.userName}</h4>
                        <span>${this.formatDate(post.createdAt)}</span>
                    </div>
                </div>
                <div class="post-content">
                    <p>${post.content}</p>
                </div>
                ${post.image ? `
                    <img src="${post.image}" alt="صورة المنشور" class="post-image">
                ` : ''}
                <div class="admin-post-actions">
                    <button class="btn btn-success" onclick="App.approvePost('${post.id}')">✓ قبول</button>
                    <button class="btn btn-danger" onclick="App.rejectPost('${post.id}')">✗ رفض</button>
                    <button class="btn btn-warning" onclick="App.editPost('${post.id}')">✎ تعديل</button>
                </div>
            </div>
        `).join('');
    },
    
    // تحميل الإحصائيات الإدارية
    loadAdminStats() {
        const controlsContainer = document.getElementById('admin-controls');
        if (!controlsContainer) return;
        
        const stats = {
            totalUsers: this.users.length,
            activeUsers: this.users.filter(u => u.isVerified).length,
            totalPosts: this.posts.length,
            pendingPosts: this.posts.filter(p => p.isPending).length,
            totalProducts: this.products.length,
            totalGroups: this.groups.length
        };
        
        controlsContainer.innerHTML = `
            <div class="control-card" onclick="App.showUserManagement()">
                <i class="fas fa-users-cog"></i>
                <h4>إدارة المستخدمين</h4>
                <p>${stats.totalUsers} مستخدم · ${stats.activeUsers} نشطين</p>
            </div>
            
            <div class="control-card" onclick="App.showPendingPosts()">
                <i class="fas fa-file-alt"></i>
                <h4>المنشورات المعلقة</h4>
                <p>${stats.pendingPosts} منشور يحتاج مراجعة</p>
            </div>
            
            <div class="control-card" onclick="App.showProductManagement()">
                <i class="fas fa-shopping-cart"></i>
                <h4>إدارة المنتجات</h4>
                <p>${stats.totalProducts} منتج معروض</p>
            </div>
            
            <div class="control-card" onclick="App.showSiteStats()">
                <i class="fas fa-chart-bar"></i>
                <h4>الإحصائيات</h4>
                <p>عرض تقارير مفصلة</p>
            </div>
            
            <div class="control-card" onclick="App.showSiteSettings()">
                <i class="fas fa-cogs"></i>
                <h4>إعدادات الموقع</h4>
                <p>تعديل إعدادات المنصة</p>
            </div>
            
            <div class="control-card" onclick="App.showNotificationsPanel()">
                <i class="fas fa-bell"></i>
                <h4>الإشعارات</h4>
                <p>إرسال إشعارات للمستخدمين</p>
            </div>
        `;
    },
    
    // تحميل الإعدادات
    loadSettings() {
        if (!this.currentUser) return;
        
        document.getElementById('settings-name').value = this.currentUser.name;
        document.getElementById('settings-email').value = this.currentUser.email;
        document.getElementById('settings-phone').value = this.currentUser.phone;
        document.getElementById('settings-city').value = this.currentUser.city;
        document.getElementById('settings-bio').value = this.currentUser.bio || '';
    },
    
    // تحديث الملف الشخصي
    updateProfile(e) {
        e.preventDefault();
        
        const updatedData = {
            name: document.getElementById('settings-name').value.trim(),
            phone: document.getElementById('settings-phone').value.trim(),
            city: document.getElementById('settings-city').value,
            bio: document.getElementById('settings-bio').value.trim()
        };
        
        // تحديث بيانات المستخدم
        Object.assign(this.currentUser, updatedData);
        
        // تحديث في قائمة المستخدمين
        const userIndex = this.users.findIndex(u => u.id === this.currentUser.id);
        if (userIndex !== -1) {
            this.users[userIndex] = this.currentUser;
            this.saveUsers();
        }
        
        // تحديث التخزين المحلي
        localStorage.setItem('algeria_vips_current_user', JSON.stringify(this.currentUser));
        
        // تحديث الواجهة
        this.updateUI();
        
        this.showAlert('تم تحديث الملف الشخصي بنجاح', 'success');
    },
    
    // تغيير كلمة المرور
    changePassword(e) {
        e.preventDefault();
        
        const currentPassword = document.getElementById('current-password').value;
        const newPassword = document.getElementById('new-password').value;
        const confirmPassword = document.getElementById('confirm-new-password').value;
        
        if (currentPassword !== this.currentUser.password) {
            this.showAlert('كلمة المرور الحالية غير صحيحة', 'error');
            return;
        }
        
        if (newPassword.length < 6) {
            this.showAlert('كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل', 'error');
            return;
        }
        
        if (newPassword !== confirmPassword) {
            this.showAlert('كلمات المرور الجديدة غير متطابقة', 'error');
            return;
        }
        
        // تحديث كلمة المرور
        this.currentUser.password = newPassword;
        
        // تحديث في قائمة المستخدمين
        const userIndex = this.users.findIndex(u => u.id === this.currentUser.id);
        if (userIndex !== -1) {
            this.users[userIndex].password = newPassword;
            this.saveUsers();
        }
        
        // تحديث التخزين المحلي
        localStorage.setItem('algeria_vips_current_user', JSON.stringify(this.currentUser));
        
        // إعادة تعيين النموذج
        document.getElementById('password-form').reset();
        
        this.showAlert('تم تغيير كلمة المرور بنجاح', 'success');
    },
    
    // تحميل الملف الشخصي
    loadProfile() {
        document.getElementById('profile-name').textContent = this.currentUser.name;
        document.getElementById('profile-role').textContent = this.currentUser.role;
        document.getElementById('profile-avatar').src = 
            this.currentUser.avatar === 'default-avatar.jpg' 
            ? 'https://via.placeholder.com/150' 
            : this.currentUser.avatar;
        
        // تحميل منشورات المستخدم
        const userPosts = this.posts.filter(p => 
            p.userId === this.currentUser.id && p.isApproved
        );
        
        const container = document.getElementById('profile-posts-container');
        if (userPosts.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-newspaper"></i>
                    <h3>لا توجد منشورات</h3>
                    <p>${this.currentUser.name} لم ينشر أي شيء بعد</p>
                </div>
            `;
        } else {
            container.innerHTML = userPosts.map(post => `
                <div class="post">
                    <div class="post-content">
                        <p>${post.content}</p>
                    </div>
                    ${post.image ? `
                        <img src="${post.image}" alt="صورة المنشور" class="post-image">
                    ` : ''}
                    <div class="post-stats">
                        <div><i class="fas fa-thumbs-up"></i> ${post.likes.length}</div>
                        <div>${post.comments.length} تعليق · ${post.shares} مشاركة</div>
                    </div>
                </div>
            `).join('');
        }
    },
    
    // رفع صورة الملف الشخصي
    uploadAvatar(e) {
        e.preventDefault();
        
        const input = document.getElementById('avatar-input');
        if (!input.files[0]) {
            this.showAlert('يرجى اختيار صورة', 'error');
            return;
        }
        
        const file = input.files[0];
        const reader = new FileReader();
        
        reader.onload = (e) => {
            this.currentUser.avatar = e.target.result;
            
            // تحديث في قائمة المستخدمين
            const userIndex = this.users.findIndex(u => u.id === this.currentUser.id);
            if (userIndex !== -1) {
                this.users[userIndex].avatar = e.target.result;
                this.saveUsers();
            }
            
            // تحديث التخزين المحلي
            localStorage.setItem('algeria_vips_current_user', JSON.stringify(this.currentUser));
            
            // تحديث الواجهة
            this.updateUI();
            
            this.hideAllModals();
            this.showAlert('تم تحديث صورة الملف الشخصي بنجاح', 'success');
        };
        
        reader.readAsDataURL(file);
    },
    
    // معاينة الصورة
    previewImage(event, previewId) {
        const input = event.target;
        const preview = document.getElementById(previewId);
        
        if (input.files && input.files[0]) {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                preview.src = e.target.result;
                preview.style.display = 'block';
            };
            
            reader.readAsDataURL(input.files[0]);
        }
    },
    
    // معالجة رفع الصورة
    handleImageUpload(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        if (!file.type.startsWith('image/')) {
            this.showAlert('يرجى اختيار ملف صورة فقط', 'error');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = (e) => {
            const preview = document.getElementById('post-preview');
            preview.innerHTML = `
                <h4>معاينة الصورة:</h4>
                <img src="${e.target.result}" alt="معاينة الصورة">
            `;
            preview.style.display = 'block';
        };
        
        reader.readAsDataURL(file);
    },
    
    // البحث
    handleSearch() {
        const query = document.getElementById('search-input').value.trim();
        if (!query) return;
        
        // البحث في المنشورات
        const searchResults = this.posts.filter(post => 
            post.content.toLowerCase().includes(query.toLowerCase()) && post.isApproved
        );
        
        // عرض النتائج
        const container = document.getElementById('posts-container');
        if (searchResults.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-search"></i>
                    <h3>لا توجد نتائج</h3>
                    <p>لم نتمكن من العثور على منشورات تطابق بحثك</p>
                </div>
            `;
        } else {
            // يمكن هنا تحميل النتائج بشكل مناسب
            this.showAlert(`تم العثور على ${searchResults.length} نتيجة`, 'info');
        }
    },
    
    // إضافة إشعار
    addNotification(notification) {
        this.notifications.push(notification);
        this.saveNotifications();
        this.updateNotificationCount();
    },
    
    // تحديث عداد الإشعارات
    updateNotificationCount() {
        const unreadCount = this.notifications.filter(n => !n.read).length;
        const countElement = document.querySelector('.notification-count');
        if (countElement) {
            countElement.textContent = unreadCount;
            countElement.style.display = unreadCount > 0 ? 'flex' : 'none';
        }
    },
    
    // عرض تنبيه
    showAlert(message, type = 'info') {
        // إنشاء عنصر التنبيه
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type}`;
        alertDiv.innerHTML = `
            ${type === 'success' ? '✓' : type === 'error' ? '✗' : 'ℹ'} 
            ${message}
            <span class="close-alert">&times;</span>
        `;
        
        // إضافة التنبيه إلى الصفحة
        const container = document.querySelector('.container') || document.body;
        container.insertBefore(alertDiv, container.firstChild);
        
        // إغلاق التنبيه
        const closeBtn = alertDiv.querySelector('.close-alert');
        closeBtn.addEventListener('click', () => {
            alertDiv.remove();
        });
        
        // إزالة التنبيه تلقائياً بعد 5 ثوانٍ
        setTimeout(() => {
            if (alertDiv.parentNode) {
                alertDiv.remove();
            }
        }, 5000);
    },
    
    // تنسيق التاريخ
    formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);
        
        if (diffMins < 1) return 'الآن';
        if (diffMins < 60) return `منذ ${diffMins} دقيقة`;
        if (diffHours < 24) return `منذ ${diffHours} ساعة`;
        if (diffDays < 7) return `منذ ${diffDays} يوم`;
        
        return date.toLocaleDateString('ar-EG');
    },
    
    // عرض النموذج المنبثق
    showModal(modalId) {
        document.getElementById(modalId).classList.add('active');
    },
    
    // إخفاء جميع النماذج المنبثقة
    hideAllModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.remove('active');
        });
    },
    
    // بيانات عينة للمنشورات
    getSamplePosts() {
        return [
            {
                id: 'post-1',
                userId: 'admin-001',
                userName: 'أيوب',
                userAvatar: 'default-avatar.jpg',
                content: 'مرحباً بكم في منصة تسويق الجزائر VIPs! منصة متكاملة للتسويق والتجارة الإلكترونية.',
                image: null,
                likes: ['admin-001'],
                comments: [],
                shares: 5,
                createdAt: '2023-10-01T10:00:00',
                isPending: false,
                isApproved: true
            },
            {
                id: 'post-2',
                userId: 'user-001',
                userName: 'أحمد الجزائري',
                userAvatar: 'default-avatar.jpg',
                content: 'أقدم لكم أجود أنواع التمور الجزائرية بأسعار منافسة!',
                image: null,
                likes: ['admin-001', 'user-001'],
                comments: [],
                shares: 2,
                createdAt: '2023-10-02T14:30:00',
                isPending: false,
                isApproved: true
            }
        ];
    },
    
    // بيانات عينة للمنتجات
    getSampleProducts() {
        return [
            {
                id: 'product-1',
                userId: 'admin-001',
                name: 'سجاد جزائري تقليدي',
                price: 25000,
                description: 'سجاد يدوي الصنع من أجود أنواع الصوف، تصميم تقليدي جزائري.',
                category: 'منتجات تقليدية',
                image: null,
                createdAt: '2023-10-01T09:00:00',
                isActive: true
            },
            {
                id: 'product-2',
                userId: 'admin-001',
                name: 'تمور دقلة نور',
                price: 3500,
                description: 'تمور جزائرية عالية الجودة، طازجة وطبيعية 100%.',
                category: 'طعام',
                image: null,
                createdAt: '2023-10-01T10:00:00',
                isActive: true
            }
        ];
    },
    
    // بيانات عينة للمجموعات
    getSampleGroups() {
        return [
            {
                id: 'group-1',
                name: 'تجار الجزائر',
                description: 'مجموعة لتجار الجزائر لتبادل الخبرات والعروض',
                members: ['admin-001'],
                posts: [],
                createdAt: '2023-10-01T00:00:00',
                isPublic: true
            },
            {
                id: 'group-2',
                name: 'منتجات جزائرية أصلية',
                description: 'لعرض وبيع المنتجات الجزائرية الأصيلة',
                members: ['admin-001'],
                posts: [],
                createdAt: '2023-10-01T00:00:00',
                isPublic: true
            }
        ];
    },
    
    // تحميل الأصدقاء
    loadFriends() {
        const container = document.querySelector('.friends-container');
        if (!container) return;
        
        // عرض رسالة غير مكتملة
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-user-friends"></i>
                <h3>قائمة الأصدقاء</h3>
                <p>هذه الميزة قيد التطوير حالياً</p>
                <p>ستكون متاحة قريباً في التحديثات القادمة</p>
            </div>
        `;
    },
    
    // تحميل المجموعات
    loadGroups() {
        const container = document.querySelector('.groups-container');
        if (!container) return;
        
        if (this.groups.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-users"></i>
                    <h3>لا توجد مجموعات</h3>
                    <p>لم تنضم إلى أي مجموعة بعد</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = this.groups.map(group => `
            <div class="group-card">
                <div class="group-info">
                    <h4>${group.name}</h4>
                    <p>${group.description}</p>
                    <div class="group-meta">
                        <span><i class="fas fa-users"></i> ${group.members.length} عضو</span>
                        <span><i class="fas fa-newspaper"></i> ${group.posts.length} منشور</span>
                    </div>
                    <button class="btn btn-primary">الانضمام</button>
                </div>
            </div>
        `).join('');
    }
};

// تهيئة التطبيق عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});

// تصدير الكائن App للاستخدام في وحدة التحكم
window.App = App;
