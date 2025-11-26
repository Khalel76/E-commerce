const state = {
    allProducts: [],
    filteredProducts: [],
    categories: [],
    currentSearchQuery: '',
    currentCategory: 'all'
};

const elements = {
    searchInput: document.getElementById('search-input'),
    categoryFilter: document.getElementById('category-filter'),
    productsGrid: document.getElementById('products-grid'),
    loadingSpinner: document.getElementById('loading-spinner'),
    errorMessage: document.getElementById('error-message'),
    noResults: document.getElementById('no-results'),
    resultsCount: document.getElementById('results-count'),
    clearFiltersBtn: document.getElementById('clear-filters-btn'),
    retryBtn: document.getElementById('retry-btn'),
    productModal: document.getElementById('product-modal'),
    modalContent: document.getElementById('modal-content'),
    closeModalBtn: document.getElementById('close-modal-btn')
};

const API = {
    PRODUCTS: 'https://fakestoreapi.com/products',
    CATEGORIES: 'https://fakestoreapi.com/products/categories'
};

async function fetchProducts() {
    try {
        const response = await fetch(API.PRODUCTS);
        if (!response.ok) throw new Error('Failed to fetch products');
        const products = await response.json();
        return products;
    } catch (error) {
        console.error('Error fetching products:', error);
        throw error;
    }
}

async function fetchCategories() {
    try {
        const response = await fetch(API.CATEGORIES);
        if (!response.ok) throw new Error('Failed to fetch categories');
        const categories = await response.json();
        return categories;
    } catch (error) {
        console.error('Error fetching categories:', error);
        throw error;
    }
}

async function initializeApp() {
    try {
        showLoading();
        const [products, categories] = await Promise.all([
            fetchProducts(),
            fetchCategories()
        ]);
        state.allProducts = products;
        state.filteredProducts = products;
        state.categories = categories;
        populateCategories();
        displayProducts(state.filteredProducts);
        hideLoading();
        updateResultsCount();
    } catch (error) {
        showError();
    }
}

function showLoading() {
    elements.loadingSpinner.classList.remove('hidden');
    elements.productsGrid.classList.add('hidden');
    elements.errorMessage.classList.add('hidden');
    elements.noResults.classList.add('hidden');
}

function hideLoading() {
    elements.loadingSpinner.classList.add('hidden');
}

function showError() {
    hideLoading();
    elements.errorMessage.classList.remove('hidden');
    elements.productsGrid.classList.add('hidden');
    elements.noResults.classList.add('hidden');
}

function populateCategories() {
    state.categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = capitalizeWords(category);
        elements.categoryFilter.appendChild(option);
    });
}

function displayProducts(products) {
    elements.productsGrid.innerHTML = '';

    if (products.length === 0) {
        elements.noResults.classList.remove('hidden');
        elements.productsGrid.classList.add('hidden');
        return;
    }

    elements.noResults.classList.add('hidden');
    elements.productsGrid.classList.remove('hidden');

    products.forEach((product, index) => {
        const productCard = createProductCard(product);
        elements.productsGrid.appendChild(productCard);

        setTimeout(() => {
            productCard.classList.add('fade-in');
        }, index * 50);
    });
}

function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card opacity-0';
    card.onclick = () => openProductModal(product);

    const categoryClass = getCategoryClass(product.category);

    card.innerHTML = `
        <div class="product-image-container">
            <img src="${product.image}" alt="${product.title}" class="product-image">
        </div>
        <div class="p-5">
            <div class="mb-3">
                <span class="category-badge ${categoryClass}">
                    ${product.category}
                </span>
            </div>
            <h3 class="text-lg font-bold text-gray-800 mb-2 line-clamp-2 h-14">
                ${product.title}
            </h3>
            <div class="flex items-center justify-between mt-4">
                <span class="price-tag ">$${product.price.toFixed(2)}</span>
                <div class="rating-stars">
                    ${generateStars(product.rating.rate)}
                    <span class="text-sm text-green-300 ml-1">(${product.rating.count})</span>
                </div>
            </div>
            <button class="mt-4 w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-700 hover:to-green-800 text-white font-semibold py-2.5 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg">
                <i class="fas fa-eye mr-2"></i>View Details
            </button>
        </div>
    `;

    return card;
}

function getCategoryClass(category) {
    const categoryMap = {
        'electronics': 'category-electronics',
        'jewelery': 'category-jewelery',
        "men's clothing": 'category-mens-clothing',
        "women's clothing": 'category-womens-clothing'
    };
    return categoryMap[category] || 'category-electronics';
}

function generateStars(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    let stars = '';

    for (let i = 0; i < 5; i++) {
        if (i < fullStars) {
            stars += '<i class="fas fa-star star"></i>';
        } else if (i === fullStars && hasHalfStar) {
            stars += '<i class="fas fa-star-half-alt star"></i>';
        } else {
            stars += '<i class="far fa-star star empty"></i>';
        }
    }

    return stars;
}

function openProductModal(product) {
    const categoryClass = getCategoryClass(product.category);

    elements.modalContent.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div class="flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-8">
                <img src="${product.image}" alt="${product.title}" class="modal-product-image">
            </div>
            
            <div class="flex flex-col justify-between">
                <div>
                    <span class="category-badge ${categoryClass} mb-4 inline-block">
                        ${product.category}
                    </span>
                    <h2 class="text-3xl font-bold text-gray-900 mb-4">${product.title}</h2>
                    
                    <div class="flex items-center gap-4 mb-6">
                        <div class="rating-stars">
                            ${generateStars(product.rating.rate)}
                        </div>
                        <span class="text-gray-600">${product.rating.rate} / 5</span>
                        <span class="text-gray-400">•</span>
                        <span class="text-gray-600">${product.rating.count} reviews</span>
                    </div>
                    
                    <div class="mb-6">
                        <h3 class="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">Description</h3>
                        <p class="text-gray-600 leading-relaxed">${product.description}</p>
                    </div>
                </div>
                
                <div class="border-t border-gray-200 pt-6">
                    <div class="flex items-center justify-between mb-6">
                        <span class="text-gray-600 font-medium">Price</span>
                        <span class="text-4xl font-bold bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent">
                            $${product.price.toFixed(2)}
                        </span>
                    </div>
                    <button class="w-full bg-gradient-to-r from-green-600 to-green-800 hover:from-green-700 hover:to-green-900 text-white font-bold py-4 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl">
                        <i class="fas fa-shopping-cart mr-2"></i>Add to Cart
                    </button>
                </div>
            </div>
        </div>
    `;

    elements.productModal.classList.remove('hidden');
    elements.productModal.classList.add('flex');
    document.body.style.overflow = 'hidden';
}

function closeProductModal() {
    elements.productModal.classList.add('hidden');
    elements.productModal.classList.remove('flex');
    document.body.style.overflow = 'auto';
}

function filterProducts() {
    let filtered = [...state.allProducts];

    if (state.currentSearchQuery) {
        filtered = filtered.filter(product =>
            product.title.toLowerCase().includes(state.currentSearchQuery.toLowerCase())
        );
    }

    console.log(state.currentCategory);
    if (state.currentCategory !== 'all') {
        filtered = filtered.filter(product =>
            product.category === state.currentCategory
        );
    }

    state.filteredProducts = filtered;
    displayProducts(state.filteredProducts);
    updateResultsCount();
    updateClearFiltersButton();
}

function updateResultsCount() {
    const count = state.filteredProducts.length;
    const total = state.allProducts.length;

    if (count === total) {
        elements.resultsCount.innerHTML = `<i class="fas fa-box-open mr-2"></i>Showing all ${total} products`;
    } else {
        elements.resultsCount.innerHTML = `<i class="fas fa-box-open mr-2"></i>Showing ${count} of ${total} products`;
    }
}

function updateClearFiltersButton() {
    if (state.currentSearchQuery || state.currentCategory !== 'all') {
        elements.clearFiltersBtn.classList.remove('hidden');
    } else {
        elements.clearFiltersBtn.classList.add('hidden');
    }
}

function clearFilters() {
    state.currentSearchQuery = '';
    state.currentCategory = 'all';
    elements.searchInput.value = '';
    elements.categoryFilter.value = 'all';
    filterProducts();
}

function capitalizeWords(str) {
    return str.replace(/\b\w/g, char => char.toUpperCase());
}

function debounce(func, delay) {
    let timeoutId;
    return function (...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
}

elements.searchInput.addEventListener('input', debounce((e) => {
    state.currentSearchQuery = e.target.value.trim();
    filterProducts();
}, 300));

elements.categoryFilter.addEventListener('change', (e) => {
    state.currentCategory = e.target.value;
    filterProducts();
});

elements.clearFiltersBtn.addEventListener('click', clearFilters);

elements.retryBtn.addEventListener('click', initializeApp);

elements.closeModalBtn.addEventListener('click', closeProductModal);

elements.productModal.addEventListener('click', (e) => {
    if (e.target === elements.productModal) {
        closeProductModal();
    }
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !elements.productModal.classList.contains('hidden')) {
        closeProductModal();
    }
});

document.addEventListener('DOMContentLoaded', initializeApp);