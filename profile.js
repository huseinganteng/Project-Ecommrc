// script.js - Updated with profile sync and back button functionality
// Global variables
let wishlistProducts = [];
let orderHistory = [];
let userProfile = {
  name: 'Lukass',
  email: 'Lukas@gmail.com',
  phone: '+62 821-2597-5449',
  birthdate: "2009-01-30",
  gender: "Laki-laki",
  photo: null,
  initial: 'K',
  addresses: [
    {
      id: 1,
      type: 'Rumah',
      name: 'Lukass@gmail.com',
      phone: '+62 821-2597-5449',
      address: 'Jl. Sudirman No. 123, RT 05/RW 02\nKelurahan Menteng, Kecamatan Menteng\nJakarta Pusat, DKI Jakarta 10310',
      isPrimary: true
    },
    {
      id: 2,
      type: 'Kantor',
      name: 'Lukass@gmail.com',
      phone: '+62 821-2597-5449',
      address: 'Gedung BCA Tower Lantai 15\nJl. MH Thamrin No. 1\nJakarta Pusat, DKI Jakarta 10250',
      isPrimary: false
    }
  ],
  settings: {
    emailNotifications: true,
    pushNotifications: true,
    newsletter: false,
    twoFactorAuth: false
  },
  wishlist: [],
  orderHistory: []
};

let userAddresses = [];
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Load data dari localStorage jika tersedia
const storedProfile = localStorage.getItem("userProfile");
if (storedProfile) userProfile = JSON.parse(storedProfile);

const storedWishlist = localStorage.getItem("wishlistProducts");
if (storedWishlist) wishlistProducts = JSON.parse(storedWishlist);

const storedOrders = localStorage.getItem("orderHistory");
if (storedOrders) orderHistory = JSON.parse(storedOrders);

const storedAddresses = localStorage.getItem("userAddresses");
if (storedAddresses) userAddresses = JSON.parse(storedAddresses);

// Back button functionality

function goBack() {
  if (
    confirm("Yakin ingin kembali? Perubahan yang belum disimpan akan hilang.")
  ) {
    window.history.back();
  }
}

function showSection(sectionName) {
  try {
    // Hide all sections
  document.querySelectorAll(".content-section").forEach((section) => {
    section.classList.add("hidden");
  });
    
    // Reset menu items
  document.querySelectorAll(".menu-item").forEach((item) => {
    item.classList.remove("active", "bg-blue-50", "text-blue-600");
    item.classList.add("text-gray-600");
  });
    
    // Show selected section
    const selectedSection = document.getElementById(sectionName);
    if (selectedSection) {
      selectedSection.classList.remove("hidden");
    }
    
    // Highlight selected menu item
    const selectedMenuItem = document.querySelector(`[onclick="showSection('${sectionName}')"]`);
    if (selectedMenuItem) {
      selectedMenuItem.classList.remove("text-gray-600");
      selectedMenuItem.classList.add("active", "bg-blue-50", "text-blue-600");
    }

    // Load section specific data
    if (sectionName === "wishlist") {
    loadWishlist();
    } else if (sectionName === "orders") {
    loadOrders();
    } else if (sectionName === "edit") {
      syncEditForm();
  }
  } catch (error) {
    console.error("Error showing section:", error);
  }
}

// Sync profile data to edit form
function syncEditForm() {
  try {
    const editName = document.getElementById('edit-name');
    const editEmail = document.getElementById('edit-email');
    const editPhone = document.getElementById('edit-phone');
    const editBirthdate = document.getElementById('edit-birthdate');
    const editGender = document.getElementById('edit-gender');
    
    if (editName) editName.value = userProfile.name;
    if (editEmail) editEmail.value = userProfile.email;
    if (editPhone) editPhone.value = userProfile.phone;
    if (editBirthdate) editBirthdate.value = userProfile.birthdate;
    if (editGender) editGender.value = userProfile.gender;
  } catch (error) {
    console.error('Error syncing edit form:', error);
  }
}

// Load data dari localStorage jika tersedia
function loadUserData() {
  try {
    const savedProfile = localStorage.getItem("userProfile");
    if (savedProfile) {
      userProfile = JSON.parse(savedProfile);
      updateProfileDisplay();
    }
  } catch (error) {
    console.error("Error loading user data:", error);
  }
}

// Save profile changes
function saveProfile(event) {
  event.preventDefault();
  console.log('Saving profile...'); // Debug log
  
  try {
    // Get form values
    const newName = document.getElementById('edit-name').value;
    const newEmail = document.getElementById('edit-email').value;
    const newPhone = document.getElementById('edit-phone').value;
    const newBirthdate = document.getElementById('edit-birthdate').value;
    const newGender = document.getElementById('edit-gender').value;
    const newPhoto = document.getElementById('edit-photo').files[0];
    
    console.log('New values:', { newName, newEmail, newPhone, newBirthdate, newGender }); // Debug log

    // Validate required fields
    if (!newName || !newEmail || !newPhone) {
      alert('Mohon lengkapi semua field yang wajib diisi!');
      return;
    }

    // Email validation
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(newEmail)) {
      alert('Format email tidak valid!');
      return;
    }

    // Update profile data
    userProfile.name = newName;
    userProfile.email = newEmail;
    userProfile.phone = newPhone;
    userProfile.birthdate = newBirthdate;
    userProfile.gender = newGender;
    userProfile.initial = newName.charAt(0).toUpperCase();
    
    console.log('Updated profile:', userProfile); // Debug log

    // Handle photo upload
    if (newPhoto) {
      const reader = new FileReader();
      reader.onload = function(e) {
        userProfile.photo = e.target.result;
        console.log('Photo updated'); // Debug log
        saveUserData();
        updateProfileDisplay();
        alert('Profil berhasil diperbarui!');
        showSection('info');
      };
      reader.readAsDataURL(newPhoto);
    } else {
      saveUserData();
      updateProfileDisplay();
      alert('Profil berhasil diperbarui!');
      showSection('info');
    }
  } catch (error) {
    console.error('Error saving profile:', error);
    alert('Terjadi kesalahan saat menyimpan profil. Silakan coba lagi.');
  }
}

// Update profile display
function updateProfileDisplay() {
  try {
    console.log('Updating display with:', userProfile); // Debug log
    
    // Update navbar profile button
    const profileBtn = document.getElementById('profile-btn');
    if (profileBtn) {
      const avatarDiv = profileBtn.querySelector('div');
      if (userProfile.photo) {
        avatarDiv.innerHTML = `<img src="${userProfile.photo}" alt="Profile" class="w-full h-full object-cover rounded-full">`;
      } else {
        avatarDiv.innerHTML = `<div class="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">${userProfile.initial}</div>`;
      }
    }
    
    // Update sidebar profile
    const profileAvatar = document.getElementById('profile-avatar');
    if (profileAvatar) {
      if (userProfile.photo) {
        profileAvatar.innerHTML = `<img src="${userProfile.photo}" alt="Profile" class="w-full h-full object-cover rounded-full">`;
      } else {
        profileAvatar.innerHTML = `<div class="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">${userProfile.initial}</div>`;
      }
    }
    
    // Update main content profile photo
    const mainProfilePhoto = document.querySelector('#info .w-32.h-32');
    if (mainProfilePhoto) {
      if (userProfile.photo) {
        mainProfilePhoto.innerHTML = `<img src="${userProfile.photo}" alt="Profile" class="w-full h-full object-cover rounded-full">`;
      } else {
        mainProfilePhoto.innerHTML = `<div class="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-4xl font-bold">${userProfile.initial}</div>`;
      }
    }
    
    // Update other profile info
    const sidebarName = document.getElementById('sidebar-name');
    const sidebarEmail = document.getElementById('sidebar-email');
    const infoName = document.getElementById('info-name');
    const infoEmail = document.getElementById('info-email');
    const infoPhone = document.getElementById('info-phone');
    
    if (sidebarName) sidebarName.textContent = userProfile.name;
    if (sidebarEmail) sidebarEmail.textContent = userProfile.email;
    if (infoName) infoName.textContent = userProfile.name;
    if (infoEmail) infoEmail.textContent = userProfile.email;
    if (infoPhone) infoPhone.textContent = userProfile.phone;
    
    // Save to localStorage for home page sync
    localStorage.setItem('userProfile', JSON.stringify(userProfile));
    
    console.log('Display updated successfully'); // Debug log
  } catch (error) {
    console.error('Error updating profile display:', error);
  }
}

// Handle address management
function renderAddresses() {
  try {
    const addressesContainer = document.querySelector('#addresses .space-y-4');
    if (!addressesContainer) return;
    
    addressesContainer.innerHTML = '';
    
    userProfile.addresses.forEach(address => {
      const addressElement = document.createElement('div');
      addressElement.className = 'border border-gray-200 rounded-lg p-6 relative';
      addressElement.innerHTML = `
        ${address.isPrimary ? `
          <div class="absolute top-4 right-4">
            <span class="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">Alamat Utama</span>
          </div>
        ` : ''}
        <h4 class="font-semibold text-gray-900 mb-2">${address.type}</h4>
        <p class="text-gray-900 font-medium mb-2">${address.name} | ${address.phone}</p>
        <p class="text-gray-600 leading-relaxed mb-4">${address.address.replace(/\n/g, '<br>')}</p>
        <div class="flex flex-wrap gap-2">
          <button onclick="editAddress(${address.id})" class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium">
            Edit
          </button>
          <button onclick="deleteAddress(${address.id})" class="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium">
            Hapus
          </button>
          ${!address.isPrimary ? `
            <button onclick="setPrimaryAddress(${address.id})" class="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium">
              Jadikan Utama
            </button>
          ` : ''}
        </div>
      `;
      addressesContainer.appendChild(addressElement);
    });
  } catch (error) {
    console.error("Error rendering addresses:", error);
  }
}

// Address management functions
function editAddress(id) {
  try {
    const address = userProfile.addresses.find(addr => addr.id === id);
    if (address) {
      // Implement address editing UI
      console.log('Edit address:', address);
    }
  } catch (error) {
    console.error("Error editing address:", error);
  }
}

function deleteAddress(id) {
  try {
    if (confirm('Apakah Anda yakin ingin menghapus alamat ini?')) {
      userProfile.addresses = userProfile.addresses.filter(addr => addr.id !== id);
      saveUserData();
      renderAddresses();
    }
  } catch (error) {
    console.error("Error deleting address:", error);
  }
}

function setPrimaryAddress(id) {
  try {
    userProfile.addresses.forEach(addr => {
      addr.isPrimary = addr.id === id;
    });
    saveUserData();
    renderAddresses();
  } catch (error) {
    console.error("Error setting primary address:", error);
  }
}

// Load wishlist products from API
async function loadWishlist() {
  const loadingEl = document.getElementById("wishlist-loading");
  const contentEl = document.getElementById("wishlist-content");
  const errorEl = document.getElementById("wishlist-error");

  // Show loading state
  loadingEl.classList.remove("hidden");
  contentEl.classList.add("hidden");
  errorEl.classList.add("hidden");

  try {
    const response = await fetch("https://fakestoreapi.com/products?limit=6");

    if (!response.ok) {
      throw new Error("Failed to fetch products");
    }

    const products = await response.json();
    wishlistProducts = products;

    // Clear existing content
    contentEl.innerHTML = "";

    // Create product cards
    products.forEach((product) => {
      const productCard = createProductCard(product);
      contentEl.appendChild(productCard);
    });

    // Show content, hide loading
    loadingEl.classList.add("hidden");
    contentEl.classList.remove("hidden");
  } catch (error) {
    console.error("Error loading wishlist:", error);

    // Show error state
    loadingEl.classList.add("hidden");
    errorEl.classList.remove("hidden");
  }
}

// Create product card element
function createProductCard(product) {
  const card = document.createElement("div");
  card.className =
    "border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer product-card";
  card.dataset.productId = product.id;

  // Convert price to IDR (rough conversion)
  const priceIDR = Math.round(product.price * 15000);

  card.innerHTML = `
        <div class="w-full h-32 bg-gray-100 rounded-lg flex items-center justify-center mb-4 overflow-hidden">
            <img src="${product.image}" alt="${
    product.title
  }" class="max-w-full max-h-full object-contain">
        </div>
        <h4 class="font-semibold text-gray-900 mb-2 line-clamp-2 text-sm" title="${
          product.title
        }">
            ${
              product.title.length > 50
                ? product.title.substring(0, 50) + "..."
                : product.title
            }
        </h4>
        <p class="text-green-600 font-semibold mb-3">Rp ${priceIDR.toLocaleString(
          "id-ID"
        )}</p>
        <div class="flex gap-2">
            <button onclick="buyProduct(${
              product.id
            })" class="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                Beli Sekarang
            </button>
            <button onclick="removeFromWishlist(${
              product.id
            })" class="px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors text-sm">
                ❤
            </button>
        </div>
    `;

  return card;
}

// Load orders from API (simulate order history using products)
async function loadOrders() {
  const loadingEl = document.getElementById("orders-loading");
  const contentEl = document.getElementById("orders-content");
  const errorEl = document.getElementById("orders-error");

  // Show loading state
  loadingEl.classList.remove("hidden");
  contentEl.classList.add("hidden");
  errorEl.classList.add("hidden");

  try {
    const response = await fetch("https://fakestoreapi.com/products?limit=8");

    if (!response.ok) {
      throw new Error("Failed to fetch orders");
    }

    const products = await response.json();

    // Create mock orders from products
    orderHistory = createMockOrders(products);

    // Clear existing content
    contentEl.innerHTML = "";

    // Create order cards
    orderHistory.forEach((order) => {
      const orderCard = createOrderCard(order);
      contentEl.appendChild(orderCard);
    });

    // Show content, hide loading
    loadingEl.classList.add("hidden");
    contentEl.classList.remove("hidden");
  } catch (error) {
    console.error("Error loading orders:", error);

    // Show error state
    loadingEl.classList.add("hidden");
    errorEl.classList.remove("hidden");
  }
}

// Create mock orders from products
function createMockOrders(products) {
  const statuses = ["Selesai", "Diproses", "Dikirim", "Dibatalkan"];
  const statusClasses = {
    Selesai: "bg-green-100 text-green-800",
    Diproses: "bg-yellow-100 text-yellow-800",
    Dikirim: "bg-blue-100 text-blue-800",
    Dibatalkan: "bg-red-100 text-red-800",
  };

  return products.slice(0, 5).map((product, index) => {
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const quantity = Math.floor(Math.random() * 3) + 1;
    const totalPrice = Math.round(product.price * 15000 * quantity);
    const orderDate = new Date(
      Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000
    );

    return {
      id: `ORD-${String(1000 + index).padStart(6, "0")}`,
      date: orderDate.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
      status: status,
      statusClass: statusClasses[status],
      total: totalPrice,
      items: [
        {
          name: product.title,
          quantity: quantity,
          image: product.image,
        },
      ],
      product: product,
    };
  });
}

// Create order card element
function createOrderCard(order) {
  const card = document.createElement("div");
  card.className =
    "border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer";
  card.dataset.orderId = order.id;

  card.innerHTML = `
        <div class="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-4">
            <div class="flex gap-4">
                <div class="w-16 h-16 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden">
                    <img src="${order.product.image}" alt="${
    order.product.title
  }" class="w-full h-full object-contain">
                </div>
                <div>
                    <div class="font-semibold text-gray-900">${order.id}</div>
                    <p class="text-gray-500 text-sm">${order.date}</p>
                </div>
            </div>
            <span class="inline-block px-3 py-1 ${
              order.statusClass
            } rounded-full text-sm font-medium">${order.status}</span>
        </div>
        <p class="font-medium text-gray-900 mb-2">Total: Rp ${order.total.toLocaleString(
          "id-ID"
        )}</p>
        <p class="text-gray-600 text-sm">${
          order.items[0].quantity
        } item • ${order.items[0].name.substring(0, 60)}${
    order.items[0].name.length > 60 ? "..." : ""
  }</p>
        <div class="mt-4 flex gap-2">
            <button onclick="viewOrderDetail('${
              order.id
            }')" class="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium">
                Lihat Detail
            </button>
            ${
              order.status === "Selesai"
                ? `
                <button onclick="reorderProduct(${order.product.id})" class="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm font-medium">
                    Pesan Lagi
                </button>
            `
                : ""
            }
        </div>
    `;

  return card;
}

// Product interactions
function buyProduct(productId) {
  const product = wishlistProducts.find((p) => p.id === productId);
  if (product) {
    alert(`Menambahkan "${product.title}" ke keranjang belanja`);
  }
}

function removeFromWishlist(productId) {
  if (confirm("Hapus produk dari wishlist?")) {
    wishlistProducts = wishlistProducts.filter((p) => p.id !== productId);
    const productCard = document.querySelector(
      `[data-product-id="${productId}"]`
    );
    if (productCard) {
      productCard.remove();
    }
    alert("Produk berhasil dihapus dari wishlist");
  }
}

function viewOrderDetail(orderId) {
  const order = orderHistory.find((o) => o.id === orderId);
  if (order) {
    alert(
      `Detail Pesanan ${orderId}:\n\nProduk: ${order.items[0].name}\nJumlah: ${
        order.items[0].quantity
      }\nTotal: Rp ${order.total.toLocaleString("id-ID")}\nStatus: ${
        order.status
      }\nTanggal: ${order.date}`
    );
  }
}

function reorderProduct(productId) {
  const product = orderHistory.find((o) => o.product.id === productId)?.product;
  if (product) {
    alert(`Menambahkan "${product.title}" ke keranjang untuk pemesanan ulang`);
  }
}

// Load profile data from localStorage when page loads
function loadProfileData() {
  const savedProfile = localStorage.getItem("userProfile");
  if (savedProfile) {
    userProfile = JSON.parse(savedProfile);
    updateProfileDisplay();
  }
}

// Save profile data to localStorage
function saveProfileData() {
  localStorage.setItem("userProfile", JSON.stringify(userProfile));
}

// Load all user data from localStorage
function loadUserData() {
  try {
  const savedProfile = localStorage.getItem("userProfile");
  if (savedProfile) {
    userProfile = JSON.parse(savedProfile);
    updateProfileDisplay();
    }
  } catch (error) {
    console.error("Error loading user data:", error);
  }
}

// Save all user data to localStorage
function saveUserData() {
  try {
    console.log('Saving to localStorage:', userProfile); // Debug log
    localStorage.setItem('userProfile', JSON.stringify(userProfile));
    updateProfileDisplay();
  } catch (error) {
    console.error('Error saving user data:', error);
  }
}

// Update wishlist display
function updateWishlistDisplay() {
  const wishlistContainer = document.getElementById("wishlist-container");
  if (!wishlistContainer) return;

  wishlistContainer.innerHTML = "";
  if (userProfile.wishlist.length === 0) {
    wishlistContainer.innerHTML = `
            <div class="text-center py-8">
                <i class="fas fa-heart text-4xl text-gray-300 mb-4"></i>
                <p class="text-gray-500">Wishlist Anda masih kosong</p>
            </div>
        `;
    return;
  }

  for (const product of userProfile.wishlist) {
    const productCard = createProductCard(product);
    wishlistContainer.appendChild(productCard);
  }
}

// Update order history display
function updateOrderHistoryDisplay() {
  const orderContainer = document.getElementById("order-history-container");
  if (!orderContainer) return;

  orderContainer.innerHTML = "";
  if (userProfile.orderHistory.length === 0) {
    orderContainer.innerHTML = `
            <div class="text-center py-8">
                <i class="fas fa-shopping-bag text-4xl text-gray-300 mb-4"></i>
                <p class="text-gray-500">Belum ada pesanan</p>
            </div>
        `;
    return;
  }

  for (const order of userProfile.orderHistory) {
    const orderCard = createOrderCard(order);
    orderContainer.appendChild(orderCard);
  }
}

// Update addresses display
function updateAddressesDisplay() {
  const addressContainer = document.getElementById("addresses-container");
  if (!addressContainer) return;

  addressContainer.innerHTML = "";
  if (userProfile.addresses.length === 0) {
    addressContainer.innerHTML = `
            <div class="text-center py-8">
                <i class="fas fa-map-marker-alt text-4xl text-gray-300 mb-4"></i>
                <p class="text-gray-500">Belum ada alamat tersimpan</p>
            </div>
        `;
    return;
  }

  for (const address of userProfile.addresses) {
    const addressCard = createAddressCard(address);
    addressContainer.appendChild(addressCard);
  }
}

// Create address card
function createAddressCard(address) {
  const card = document.createElement("div");
  card.className = "border rounded-lg p-4 relative";
  card.innerHTML = `
        <div class="flex justify-between items-start mb-4">
            <h4 class="font-semibold">${address.type}</h4>
            ${
              address.isPrimary
                ? '<span class="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">Alamat Utama</span>'
                : '<button class="text-blue-600 hover:text-blue-800" onclick="setPrimaryAddress(${address.id})">Jadikan Utama</button>'
            }
        </div>
        <p class="text-gray-600 mb-2">${address.name} | ${address.phone}</p>
        <p class="text-gray-600 mb-2">${address.address.replace(/\n/g, '<br>')}</p>
        <div class="flex gap-2 mt-4">
            <button class="text-blue-600 hover:text-blue-800" onclick="editAddress(${address.id})">Edit</button>
            <button class="text-red-600 hover:text-red-800" onclick="deleteAddress(${address.id})">Hapus</button>
        </div>
    `;
  return card;
}

// Add to wishlist
function addToWishlist(product) {
  if (!userProfile.wishlist.some((p) => p.id === product.id)) {
    userProfile.wishlist.push(product);
    saveUserData();
    updateWishlistDisplay();
  }
}

// Remove from wishlist
function removeFromWishlist(productId) {
  userProfile.wishlist = userProfile.wishlist.filter((p) => p.id !== productId);
  saveUserData();
  updateWishlistDisplay();
}

// Add new order
function addOrder(order) {
  userProfile.orderHistory.unshift(order);
  saveUserData();
  updateOrderHistoryDisplay();
}

// Add new address
function addAddress(address) {
  if (address.isPrimary) {
    userProfile.addresses.forEach((addr) => (addr.isPrimary = false));
  }
  userProfile.addresses.push(address);
  saveUserData();
  updateAddressesDisplay();
}

// Handle settings toggles
document.querySelectorAll('input[type="checkbox"]').forEach((checkbox, index) => {
  checkbox.addEventListener('change', function() {
    try {
      switch(index) {
        case 0:
          userProfile.settings.emailNotifications = this.checked;
          break;
        case 1:
          userProfile.settings.pushNotifications = this.checked;
          break;
        case 2:
          userProfile.settings.newsletter = this.checked;
          break;
        case 3:
          userProfile.settings.twoFactorAuth = this.checked;
          break;
        case 4:
          // Theme toggle
          const html = document.documentElement;
          if (this.checked) {
            html.classList.add('dark');
            localStorage.setItem('theme', 'dark');
          } else {
            html.classList.remove('dark');
            localStorage.setItem('theme', 'light');
          }
          break;
      }
    saveUserData();
    } catch (error) {
      console.error("Error handling settings toggle:", error);
    }
  });
});

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
  try {
    console.log('DOM loaded, initializing...'); // Debug log
    
    // Remove cart button from navbar if it exists
    const cartBtn = document.getElementById('cart-btn');
    if (cartBtn) {
      cartBtn.remove();
    }
    
    // Load all user data
    loadUserData();

    // Handle edit profile form submission
    const editForm = document.getElementById("edit-profile-form");
    if (editForm) {
      editForm.addEventListener("submit", saveProfile);
    }

    // Other form submissions
    document.querySelectorAll("form:not(#edit-profile-form)").forEach((form) => {
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        alert("Data berhasil disimpan!");
      });
    });

    // Toggle switches functionality
    document.querySelectorAll('input[type="checkbox"]').forEach((toggle) => {
      toggle.addEventListener("change", function () {
        const settingName = this.closest(".flex").querySelector("h4").textContent;
        const status = this.checked ? "diaktifkan" : "dinonaktifkan";
        console.log(`${settingName} ${status}`);
        // Save settings to localStorage
        const settings = JSON.parse(localStorage.getItem("userSettings") || "{}");
        settings[settingName] = this.checked;
        localStorage.setItem("userSettings", JSON.stringify(settings));
      });
    });

    // File upload preview
    document
      .querySelectorAll('input[type="file"]:not(#edit-photo)')
      .forEach((input) => {
        input.addEventListener("change", function (e) {
          const file = e.target.files[0];
          if (file) {
            console.log("File uploaded:", file.name);
            alert(`File ${file.name} berhasil dipilih`);
          }
        });
      });

    // Address actions
    document.querySelectorAll("button").forEach((btn) => {
      if (btn.textContent.includes("Edit") && !btn.onclick) {
        btn.addEventListener("click", function () {
          alert("Fitur edit alamat akan segera hadir!");
        });
      }
      if (btn.textContent.includes("Hapus") && !btn.onclick) {
        btn.addEventListener("click", function () {
          if (confirm("Yakin ingin menghapus alamat ini?")) {
            const addressCard = this.closest(".border");
            const addressIndex = Array.from(
              addressCard.parentNode.children
            ).indexOf(addressCard);
            userProfile.addresses.splice(addressIndex, 1);
            addressCard.remove();
            saveUserData(); // Save after removing address
          }
        });
      }
      if (btn.textContent.includes("Jadikan Utama") && !btn.onclick) {
        btn.addEventListener("click", function () {
          // Remove existing primary address badge
          for (const badge of document.querySelectorAll(".bg-green-100")) {
            if (badge.textContent.includes("Alamat Utama")) {
              badge.remove();
            }
          }

          // Add primary badge to current address
          const addressCard = this.closest(".border");
          const addressIndex = Array.from(
            addressCard.parentNode.children
          ).indexOf(addressCard);

          // Update addresses array
          userProfile.addresses.forEach((addr) => (addr.isPrimary = false));
          userProfile.addresses[addressIndex].isPrimary = true;

          const badge = document.createElement("span");
          badge.className =
            "absolute top-4 right-4 px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium";
          badge.textContent = "Alamat Utama";
          addressCard.appendChild(badge);

          // Hide the "Jadikan Utama" button
          this.style.display = "none";

          saveUserData(); // Save after updating primary address
          alert("Alamat berhasil dijadikan utama!");
        });
      }
    });

    // Add new address button
    const addAddressBtn = document.querySelector(
      'button:contains("+ Tambah Alamat Baru")'
    );
    if (addAddressBtn) {
      addAddressBtn.addEventListener("click", function () {
        alert("Form tambah alamat baru akan muncul di sini");
      });
    }

    // Show default section
    showSection('info');
  } catch (error) {
    console.error("Error initializing page:", error);
  }
});

// Initialize theme on page load
document.addEventListener('DOMContentLoaded', function() {
    const savedTheme = localStorage.getItem('theme');
    const html = document.documentElement;
    const themeToggle = document.getElementById('theme-toggle');

    if (savedTheme === 'dark') {
        html.classList.add('dark');
        themeToggle.checked = true;
    }

    // Theme toggle handler
    themeToggle.addEventListener('change', function() {
        if (this.checked) {
            html.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            html.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    });
});


