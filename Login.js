//---------------------------------- Fungsi untuk menyimpan data ke localStorage ----------------------------------\\
function saveToLocalStorage(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

//---------------------------------- Fungsi untuk mengambil data dari localStorage ----------------------------------\\
function getFromLocalStorage(key, defaultValue = null) {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : defaultValue;
}

//---------------------------------- Fungsi untuk menyimpan data user ke localStorage ----------------------------------\\
function saveUserToStorage(user) {
  saveToLocalStorage('currentUser', user);
}

//---------------------------------- Fungsi untuk mengambil data user dari localStorage ----------------------------------\\
function getUserFromStorage() {
  return getFromLocalStorage('currentUser', null);
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
function saveCartToStorage(cart) {
  saveToLocalStorage('cart', cart);
}

//---------------------------------- Fungsi untuk mengambil data keranjang dari localStorage ----------------------------------\\
function getCartFromStorage() {
  return getFromLocalStorage('cart', []);
}

//---------------------------------- Fungsi untuk menyimpan data modal ke localStorage ----------------------------------\\
function saveModalStateToStorage(modalId, isOpen) {
  const modalStates = getFromLocalStorage('modalStates', {});
  modalStates[modalId] = isOpen;
  saveToLocalStorage('modalStates', modalStates);
}

//---------------------------------- Fungsi untuk mengambil data modal dari localStorage ----------------------------------\\
function getModalStateFromStorage(modalId) {
  const modalStates = getFromLocalStorage('modalStates', {});
  return modalStates[modalId] || false;
}

//---------------------------------- Fungsi untuk menyimpan data form ke localStorage ----------------------------------\\
function saveFormDataToStorage(formId, formData) {
  const formStates = getFromLocalStorage('formStates', {});
  formStates[formId] = formData;
  saveToLocalStorage('formStates', formStates);
}

//---------------------------------- Fungsi untuk mengambil data form dari localStorage ----------------------------------\\
function getFormDataFromStorage(formId) {
  const formStates = getFromLocalStorage('formStates', {});
  return formStates[formId] || {};
}

//---------------------------------- Fungsi untuk menyimpan data produk yang dipilih ke localStorage ----------------------------------\\
function saveSelectedProductToStorage(product) {
  saveToLocalStorage('selectedProduct', product);
}

//---------------------------------- Fungsi untuk mengambil data produk yang dipilih dari localStorage ----------------------------------\\
function getSelectedProductFromStorage() {
  return getFromLocalStorage('selectedProduct', null);
}

//---------------------------------- Fungsi untuk menyimpan data detail produk ke localStorage ----------------------------------\\
function saveProductDetailToStorage(product) {
  saveToLocalStorage('productDetail', product);
}

//---------------------------------- Fungsi untuk mengambil data detail produk dari localStorage ----------------------------------\\
function getProductDetailFromStorage() {
  return getFromLocalStorage('productDetail', null);
}

//---------------------------------- Fungsi untuk membuat rating bintang ----------------------------------\\
function generateStars(rating) {
  const fullStars = Math.floor(rating);
  const halfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

  let stars = "";
  for (let i = 0; i < fullStars; i++) {
    stars += '<i class="fas fa-star text-yellow-400"></i>';
  }
  if (halfStar) {
    stars += '<i class="fas fa-star-half-alt text-yellow-400"></i>';
  }
  for (let i = 0; i < emptyStars; i++) {
    stars += '<i class="far fa-star text-yellow-400"></i>';
  }

  return stars;
}

//---------------------------------- Fungsi untuk menambah produk ke keranjang ----------------------------------\\
function tambahKeKeranjang(productId) {
  const user = getUserFromStorage();
  if (!user) {
    document.getElementById('loginBtn').click();
    return;
  }

  const cart = getCartFromStorage();
  const products = getProductsFromStorage();
  const product = products.find(p => p.id === productId);
  
  if (product) {
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
    saveCartToStorage(cart);
    showNotification('Produk berhasil ditambahkan ke keranjang');
  }
}
//---------------------------------- Fungsi untuk menampilkan notifikasi ----------------------------------\\
function showNotification(message) {
  const notifications = getFromLocalStorage('notifications', []);
  notifications.push({
    message,
    timestamp: new Date().toISOString()
  });
  saveToLocalStorage('notifications', notifications);
}

//---------------------------------- Fungsi untuk login ----------------------------------\\
function handleLogin(email, password) {
  if (email && password) {
    const user = {
      email,
      loginTime: new Date().toISOString(),
      isLoggedIn: true
    };
    saveUserToStorage(user);
    window.location.href = 'Home.html';
  } else {
    showNotification('Email dan password harus diisi!');
  }
}

//---------------------------------- Fungsi untuk register ----------------------------------\\
function handleRegister(email, password, confirmPassword) {
  if (!email || !password || !confirmPassword) {
    showNotification('Mohon lengkapi semua field!');
    return false;
  }

  if (password !== confirmPassword) {
    showNotification('Password tidak cocok');
    return false;
  }

  const newUser = {
    email,
    registerTime: new Date().toISOString(),
    isLoggedIn: true
  };
  saveUserToStorage(newUser);
  return true;
}

//---------------------------------- Fungsi untuk login dengan Google ----------------------------------\\
function handleGoogleLogin() {
  const googleUser = {
    email: 'google@example.com',
    loginTime: new Date().toISOString(),
    isLoggedIn: true,
    provider: 'google'
  };
  saveUserToStorage(googleUser);
  window.location.href = 'Home.html';
}

//---------------------------------- Fungsi untuk mengambil data dari API ----------------------------------\\
async function ambilData() {
  try {
    const cachedProducts = getProductsFromStorage();
    if (cachedProducts.length > 0) {
      return cachedProducts;
    }

    const response = await fetch("https://fakestoreapi.com/products");
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    saveProductsToStorage(data);
    return data;
  } catch (error) {
    console.error('Gagal mengambil data:', error);
    showNotification('Gagal memuat data produk');
    return [];
  }
}

//---------------------------------- Fungsi untuk menampilkan detail produk ----------------------------------\\
function showProductDetail(productId) {
  const products = getProductsFromStorage();
  const product = products.find(p => p.id === productId);
  
  if (product) {
    const modal = document.getElementById('productDetailModal');
    const content = document.getElementById('productDetailContent');
    
    content.innerHTML = `
      <div class="space-y-6">
        <div class="grid md:grid-cols-2 gap-8">
          <div class="space-y-4">
            <div class="relative">
              <img src="${product.image}" alt="${product.title}" class="w-full h-96 object-contain rounded-lg shadow-md" />
            </div>
          </div>

          <div class="space-y-6">
            <div>
              <h1 class="text-2xl font-bold text-gray-800 dark:text-white mb-2">${product.title}</h1>
              <div class="flex items-center space-x-4">
                <div class="flex items-center text-lg">
                  ${generateStars(product.rating.rate)}
                </div>
                <div class="flex items-center space-x-2">
                  <span class="text-gray-600 dark:text-gray-300">${product.rating.rate}</span>
                  <span class="text-gray-400 dark:text-gray-500">|</span>
                  <span class="text-gray-600 dark:text-gray-300">${product.rating.count} ulasan</span>
                </div>
              </div>
            </div>

            <div class="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl">
              <div class="flex items-baseline space-x-4">
                <span class="text-3xl font-bold text-blue-600 dark:text-blue-400">Rp ${(product.price * 15000).toLocaleString('id-ID')}</span>
                <span class="text-lg text-gray-500 dark:text-gray-400 line-through">Rp ${(product.price * 15000 * 1.2).toLocaleString('id-ID')}</span>
                <span class="bg-blue-500 text-white px-2 py-1 rounded text-sm">-20%</span>
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

        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm">
          <div class="border-b dark:border-gray-700">
            <div class="flex space-x-8 px-6">
              <button class="py-4 border-b-2 border-blue-500 text-blue-500 dark:text-blue-400 font-medium">Deskripsi</button>
            </div>
          </div>
          <div class="p-6 overflow-y-auto max-h-[300px]">
            <div class="dark:prose-invert">
              <h3 class="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Deskripsi Produk</h3>
              <p class="text-gray-600 dark:text-gray-300 leading-relaxed">${product.description}</p>
            </div>
          </div>
        </div>
      </div>
    `;
    
    modal.classList.remove('hidden');
  }

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

//---------------------------------- Fungsi untuk menampilkan produk ----------------------------------\\
function tampilkanProduk(products) {
  const produkContainer = document.getElementById('data-product');
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
          <div class="flex items-center text-yellow-400">
            ${generateStars(product.rating.rate)}
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
            Beli Sekarang
          </button>
        </div>
      </div>
    `;

    productCard.addEventListener('click', () => showProductDetail(product.id));
    produkContainer.appendChild(productCard);
  });
}

// DOM Elements
const loginBtn = document.getElementById("loginBtn");
const registerBtn = document.getElementById("registerBtn");
const loginModal = document.getElementById("loginModal");
const registerModal = document.getElementById("registerModal");
const openRegister = document.getElementById("openRegister");
const openLogin = document.getElementById("openLogin");
const googleLogin = document.getElementById("googleLogin");
const googleRegister = document.getElementById("googleRegister");
const sliderButtons = document.querySelectorAll('.slider-btn');

// Function to toggle slider buttons
const toggleSliderButtons = (show) => {
  sliderButtons.forEach(btn => {
    if (show) {
      btn.classList.remove('hidden');
    } else {
      btn.classList.add('hidden');
    }
  });
};

// Show/Hide Modals
loginBtn.addEventListener("click", () => {
  loginModal.classList.remove("hidden");
  toggleSliderButtons(false);
});

registerBtn.addEventListener("click", () => {
  registerModal.classList.remove("hidden");
  toggleSliderButtons(false);
});

// Close modals when clicking outside
window.addEventListener("click", (e) => {
  if (e.target === loginModal) {
    loginModal.classList.add("hidden");
    toggleSliderButtons(true);
  }
  if (e.target === registerModal) {
    registerModal.classList.add("hidden");
    toggleSliderButtons(true);
  }
});

// Switch between login and register
openRegister.addEventListener("click", (e) => {
  e.preventDefault();
  loginModal.classList.add("hidden");
  registerModal.classList.remove("hidden");
  toggleSliderButtons(false);
});

openLogin.addEventListener("click", (e) => {
  e.preventDefault();
  registerModal.classList.add("hidden");
  loginModal.classList.remove("hidden");
  toggleSliderButtons(false);
});

// Password Toggle Functionality
document.querySelectorAll('.toggle-password').forEach(button => {
  button.addEventListener('click', function() {
    const input = this.parentElement.querySelector('input');
    const eyeOpen = this.querySelector('.eye-open');
    const eyeClosed = this.querySelector('.eye-closed');

    if (input.type === 'password') {
      input.type = 'text';
      eyeOpen.classList.add('hidden');
      eyeClosed.classList.remove('hidden');
    } else {
      input.type = 'password';
      eyeOpen.classList.remove('hidden');
      eyeClosed.classList.add('hidden');
    }
  });
});

// Login Form Handler
document.getElementById('loginForm').addEventListener('submit', function(e) {
  e.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  if (email && password) {
    const user = {
      email: email,
      loginTime: new Date().toISOString(),
      isLoggedIn: true
    };
    saveUserToStorage(user);
    window.location.href = 'Home.html';
  } else {
    alert('Email dan password harus diisi!');
  }
});

// Register Form Handler
document.getElementById('registerForm').addEventListener('submit', function(e) {
  e.preventDefault();
  
  const email = document.getElementById('registerEmail').value;
  const password = document.getElementById('registerPassword').value;
  const confirmPassword = document.getElementById('confirmPassword').value;
  const errorMsg = document.getElementById('errorMsg');

  if (!email || !password || !confirmPassword) {
    alert('Mohon lengkapi semua field!');
    return;
  }

  if (password !== confirmPassword) {
    errorMsg.classList.remove('hidden');
    return;
  }

  const newUser = {
    email: email,
    registerTime: new Date().toISOString(),
    isLoggedIn: true
  };
  saveUserToStorage(newUser);

  errorMsg.classList.add('hidden');
  window.location.href = 'Home.html';
});

// Google Auth Handlers
googleLogin.addEventListener('click', () => {
  const googleUser = {
    email: 'google@example.com',
    loginTime: new Date().toISOString(),
    isLoggedIn: true,
    provider: 'google'
  };
  saveUserToStorage(googleUser);
  window.location.href = 'Home.html';
});

googleRegister.addEventListener('click', () => {
  const newGoogleUser = {
    email: 'google@example.com',
    registerTime: new Date().toISOString(),
    isLoggedIn: true,
    provider: 'google'
  };
  saveUserToStorage(newGoogleUser);
  window.location.href = 'Home.html';
});

//---------------------------------- Fungsi untuk menyimpan posisi slider ke localStorage ----------------------------------\\
function saveSliderToStorage(index) {
  localStorage.setItem('sliderIndex', index);
}

//---------------------------------- Fungsi untuk mengambil posisi slider dari localStorage ----------------------------------\\
function getSliderFromStorage() {
  return parseInt(localStorage.getItem('sliderIndex')) || 0;
}

//---------------------------------- Fungsi untuk memperbarui tampilan slider ----------------------------------\\
function updateSliderDisplay() {
  const dots = document.querySelectorAll('.dot');
  dots.forEach((dot, index) => {
    if (index === currentIndex) {
      dot.classList.add('bg-white');
      dot.classList.remove('bg-white/50');
    } else {
      dot.classList.remove('bg-white');
      dot.classList.add('bg-white/50');
    }
  });
}

// Update the slider functionality section
let currentIndex = getSliderFromStorage();
const slider = document.getElementById("slider");
const images = document.querySelectorAll("#slider img");
const totalImages = images.length;

const prevBtn = document.getElementById('prev');
const nextBtn = document.getElementById('next');

// Update slider position
const updateSlider = () => {
  const offset = -currentIndex * 100;
  slider.style.transform = `translateX(${offset}%)`;
  saveSliderToStorage(currentIndex);
  updateSliderDisplay();
};

// Next slide
const goToNextSlide = () => {
  currentIndex = (currentIndex === totalImages - 1) ? 0 : currentIndex + 1;
  updateSlider();
};

// Previous slide
const goToPrevSlide = () => {
  currentIndex = (currentIndex === 0) ? totalImages - 1 : currentIndex - 1;
  updateSlider();
};

// Event listeners for buttons
nextBtn.addEventListener('click', () => {
  goToNextSlide();
  resetAutoScroll();
});

prevBtn.addEventListener('click', () => {
  goToPrevSlide();
  resetAutoScroll();
});

// Add click handlers for dots
document.querySelectorAll('.dot').forEach((dot, index) => {
  dot.addEventListener('click', () => {
    currentIndex = index;
    updateSlider();
    resetAutoScroll();
  });
});

// Auto scroll
let autoScrollInterval = setInterval(goToNextSlide, 5000);

// Reset auto scroll when manually changing slides
const resetAutoScroll = () => {
  clearInterval(autoScrollInterval);
  autoScrollInterval = setInterval(goToNextSlide, 5000);
};

// Pause auto scroll when hovering
slider.addEventListener('mouseenter', () => {
  clearInterval(autoScrollInterval);
});

slider.addEventListener('mouseleave', () => {
  autoScrollInterval = setInterval(goToNextSlide, 5000);
});

// Initialize slider position on page load
document.addEventListener('DOMContentLoaded', () => {
  currentIndex = getSliderFromStorage();
  updateSlider();
  updateSliderDisplay();
});

//---------------------------------- Fungsi untuk memperbarui tampilan keranjang ----------------------------------\\
function updateCartDisplay() {
  const cart = getCartFromStorage();
  const cartCount = document.getElementById('cart-count');
  const cartItems = document.getElementById('cartItems');
  const cartTotal = document.getElementById('cartTotal');
  
  if (cartCount) {
    cartCount.textContent = cart.reduce((total, item) => total + item.quantity, 0);
  }
  
  if (cartItems) {
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
        <div class="flex items-center gap-4 p-4 bg-white rounded-lg shadow-sm mb-4">
          <img src="${item.image}" alt="${item.title}" class="w-20 h-20 object-contain" />
          <div class="flex-1">
            <h3 class="font-medium text-gray-800 line-clamp-2">${item.title}</h3>
            <p class="text-blue-600 font-semibold">Rp ${(item.price * 15000).toLocaleString('id-ID')}</p>
            <div class="flex items-center gap-2 mt-2">
              <button onclick="updateQuantity(${item.id}, ${item.quantity - 1})" class="text-gray-500 hover:text-gray-700">-</button>
              <span class="text-gray-600">${item.quantity}</span>
              <button onclick="updateQuantity(${item.id}, ${item.quantity + 1})" class="text-gray-500 hover:text-gray-700">+</button>
            </div>
          </div>
          <button onclick="removeFromCart(${item.id})" class="text-red-500 hover:text-red-700">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      `).join('');
    }
  }
  
  if (cartTotal) {
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity * 15000), 0);
    cartTotal.textContent = `Rp ${total.toLocaleString('id-ID')}`;
  }
}

//---------------------------------- Fungsi untuk memperbarui jumlah item di keranjang ----------------------------------\\
function updateQuantity(productId, newQuantity) {
  if (newQuantity < 1) {
    removeFromCart(productId);
    return;
  }
  
  const cart = getCartFromStorage();
  const itemIndex = cart.findIndex(item => item.id === productId);
  
  if (itemIndex !== -1) {
    cart[itemIndex].quantity = newQuantity;
    saveCartToStorage(cart);
    updateCartDisplay();
  }
}

//---------------------------------- Fungsi untuk menghapus item dari keranjang ----------------------------------\\
function removeFromCart(productId) {
  const cart = getCartFromStorage();
  const updatedCart = cart.filter(item => item.id !== productId);
  saveCartToStorage(updatedCart);
  updateCartDisplay();
  showNotification('Produk berhasil dihapus dari keranjang');
}
