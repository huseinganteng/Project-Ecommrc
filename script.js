async function ambilData(params) {
    try {
        const response = await fetch("https://fakestoreapi.com/products?limit=3");
        const data = await response.json();
        const displayhtml = document.getElementById("data-product");
        displayhtml.className = "flex flex-wrap justify-center gap-6";
        
        data.forEach(post => {
            const postElement = document.createElement('div');
            postElement.className = "bg-white rounded-3xl shadow-md hover:shadow-xl transition-all duration-300 p-6 flex flex-col cursor-pointer transform hover:-translate-y-2 w-full max-w-sm";

            postElement.innerHTML = `
                <div class="relative w-full mb-4">
                    <img src="${post.image}" alt="${post.title}" class="h-48 w-full object-contain transition-transform duration-300 hover:scale-105 rounded-2xl" />
                    <span class="absolute top-2 right-2 bg-yellow-400 text-xs font-bold px-3 py-1.5 rounded-full shadow">⭐ ${post.rating.rate}</span>
                </div>
                <div class="flex-1 flex flex-col">
                    <h3 class="font-bold text-lg mb-2 text-gray-800 line-clamp-2 leading-tight">${post.title}</h3>
                    <p class="text-sm text-gray-500 capitalize mb-3 font-medium">${post.category}</p>
                    <div class="flex items-center mb-3">
                        <div class="flex items-center text-yellow-400">
                            ${generateStars(post.rating.rate)}
                        </div>
                        <span class="text-sm text-gray-500 ml-2">(${post.rating.count} ulasan)</span>
                    </div>
                    <p class="text-blue-600 font-bold text-xl mb-6">Rp ${(post.price * 15000).toLocaleString('id-ID')}</p>
                    <div class="grid grid-cols-2 gap-3 mt-auto">
                        <button 
                            onclick="event.stopPropagation(); tambahKeKeranjang(${post.id})"
                            class="bg-blue-600 text-white px-4 py-3 rounded-2xl hover:bg-blue-700 transition-all duration-200 text-sm font-semibold hover:scale-105">
                            + Keranjang
                        </button>
                        <button 
                            onclick="event.stopPropagation(); beliSekarang(${post.id})"
                            class="bg-green-600 text-white px-4 py-3 rounded-2xl hover:bg-green-700 transition-all duration-200 text-sm font-semibold hover:scale-105">
                            Beli Sekarang
                        </button>
                    </div>
                </div>
            `;
            
            postElement.addEventListener('click', () => showProductDetail(post));
            displayhtml.appendChild(postElement);
        });

    } catch (error) {
        console.error("Terjadi error:", error);
        const displayhtml = document.getElementById("data-product");
        if (displayhtml) {
            displayhtml.innerHTML = `
                <div class="col-span-full text-center py-16">
                    <div class="text-gray-500 text-2xl mb-4">😔 Terjadi kesalahan</div>
                    <p class="text-gray-600">Silakan coba lagi nanti</p>
                </div>
            `;
        }
    }
}

// Fungsi untuk menambah ke keranjang
function tambahKeKeranjang(productId) {
    const user = localStorage.getItem('currentUser');
    if (!user) {
        // Tampilkan modal register
        document.getElementById('registerBtn').click();
        return;
    }

    // Jika sudah login, tambahkan ke keranjang
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const products = JSON.parse(localStorage.getItem('allProducts') || '[]');
    const product = products.find(p => p.id === productId);
    
    if (product) {
        const existingItem = cart.find(item => item.id === productId);
        if (existingItem) {
            existingItem.quantity += 1;
            existingItem.total = existingItem.quantity * existingItem.price;
        } else {
            cart.push({
                id: product.id,
                title: product.title,
                price: product.price,
                image: product.image,
                quantity: 1,
                total: product.price
            });
        }
        localStorage.setItem('cart', JSON.stringify(cart));
        
        // Hitung total keseluruhan
        const totalCart = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        localStorage.setItem('cartTotal', JSON.stringify(totalCart));
        
        alert(`Produk berhasil ditambahkan ke keranjang\nTotal: Rp ${(totalCart * 15000).toLocaleString('id-ID')}`);
    }
}

// Fungsi untuk membeli produk
function beliSekarang(productId) {
    const user = localStorage.getItem('currentUser');
    if (!user) {
        // Tampilkan modal register
        document.getElementById('registerBtn').click();
        return;
    }

    // Jika sudah login, simpan produk yang dipilih
    const products = JSON.parse(localStorage.getItem('allProducts') || '[]');
    const product = products.find(p => p.id === productId);
    
    if (product) {
        localStorage.setItem('selectedProduct', JSON.stringify(product));
        // Tampilkan modal login untuk konfirmasi
        document.getElementById('loginBtn').click();
    }
}

// Helper function to generate star ratings
function generateStars(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    let stars = '';
    
    for (let i = 0; i < fullStars; i++) {
        stars += '<i class="fas fa-star"></i>';
    }
    if (hasHalfStar) {
        stars += '<i class="fas fa-star-half-alt"></i>';
    }
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    for (let i = 0; i < emptyStars; i++) {
        stars += '<i class="far fa-star"></i>';
    }
    
    return stars;
}

// Call the function when the page loads
document.addEventListener('DOMContentLoaded', ambilData);
