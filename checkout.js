//----VARIABEL GLOBAL----\\
// Global variables
let cartData = [];
let subtotalAmount = 0;
let shippingCost = 15000; // Default shipping cost
let discountAmount = 0;
let voucherApplied = false;

//----FUNGSI UTILITAS----\\
// Format currency to IDR
function formatCurrency(amount) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

//----FUNGSI LOADING DATA----\\
// Load cart data from localStorage
function loadCartData() {
  try {
    // Check for checkout data first
    const checkoutData = localStorage.getItem('checkout');
    if (checkoutData) {
      cartData = JSON.parse(checkoutData);
      renderCartItems();
      calculateTotal();
    } else {
      showNotification('Tidak ada produk untuk checkout', 'error');
      setTimeout(() => {
        window.location.href = "Home.html";
      }, 2000);
    }
  } catch (error) {
    console.error('Error loading cart data:', error);
    showNotification('Gagal memuat data keranjang', 'error');
    setTimeout(() => {
      window.location.href = "Home.html";
    }, 2000);
  }
}

//----FUNGSI RENDER UI----\\
// Render cart items
function renderCartItems() {
  const cartItems = document.getElementById('cart-items');
  if (!cartItems) return;

  cartItems.innerHTML = cartData.map(item => `
    <div class="flex items-center space-x-4 bg-gray-50 dark:bg-gray-700 p-4 rounded-lg mb-4">
      <img src="${item.image}" alt="${item.title}" class="w-16 h-16 object-contain rounded" />
      <div class="flex-1">
        <h4 class="font-semibold text-sm line-clamp-2 text-gray-800 dark:text-gray-100">${item.title}</h4>
        <p class="text-blue-600 font-bold dark:text-blue-400">${formatCurrency(item.price * 15000)}</p>
        <div class="flex items-center justify-between mt-2">
          <div class="flex items-center space-x-2">
            <span class="text-sm text-gray-600 dark:text-gray-300">Qty: ${item.quantity}</span>
          </div>
          <p class="text-sm font-semibold text-gray-800 dark:text-gray-100">
            Total: ${formatCurrency(item.price * 15000 * item.quantity)}
          </p>
        </div>
      </div>
    </div>
  `).join('');
}

//----FUNGSI KALKULASI----\\
// Calculate total amount
function calculateTotal() {
  if (!cartData || cartData.length === 0) {
    showNotification('Tidak ada produk untuk checkout', 'error');
    setTimeout(() => {
      window.location.href = "Home.html";
    }, 2000);
    return;
  }

  subtotalAmount = cartData.reduce((sum, item) => sum + (item.price * 15000 * item.quantity), 0);
  const total = subtotalAmount + shippingCost - discountAmount;

  const subtotalElement = document.getElementById('subtotal');
  const shippingElement = document.getElementById('shipping-cost');
  const discountElement = document.getElementById('discount-amount');
  const totalElement = document.getElementById('total-amount');

  if (subtotalElement) subtotalElement.textContent = formatCurrency(subtotalAmount);
  if (shippingElement) shippingElement.textContent = formatCurrency(shippingCost);
  if (discountElement) discountElement.textContent = formatCurrency(discountAmount);
  if (totalElement) totalElement.textContent = formatCurrency(total);
}

//----FUNGSI PENGIRIMAN----\\
// Update shipping cost
function updateShipping(type) {
  switch(type) {
    case 'reguler':
      shippingCost = 15000;
      break;
    case 'express':
      shippingCost = 25000;
      break;
    case 'same_day':
      shippingCost = 35000;
      break;
    default:
      shippingCost = 15000;
  }
  calculateTotal();
}

//----FUNGSI VOUCHER----\\
// Apply voucher
function applyVoucher() {
  const voucherInput = document.getElementById('voucherInput');
  if (!voucherInput) {
    console.error('Voucher input not found');
    return;
  }

  const voucherCode = voucherInput.value.trim().toUpperCase();

  if (!voucherCode) {
    showNotification('Masukkan kode voucher', 'error');
    return;
  }

  if (voucherApplied) {
    showNotification('Voucher sudah digunakan', 'error');
    return;
  }

  let discount = 0;
  let message = '';

  switch (voucherCode) {
    case 'DISKON10':
      discount = subtotalAmount * 0.1;
      message = 'Diskon 10% berhasil diterapkan!';
      break;
    case 'GRATIS50':
      discount = 50000;
      message = 'Potongan Rp 50.000 berhasil diterapkan!';
      break;
    default:
      showNotification('Kode voucher tidak valid', 'error');
      return;
  }

  discountAmount = discount;
  voucherApplied = true;
  calculateTotal();
  showNotification(message, 'success');
  voucherInput.value = '';
}

// Remove voucher
function removeVoucher() {
  if (!voucherApplied) return;

  discountAmount = 0;
  voucherApplied = false;
  calculateTotal();
  showNotification('Voucher berhasil dihapus', 'success');
}

//----FUNGSI ALAMAT----\\
// Change address
function changeAddress() {
  const addressForm = document.getElementById('addressForm');
  if (addressForm) {
    addressForm.classList.toggle('hidden');
  }
}

//----FUNGSI CHECKOUT----\\
// Process checkout
function processCheckout() {
  // Show loading modal
  const loadingModal = document.getElementById('loading-modal');
  if (loadingModal) {
    loadingModal.classList.remove('hidden');
  }

  // Simulate API call
  setTimeout(() => {
    try {
      // Save order to history
      const order = {
        id: Date.now(),
        items: cartData,
        subtotal: subtotalAmount,
        shipping: shippingCost,
        discount: discountAmount,
        total: subtotalAmount + shippingCost - discountAmount,
        date: new Date().toISOString(),
        status: 'pending',
        address: {
          name: "John Doe",
          phone: "+62 821-2597-5449",
          address: "Jl. M. yusuf raya No. 57, RT 03/RW 22",
          city: "depok",
          postalCode: "16411"
        }
      };

      // Get existing orders or initialize empty array
      const orderHistory = JSON.parse(localStorage.getItem('orderHistory') || '[]');
      orderHistory.push(order);
      localStorage.setItem('orderHistory', JSON.stringify(orderHistory));

      // Clear checkout data and cart data
      localStorage.removeItem('checkout');
      localStorage.removeItem('cart'); // Hapus data keranjang

      // Hide loading modal and show success modal
      if (loadingModal) {
        loadingModal.classList.add('hidden');
      }

      const successModal = document.getElementById('success-modal');
      if (successModal) {
        successModal.classList.remove('hidden');
      }

      // Redirect to profile page with history tab after 3 seconds
      setTimeout(() => {
        window.location.href = "profile.html?tab=history";
      }, 3000);
    } catch (error) {
      console.error('Error processing checkout:', error);
      showNotification('Gagal memproses checkout', 'error');
      if (loadingModal) {
        loadingModal.classList.add('hidden');
      }
    }
  }, 2000);
}

//----FUNGSI NOTIFIKASI----\\
// Show notification
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

//----INISIALISASI HALAMAN----\\
// Initialize page
document.addEventListener('DOMContentLoaded', function() {
  // Load cart data
  loadCartData();

  // Add event listeners
  const regularShipping = document.getElementById('regularShipping');
  const expressShipping = document.getElementById('expressShipping');
  const applyVoucherBtn = document.getElementById('applyVoucherBtn');
  const removeVoucherBtn = document.getElementById('removeVoucherBtn');
  const changeAddressBtn = document.getElementById('changeAddressBtn');
  const checkoutForm = document.getElementById('checkoutForm');

  if (regularShipping) {
    regularShipping.addEventListener('change', () => updateShipping('regular'));
  }

  if (expressShipping) {
    expressShipping.addEventListener('change', () => updateShipping('express'));
  }

  if (applyVoucherBtn) {
    applyVoucherBtn.addEventListener('click', applyVoucher);
  }

  if (removeVoucherBtn) {
    removeVoucherBtn.addEventListener('click', removeVoucher);
  }

  if (changeAddressBtn) {
    changeAddressBtn.addEventListener('click', changeAddress);
  }

  if (checkoutForm) {
    checkoutForm.addEventListener('submit', (e) => {
      e.preventDefault();
      processCheckout();
    });
  }
}); 

