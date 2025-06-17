// Global variables
let allProducts = [];
let currentCategory = 'all';
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let selectedItems = new Set(); // Track selected items
let currentSlideIndex = parseInt(localStorage.getItem('currentSlideIndex')) || 0;
const totalSlides = 3;
let slideInterval;
let refreshInterval; // Tambahan untuk auto-refresh

//---------------------------------- Fungsi untuk menyimpan data ke localStorage ----------------------------------\\
function saveToLocalStorage(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

//---------------------------------- Fungsi untuk mengambil data dari localStorage ----------------------------------\\
function getFromLocalStorage(key, defaultValue = null) {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : defaultValue;
}

//---------------------------------- Fungsi untuk menyimpan data profile ke localStorage ----------------------------------\\
function saveProfileToStorage(profile) {
  saveToLocalStorage('userProfile', profile);
}

//---------------------------------- Fungsi untuk mengambil data profile dari localStorage ----------------------------------\\
function getProfileFromStorage() {
  return getFromLocalStorage('userProfile', {
    name: 'Lukasss',
    email: 'user@example.com',
    phone: '+62 821-2597-5449',
    birthDate: '1990-01-15',
    gender: 'Laki-laki',
    username: 'Lukasss123',
    photo: null,
    initial: 'U'
  });
}

//---------------------------------- Fungsi untuk menyimpan data produk ke localStorage ----------------------------------\\
function saveProductsToStorage(products) {
  saveToLocalStorage('allProducts', products);
}

//---------------------------------- Fungsi untuk mengambil data produk dari localStorage ----------------------------------\\
function getProductsFromStorage() {
  return getFromLocalStorage('allProducts', []);
}

//---------------------------------- Fungsi untuk menyimpan data keranjang ke localStorage ----------------------------------\\
function saveCartToStorage() {
  saveToLocalStorage('cart', cart);
}

//---------------------------------- Fungsi untuk mengambil data keranjang dari localStorage ----------------------------------\\
function getCartFromStorage() {
  return getFromLocalStorage('cart', []);
}

//---------------------------------- Fungsi untuk menyimpan data slider ke localStorage ----------------------------------\\
function saveSliderToStorage() {
  saveToLocalStorage('currentSlideIndex', currentSlideIndex);
}

//---------------------------------- Fungsi untuk mengambil data slider dari localStorage ----------------------------------\\
function getSliderFromStorage() {
  return getFromLocalStorage('currentSlideIndex', 0);
}

//---------------------------------- Fungsi untuk mengambil data dari API ----------------------------------\\
async function ambilData() {
  try {
    // Cek apakah data sudah ada di localStorage
    const cachedProducts = getProductsFromStorage();
    if (cachedProducts.length > 0) {
      allProducts = cachedProducts;
      tampilkanProduk(allProducts);
      return;
    }

    // Tampilkan loading state
    const produkContainer = document.getElementById('produk');
    if (!produkContainer) {
      console.error('Container produk tidak ditemukan');
      return;
    }

    produkContainer.innerHTML = `
      <div class="col-span-full text-center py-16">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p class="text-gray-600">Memuat data produk...</p>
      </div>
    `;

    const response = await fetch("https://fakestoreapi.com/products");
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    
    // Tambahkan data tambahan untuk setiap produk
    allProducts = data.map(product => ({
      ...product,
      rating: {
        rate: product.rating.rate,
        count: product.rating.count
      },
      price: product.price,
      image: product.image,
      description: product.description,
      category: product.category,
      title: product.title
    }));

    saveProductsToStorage(allProducts);
    console.log('Data produk berhasil diambil:', allProducts);
    tampilkanProduk(allProducts);
  } catch (error) {
    console.error('Gagal mengambil data:', error);
    const produkContainer = document.getElementById('produk');
    if (produkContainer) {
    produkContainer.innerHTML = `
      <div class="col-span-full text-center py-16">
        <div class="text-red-500 text-2xl mb-4">⚠️ Gagal memuat data produk</div>
        <p class="text-gray-600 mb-4">Silakan coba refresh halaman atau periksa koneksi internet Anda</p>
        <button onclick="ambilData()" class="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
          Coba Lagi
        </button>
      </div>
    `;
  }
}
}

//--------------------- Fungsi untuk membuat rating bintang ----------------------------------\\
function createStarRating(rating) {
  const stars = [];
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;
  
  for (let i = 0; i < 5; i++) {
    if (i < fullStars) {
      stars.push('<span class="text-yellow-400">★</span>');
    } else if (i === fullStars && hasHalfStar) {
      stars.push('<span class="text-yellow-300">★</span>');
    } else {
      stars.push('<span class="text-gray-300">☆</span>');
    }
  }
  
  return stars.join('');
}

//---------------------------------- Fungsi untuk menampilkan produk ----------------------------------\\
function tampilkanProduk(products) {
  const produkContainer = document.getElementById('produk');
  if (!produkContainer) {
    console.error('Container produk tidak ditemukan');
    return;
  }

  produkContainer.innerHTML = '';

  if (!products || products.length === 0) {
    produkContainer.innerHTML = `
      <div class="col-span-full text-center py-16">
        <div class="text-gray-500 text-2xl mb-4">🔍 Tidak ada produk ditemukan</div>
        <p class="text-gray-600">Silakan coba kata kunci lain atau ubah filter kategori</p>
      </div>
    `;
    return;
  }

  products.forEach(product => {
    const productCard = document.createElement('div');
    productCard.className = 'bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 p-6 flex flex-col cursor-pointer transform hover:-translate-y-2';

    productCard.innerHTML = `
      <div class="relative w-full mb-4">
        <img src="${product.image}" alt="${product.title}" class="h-48 w-full object-contain transition-transform duration-300 hover:scale-105" />
        <span class="absolute top-2 right-2 bg-yellow-400 text-xs font-bold px-2 py-1 rounded-full shadow">⭐ ${product.rating.rate}</span>
      </div>
      <div class="flex-1 flex flex-col">
        <h3 class="font-bold text-lg mb-2 text-gray-800 line-clamp-2 leading-tight">${product.title}</h3>
        <p class="text-sm text-gray-500 capitalize mb-3 font-medium">${product.category}</p>
        <div class="flex items-center mb-3">
          <div class="flex items-center">
            ${createStarRating(product.rating.rate)}
          </div>
          <span class="text-sm text-gray-500 ml-2">(${product.rating.count} ulasan)</span>
        </div>
        <p class="text-blue-600 font-bold text-xl mb-6">Rp ${(product.price * 15000).toLocaleString('id-ID')}</p>
        <div class="grid grid-cols-2 gap-3 mt-auto">
          <button 
            onclick="event.stopPropagation(); tambahKeKeranjang(${product.id})"
            class="bg-blue-600 text-white px-4 py-3 rounded-xl hover:bg-blue-700 transition-all duration-200 text-sm font-semibold hover:scale-105">
            + Keranjang
          </button>
          <button 
            onclick="event.stopPropagation(); beliSekarang(${product.id})"
            class="bg-green-600 text-white px-4 py-3 rounded-xl hover:bg-green-700 transition-all duration-200 text-sm font-semibold hover:scale-105">
            Chekout
          </button>
        </div>
      </div>
    `;

    productCard.addEventListener('click', () => showProductDetail(product));
    produkContainer.appendChild(productCard);
  });
}

//---------------------------------- Fungsi untuk menampilkan detail produk ----------------------------------\\
function showProductDetail(product) {
  const modal = document.getElementById('productDetailModal');
  const content = document.getElementById('productDetailContent');
  
  content.innerHTML = `
    <div class="space-y-6">
      <!-- Product Header -->
    <div class="grid md:grid-cols-2 gap-8">
      <div class="space-y-4">
          <div class="relative">
        <img src="${product.image}" alt="${product.title}" class="w-full h-96 object-contain rounded-lg shadow-md" />
            <div class="absolute bottom-4 right-4 flex space-x-2">
              <button class="bg-white/80 dark:bg-gray-800/80 hover:bg-white dark:hover:bg-gray-800 p-2 rounded-full shadow-lg transition-all">
                <i class="fas fa-share-alt text-gray-600 dark:text-gray-300"></i>
              </button>
              <button class="bg-white/80 dark:bg-gray-800/80 hover:bg-white dark:hover:bg-gray-800 p-2 rounded-full shadow-lg transition-all">
                <i class="far fa-heart text-gray-600 dark:text-gray-300"></i>
              </button>
            </div>
          </div>
          <div class="grid grid-cols-4 gap-2">
            <div class="border-2 border-blue-500 rounded-lg p-1">
              <img src="${product.image}" alt="Thumbnail" class="w-full h-20 object-contain" />
            </div>
            <div class="border dark:border-gray-700 rounded-lg p-1">
              <img src="${product.image}" alt="Thumbnail" class="w-full h-20 object-contain" />
            </div>
            <div class="border dark:border-gray-700 rounded-lg p-1">
              <img src="${product.image}" alt="Thumbnail" class="w-full h-20 object-contain" />
            </div>
            <div class="border dark:border-gray-700 rounded-lg p-1">
              <img src="${product.image}" alt="Thumbnail" class="w-full h-20 object-contain" />
            </div>
          </div>
        </div>
        
        <div class="space-y-6">
          <div>
            <h1 class="text-2xl font-bold text-gray-800 dark:text-white mb-2">${product.title}</h1>
        <div class="flex items-center space-x-4">
              <div class="flex items-center text-lg">
            ${createStarRating(product.rating.rate)}
              </div>
              <div class="flex items-center space-x-2">
                <span class="text-gray-600 dark:text-gray-300">${product.rating.rate}</span>
                <span class="text-gray-400 dark:text-gray-500">|</span>
                <span class="text-gray-600 dark:text-gray-300">${product.rating.count} ulasan</span>
                <span class="text-gray-400 dark:text-gray-500">|</span>
                <span class="text-gray-600 dark:text-gray-300">${Math.floor(Math.random() * 1000)}+ terjual</span>
              </div>
            </div>
          </div>

          <div class="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl">
            <div class="flex items-baseline space-x-4">
              <span class="text-3xl font-bold text-blue-600 dark:text-blue-400">Rp ${(product.price * 15000).toLocaleString('id-ID')}</span>
              <span class="text-lg text-gray-500 dark:text-gray-400 line-through">Rp ${(product.price * 15000 * 1.2).toLocaleString('id-ID')}</span>
              <span class="bg-blue-500 text-white px-2 py-1 rounded text-sm">-20%</span>
            </div>
            <div class="mt-2 text-sm text-gray-600 dark:text-gray-400">
              <p>Harga sudah termasuk PPN</p>
            </div>
        </div>
        
          <div class="space-y-4">
            <div class="flex items-center space-x-4">
              <span class="text-gray-600 dark:text-gray-300 w-24">Pengiriman</span>
              <div class="flex-1">
                <div class="flex items-center space-x-2">
                  <i class="fas fa-truck text-green-500"></i>
                  <span class="text-gray-800 dark:text-white">Gratis Ongkir</span>
                </div>
                <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Dikirim dari Jakarta Pusat</p>
              </div>
            </div>
            <div class="flex items-center space-x-4">
              <span class="text-gray-600 dark:text-gray-300 w-24">Lokasi</span>
              <div class="flex-1">
                <div class="flex items-center space-x-2">
                  <i class="fas fa-map-marker-alt text-blue-500"></i>
                  <span class="text-gray-800 dark:text-white">Jakarta Pusat</span>
                </div>
              </div>
            </div>
        </div>
        
          <div class="space-y-4">
            <h3 class="font-semibold text-gray-800 dark:text-white">Pilih Varian</h3>
            <div class="flex flex-wrap gap-2">
              <button class="px-4 py-2 border-2 border-blue-500 text-blue-500 dark:text-blue-400 rounded-lg font-medium">Default</button>
              <button class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg font-medium text-gray-800 dark:text-gray-200">Varian 1</button>
              <button class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg font-medium text-gray-800 dark:text-gray-200">Varian 2</button>
            </div>
        </div>
        
        <div class="grid grid-cols-2 gap-4 pt-6">
          <button 
            onclick="tambahKeKeranjang(${product.id})"
            class="bg-blue-600 text-white py-4 rounded-xl hover:bg-blue-700 transition-all duration-200 font-semibold text-lg hover:scale-105">
              + Keranjang
          </button>
          <button 
            onclick="beliSekarang(${product.id})"
              class="bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 border-2 border-blue-600 dark:border-blue-400 py-4 rounded-xl hover:bg-blue-50 dark:hover:bg-gray-700 transition-all duration-200 font-semibold text-lg hover:scale-105">
            Beli Sekarang
          </button>
          </div>
        </div>
      </div>

      <!-- Product Tabs -->
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm">
        <div class="border-b dark:border-gray-700">
          <div class="flex space-x-8 px-6">
            <button class="py-4 border-b-2 border-blue-500 text-blue-500 dark:text-blue-400 font-medium">Deskripsi</button>
            <button class="py-4 text-gray-600 dark:text-gray-300 font-medium">Ulasan (${product.rating.count})</button>
            <button class="py-4 text-gray-600 dark:text-gray-300 font-medium">Diskusi</button>
          </div>
        </div>
        <div class="p-6 overflow-y-auto max-h-[300px]">
          <div class="dark:prose-invert">
            <h3 class="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Deskripsi Produk</h3>
            <p class="text-gray-600 dark:text-gray-300 leading-relaxed">${product.description}</p>
            
            <div class="mt-6 space-y-4">
              <h4 class="font-semibold text-gray-800 dark:text-white">Spesifikasi Produk</h4>
              <div class="grid grid-cols-2 gap-4">
                <div class="flex">
                  <span class="text-gray-600 dark:text-gray-300 w-32">Kategori</span>
                  <span class="text-gray-800 dark:text-white capitalize">${product.category}</span>
                </div>
                <div class="flex">
                  <span class="text-gray-600 dark:text-gray-300 w-32">Rating</span>
                  <span class="text-gray-800 dark:text-white">${product.rating.rate}/5</span>
                </div>
                <div class="flex">
                  <span class="text-gray-600 dark:text-gray-300 w-32">Ulasan</span>
                  <span class="text-gray-800 dark:text-white">${product.rating.count} ulasan</span>
                </div>
                <div class="flex">
                  <span class="text-gray-600 dark:text-gray-300 w-32">Terjual</span>
                  <span class="text-gray-800 dark:text-white">${Math.floor(Math.random() * 1000)}+</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
  
  modal.classList.remove('hidden');

  // Tambahkan event listener untuk tombol close
  const closeBtn = document.getElementById('closeProductDetail');
  if (closeBtn) {
    closeBtn.onclick = function() {
      modal.classList.add('hidden');
    };
  }

  // Tambahkan event listener untuk klik di luar modal
  modal.onclick = function(e) {
    if (e.target === modal) {
      modal.classList.add('hidden');
    }
  };
}

//---------------------------------- Fungsi untuk menampilkan notifikasi ----------------------------------\\
function showNotification(message, type = 'success') {
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 15px 25px;
    border-radius: 8px;
    color: white;
    font-weight: 500;
    z-index: 9999;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    transform: translateX(120%);
    transition: transform 0.3s ease-in-out;
    background-color: ${type === 'success' ? '#2563eb' : '#ef4444'};
  `;
  notification.textContent = message;

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.transform = 'translateX(0)';
  }, 100);

  setTimeout(() => {
    notification.style.transform = 'translateX(120%)';
    setTimeout(() => {
      if (notification.parentNode) {
        notification.remove();
      }
    }, 300);
  }, 3000);
}

//---------------------------------- Fungsi untuk menambah produk ke keranjang ----------------------------------\\
function tambahKeKeranjang(productId) {
  const product = allProducts.find(p => p.id === productId);
  if (!product) {
    showNotification('Produk tidak ditemukan', 'error');
    return;
  }

  const existingItem = cart.find(item => item.id === productId);
  
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({
      id: product.id,
      title: product.title,
      price: product.price,
      image: product.image,
      quantity: 1
    });
  }
  
  saveCartToStorage();
  updateCartUI();
  showNotification('Produk berhasil ditambahkan ke keranjang! 🛒');
  
  // Tutup modal detail produk
  const modal = document.getElementById('productDetailModal');
  if (modal) {
    modal.classList.add('hidden');
  }
}

//---------------------------------- Fungsi untuk memperbarui tampilan keranjang ----------------------------------\\
function updateCartUI() {
  const cartCount = document.getElementById('cart-count');
  const cartItems = document.getElementById('cartItems');
  const cartTotal = document.getElementById('cartTotal');
  const selectAllCheckbox = document.getElementById('selectAll');

  if (!cartCount || !cartItems || !cartTotal) return;

  // Update cart count
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  cartCount.textContent = totalItems;

  // Update select all checkbox
  if (selectAllCheckbox) {
    selectAllCheckbox.checked = cart.length > 0 && selectedItems.size === cart.length;
  }

  // Update cart items
  if (cart.length === 0) {
    cartItems.innerHTML = `
      <div class="text-center text-gray-500 py-8">
        <svg class="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
        </svg>
        <p>Keranjang masih kosong</p>
        <p class="text-sm">Yuk mulai belanja!</p>
      </div>
    `;
  } else {
    cartItems.innerHTML = cart.map(item => `
      <div class="flex items-center space-x-4 bg-gray-50 dark:bg-gray-700 p-4 rounded-lg mb-4 relative">
        <input type="checkbox" 
          class="item-checkbox w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
          data-id="${item.id}"
          ${selectedItems.has(item.id) ? 'checked' : ''}
        />
        <img src="${item.image}" alt="${item.title}" class="w-16 h-16 object-contain rounded" />
        <div class="flex-1">
          <h4 class="font-semibold text-sm line-clamp-2 text-gray-800 dark:text-gray-100">${item.title}</h4>
          <div class="flex items-center gap-4">
            <p class="text-blue-600 font-bold">Rp ${(item.price * 15000).toLocaleString('id-ID')}</p>
            <span class="text-sm font-semibold text-blue-400">
              Total: Rp ${(item.price * 15000 * item.quantity).toLocaleString('id-ID')}
            </span>
          </div>
          <div class="flex items-center space-x-2 mt-2">
            <button onclick="updateQuantity(${item.id}, ${item.quantity - 1})" class="bg-gray-200 hover:bg-gray-300 w-8 h-8 rounded-full flex items-center justify-center text-gray-600 dark:bg-gray-600 dark:hover:bg-gray-500 dark:text-gray-200">-</button>
            <span class="font-semibold text-gray-800 dark:text-gray-100">${item.quantity}</span>
            <button onclick="updateQuantity(${item.id}, ${item.quantity + 1})" class="bg-gray-200 hover:bg-gray-300 w-8 h-8 rounded-full flex items-center justify-center text-gray-600 dark:bg-gray-600 dark:hover:bg-gray-500 dark:text-gray-200">+</button>
            <button onclick="removeFromCart(${item.id})" class="bg-red-500 hover:bg-red-600 text-white w-8 h-8 rounded-full flex items-center justify-center ml-auto">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    `).join('');

    // Add event listeners to checkboxes
    document.querySelectorAll('.item-checkbox').forEach(checkbox => {
      checkbox.addEventListener('change', function() {
        const itemId = parseInt(this.dataset.id);
        if (this.checked) {
          selectedItems.add(itemId);
        } else {
          selectedItems.delete(itemId);
        }
        updateCartTotal();
      });
    });
  }

  // Update total
  updateCartTotal();
}

//---------------------------------- Fungsi untuk memperbarui total keranjang ----------------------------------\\
function updateCartTotal() {
  const cartTotal = document.getElementById('cartTotal');
  if (!cartTotal) return;

  const total = cart.reduce((sum, item) => {
    if (selectedItems.has(item.id)) {
      return sum + (item.price * 15000 * item.quantity);
    }
    return sum;
  }, 0);

  cartTotal.textContent = `Rp ${total.toLocaleString('id-ID')}`;
}

//---------------------------------- Fungsi untuk mengubah kuantitas produk ----------------------------------\\
function updateQuantity(productId, newQuantity) {
  if (newQuantity <= 0) {
    removeFromCart(productId);
    return;
  }

  const item = cart.find(item => item.id === productId);
  if (item) {
    item.quantity = newQuantity;
    saveCartToStorage();
    updateCartUI();
  }
}

//---------------------------------- Fungsi untuk menghapus dari keranjang ----------------------------------\\
function removeFromCart(productId) {
  cart = cart.filter(item => item.id !== productId);
  saveCartToStorage();
  updateCartUI();
  showNotification('Produk berhasil dihapus dari keranjang!');
}

//---------------------------------- Fungsi untuk pencarian produk ----------------------------------\\
function performSearch(keyword) {
  let filteredProducts = allProducts;
  
  if (keyword) {
    filteredProducts = allProducts.filter(product =>
      product.title.toLowerCase().includes(keyword.toLowerCase()) ||
      product.description.toLowerCase().includes(keyword.toLowerCase()) ||
      product.category.toLowerCase().includes(keyword.toLowerCase())
    );
  }

  if (currentCategory !== 'all') {
    filteredProducts = filteredProducts.filter(product => 
      product.category === currentCategory
    );
  }

  tampilkanProduk(filteredProducts);
}

//---------------------------------- Fungsi untuk filter kategori ----------------------------------\\
function filterByCategory(category) {
  currentCategory = category;
  const searchTerm = document.getElementById('search-input').value.trim();
  
  if (searchTerm) {
    performSearch(searchTerm);
  } else {
    let filteredProducts = allProducts;
    if (category !== 'all') {
      filteredProducts = allProducts.filter(product => product.category === category);
    }
    tampilkanProduk(filteredProducts);
  }

  // Update active button
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.classList.remove('active');
    if (btn.dataset.category === category) {
      btn.classList.add('active');
    }
  });
}

//---------------------------------- Fungsi untuk memperbarui slider ----------------------------------\\
function updateSlider() {
  const slider = document.getElementById('slider');
  const dots = document.querySelectorAll('.dot');
  
  if (!slider) return;
  
  slider.style.transition = 'transform 0.5s ease-in-out';
  slider.style.transform = `translateX(-${currentSlideIndex * 100}%)`;
  
  // Update dots
  dots.forEach((dot, index) => {
    if (index === currentSlideIndex) {
      dot.classList.add('bg-white');
      dot.classList.remove('bg-white/50');
    } else {
      dot.classList.add('bg-white/50');
      dot.classList.remove('bg-white');
    }
  });
}

//---------------------------------- Fungsi untuk slide berikutnya ----------------------------------\\
function nextSlide() {
  currentSlideIndex = (currentSlideIndex + 1) % totalSlides;
  updateSlider();
}

//---------------------------------- Fungsi untuk slide sebelumnya ----------------------------------\\
function prevSlide() {
  currentSlideIndex = (currentSlideIndex - 1 + totalSlides) % totalSlides;
  updateSlider();
}

//---------------------------------- Fungsi untuk menuju slide tertentu ----------------------------------\\
function goToSlide(index) {
  currentSlideIndex = index;
  updateSlider();
}

//---------------------------------- Fungsi untuk memulai auto slide ----------------------------------\\
function startAutoSlide() {
  stopAutoSlide(); // Hentikan interval yang ada
  slideInterval = setInterval(nextSlide, 3000);
}

//---------------------------------- Fungsi untuk menghentikan auto slide ----------------------------------\\
function stopAutoSlide() {
  if (slideInterval) {
    clearInterval(slideInterval);
  }
}

//---------------------------------- Fungsi untuk memperbarui tampilan profile di navbar ----------------------------------\\
function updateProfileButton() {
  const profile = getProfileFromStorage();
  const profileBtn = document.getElementById('profile-btn');
  if (profileBtn) {
    const avatarDiv = profileBtn.querySelector('div');
    if (profile.photo) {
      avatarDiv.innerHTML = `<img src="${profile.photo}" alt="Profile" class="w-full h-full object-cover rounded-full">`;
    } else {
      avatarDiv.innerHTML = `<div class="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">${profile.initial || profile.name.charAt(0).toUpperCase()}</div>`;
    }
  }
}

//---------------------------------- Fungsi untuk membeli produk langsung ----------------------------------\\
function beliSekarang(productId) {
  const product = allProducts.find((p) => p.id === productId);
  if (product) {
    // Simpan produk ke localStorage untuk checkout dengan data lengkap dari API
    const checkoutItem = {
      id: product.id,
      title: product.title,
      price: product.price,
      image: product.image,
      quantity: 1,
      rating: product.rating,
      category: product.category,
      description: product.description,
      totalPrice: product.price * 15000 // Tambahkan total harga dalam Rupiah
    };
    
    // Simpan ke localStorage untuk checkout
    localStorage.setItem("checkout", JSON.stringify([checkoutItem]));
    
    // Redirect ke halaman checkout
    window.location.href = "checkout.html";
  } else {
    showNotification('Produk tidak ditemukan', 'error');
  }
}

//---------------------------------- Fungsi untuk checkout ----------------------------------\\
function checkout() {
  if (selectedItems.size === 0) {
    showNotification('Pilih minimal satu produk untuk checkout!', 'error');
    return;
  }

  const selectedProducts = cart.filter(item => selectedItems.has(item.id));
  localStorage.setItem('checkout', JSON.stringify(selectedProducts));

  // --- Tambahan: Simpan ke riwayat pesanan ---
  const orderHistory = JSON.parse(localStorage.getItem('orderHistory') || '[]');
  const newOrder = {
    date: new Date().toISOString(),
    items: selectedProducts
  };
  orderHistory.push(newOrder);
  localStorage.setItem('orderHistory', JSON.stringify(orderHistory));
  // --- End tambahan ---

  // Hapus produk yang sudah di-checkout dari keranjang
  cart = cart.filter(item => !selectedItems.has(item.id));
  saveCartToStorage();
  selectedItems.clear();
  updateCartUI();

  window.location.href = 'checkout.html';
}

//---------------------------------- Fungsi untuk auto-refresh halaman ----------------------------------\\
function startAutoRefresh(seconds = 3000) {
  // Hentikan interval yang ada jika ada
  stopAutoRefresh();
  
  // Mulai interval baru
  refreshInterval = setInterval(() => {
    // Refresh data
    initializeData();
    showNotification('Halaman diperbarui! 🔄', 'success');
  }, seconds * 300);
}

//---------------------------------- Fungsi untuk menghentikan auto-refresh ----------------------------------\\
function stopAutoRefresh() {
  if (refreshInterval) {
    clearInterval(refreshInterval);
  }
}

// Initialize data
async function initializeData() {
  try {
    await ambilData();
    cart = getCartFromStorage();
    currentSlideIndex = getSliderFromStorage();
    updateCartUI();
    updateProfileButton();
  } catch (error) {
    console.error('Error initializing data:', error);
    showNotification('Gagal memuat data', 'error');
  }
}

//---------------------------------- Fungsi untuk menampilkan chart ----------------------------------\\
function renderCharts() {
  // Get theme
  const isDark = document.documentElement.classList.contains('dark');
  
  // Chart colors based on theme
  const chartColors = {
    text: isDark ? '#ffffff' : '#1f2937',
    grid: isDark ? '#374151' : '#e5e7eb',
    background: isDark ? '#1f2937' : '#ffffff',
    primary: '#3b82f6',
    secondary: '#60a5fa',
    accent: '#93c5fd'
  };

  // Sales Chart
  const salesCtx = document.getElementById('salesChart');
  if (salesCtx) {
    new Chart(salesCtx, {
      type: 'line',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun'],
        datasets: [{
          label: 'Penjualan',
          data: [65, 59, 80, 81, 56, 55],
          borderColor: chartColors.primary,
          backgroundColor: chartColors.primary + '20',
          tension: 0.4,
          fill: true
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            labels: {
              color: chartColors.text
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: chartColors.grid
            },
            ticks: {
              color: chartColors.text
            }
          },
          x: {
            grid: {
              color: chartColors.grid
            },
            ticks: {
              color: chartColors.text
            }
          }
        }
      }
    });
  }

  // Revenue Chart
  const revenueCtx = document.getElementById('revenueChart');
  if (revenueCtx) {
    new Chart(revenueCtx, {
      type: 'bar',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun'],
        datasets: [{
          label: 'Pendapatan',
          data: [1200000, 1900000, 1500000, 2500000, 2200000, 3000000],
          backgroundColor: [
            chartColors.primary,
            chartColors.secondary,
            chartColors.accent,
            chartColors.primary,
            chartColors.secondary,
            chartColors.accent
          ]
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            labels: {
              color: chartColors.text
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: chartColors.grid
            },
            ticks: {
              color: chartColors.text,
              callback: function(value) {
                return 'Rp ' + value.toLocaleString('id-ID');
              }
            }
          },
          x: {
            grid: {
              color: chartColors.grid
            },
            ticks: {
              color: chartColors.text
            }
          }
        }
      }
    });
  }

  // Category Chart
  const categoryCtx = document.getElementById('categoryChart');
  if (categoryCtx) {
    new Chart(categoryCtx, {
      type: 'doughnut',
      data: {
        labels: ['Elektronik', 'Pakaian', 'Makanan', 'Lainnya'],
        datasets: [{
          data: [40, 30, 20, 10],
          backgroundColor: [
            chartColors.primary,
            chartColors.secondary,
            chartColors.accent,
            '#9ca3af'
          ]
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              color: chartColors.text
            }
          }
        }
      }
    });
  }
}

// Fungsi untuk menampilkan riwayat pesanan (panggil di halaman profile)
function tampilkanRiwayatPesanan() {
  const history = JSON.parse(localStorage.getItem('orderHistory') || '[]');
  const container = document.getElementById('riwayat-container');
  if (!container) return;

  if (history.length === 0) {
    container.innerHTML = '<p class="text-gray-500">Belum ada riwayat pesanan.</p>';
    return;
  }

  container.innerHTML = history.map(order => `
    <div class="mb-6 p-4 bg-white rounded-xl shadow">
      <div class="mb-2 text-sm text-gray-400">Tanggal: ${new Date(order.date).toLocaleString('id-ID')}</div>
      ${order.items.map(item => `
        <div class="flex items-center gap-4 mb-2">
          <img src="${item.image}" class="w-12 h-12 object-contain rounded" />
          <div>
            <div class="font-semibold">${item.title}</div>
            <div class="text-blue-600">Rp ${(item.price * 15000).toLocaleString('id-ID')} x ${item.quantity}</div>
          </div>
        </div>
      `).join('')}
    </div>
  `).join('');
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
  // Initialize data
  initializeData();

  // Start auto-refresh setiap 30 detik
  startAutoRefresh(30);

  // Search functionality
  const searchInput = document.getElementById('search-input');
  const searchBtn = document.getElementById('search-btn');
  
  if (searchInput && searchBtn) {
  searchInput.addEventListener('input', (e) => {
    const keyword = e.target.value.trim();
    if (keyword === '') {
      if (currentCategory === 'all') {
        tampilkanProduk(allProducts);
      } else {
        filterByCategory(currentCategory);
      }
    } else {
      performSearch(keyword);
    }
  });
  
  searchBtn.addEventListener('click', () => {
    const keyword = searchInput.value.trim();
    if (keyword) {
      performSearch(keyword);
    }
  });
  }

  // Category filters
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      filterByCategory(this.dataset.category);
    });
  });

  // Modal controls
  const cartBtn = document.getElementById('cart-btn');
  const cartModal = document.getElementById('cartModal');
  const closeCart = document.getElementById('closeCart');
  const checkoutBtn = document.getElementById('checkoutBtn');

  if (cartBtn && cartModal) {
    cartBtn.addEventListener('click', function() {
      cartModal.classList.remove('hidden');
  });
  }

  if (closeCart && cartModal) {
    closeCart.addEventListener('click', function() {
      cartModal.classList.add('hidden');
  });
  }

  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', function() {
    if (cart.length === 0) {
      showNotification('Keranjang kosong! Tambahkan produk terlebih dahulu.', 'error');
      return;
    }
      checkout();
    });
  }

  // Close modals when clicking outside
  document.addEventListener('click', function(e) {
    if (cartModal && e.target === cartModal) {
      cartModal.classList.add('hidden');
    }
  });

  // Add event listener for storage changes
  window.addEventListener('storage', function(e) {
    if (e.key === 'userProfile') {
      updateProfileButton();
    }
  });

  // Slider controls
  const prevButton = document.getElementById('prev');
  const nextButton = document.getElementById('next');
  const dots = document.querySelectorAll('.dot');

  if (prevButton) {
    prevButton.addEventListener('click', () => {
      prevSlide();
      stopAutoSlide();
      startAutoSlide();
    });
  }

  if (nextButton) {
    nextButton.addEventListener('click', () => {
      nextSlide();
      stopAutoSlide();
      startAutoSlide();
    });
  }

  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
      goToSlide(index);
      stopAutoSlide();
      startAutoSlide();
    });
  });

  // Start auto slide
  startAutoSlide();

  // Pause auto slide when hovering over slider
  const slider = document.getElementById('slider');
  if (slider) {
    slider.addEventListener('mouseenter', stopAutoSlide);
    slider.addEventListener('mouseleave', startAutoSlide);
  }

  // Tambahkan event listener untuk menghentikan auto-refresh saat user aktif
  document.addEventListener('mousemove', () => {
    stopAutoRefresh();
    startAutoRefresh(30);
  });

  document.addEventListener('keydown', () => {
    stopAutoRefresh();
    startAutoRefresh(30);
  });

  // Select all checkbox
  const selectAllCheckbox = document.getElementById('selectAll');
  if (selectAllCheckbox) {
    selectAllCheckbox.addEventListener('change', function() {
      const checkboxes = document.querySelectorAll('.item-checkbox');
      checkboxes.forEach(checkbox => {
        checkbox.checked = this.checked;
        const itemId = parseInt(checkbox.dataset.id);
        if (this.checked) {
          selectedItems.add(itemId);
        } else {
          selectedItems.delete(itemId);
        }
      });
      updateCartTotal();
    });
  }

  // Initialize theme on page load
  const savedTheme = localStorage.getItem('theme');
  const html = document.documentElement;
  
  if (savedTheme === 'dark') {
    html.classList.add('dark');
  }

  // Render charts with initial theme
  renderCharts();

  // Listen for theme changes
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.attributeName === 'class') {
        renderCharts();
      }
    });
  });

  observer.observe(html, {
    attributes: true
  });
});