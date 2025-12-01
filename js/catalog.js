// catalog.js - Функции для каталога
let allProducts = [];

// Загрузка товаров из JSON
async function loadProductsData() {
    try {
        const response = await fetch('products.json');
        const data = await response.json();
        allProducts = data.products;
        return allProducts;
    } catch (error) {
        console.error('Ошибка загрузки товаров:', error);
        return [];
    }
}

// Функция создания HTML для подсказки с характеристиками
function createTooltipHTML(product) {
    let specsHTML = '';
    for (const [key, value] of Object.entries(product.specs)) {
        specsHTML += `<li><strong>${key}:</strong> ${value}</li>`;
    }
    
    return `
        <div class="product-tooltip">
            <ul>${specsHTML}</ul>  
        </div>
    `;
}

// Функция поиска товаров
function searchProducts(query, products) {
    if (!query) return products;
    
    const searchTerm = query.toLowerCase();
    return products.filter(product => 
        product.name.toLowerCase().includes(searchTerm) ||
        product.description.toLowerCase().includes(searchTerm) ||
        (product.specs && Object.values(product.specs).some(value => 
            value.toString().toLowerCase().includes(searchTerm)
        ))
    );
}

function loadProducts(category = 'all', searchQuery = '') {
    const container = document.getElementById('products-container');
    const title = document.getElementById('catalog-title');
    
    const categoryNames = {
        'all': 'Все товары',
        'chairs': 'Стулья',
        'tables': 'Столы',
        'sofas': 'Диваны',
        'armchairs': 'Кресла',
        'wardrobes': 'Шкафы',
        'chests': 'Комоды'
    };
    
    let filteredProducts = allProducts;
    
    // Применяем фильтр по категории
    if (category !== 'all') {
        filteredProducts = filteredProducts.filter(product => product.category === category);
    }
    
    // Применяем поисковый запрос
    if (searchQuery) {
        filteredProducts = searchProducts(searchQuery, filteredProducts);
        title.textContent = `Результаты поиска: "${searchQuery}"`;
    } else {
        title.textContent = categoryNames[category] || 'Каталог мебели';
    }
    
    container.innerHTML = '';
    
    if (filteredProducts.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; grid-column: 1 / -1; padding: 40px;">
                <h3>Товары не найдены</h3>
                <p>Попробуйте изменить поисковый запрос или выбрать другую категорию</p>
            </div>
        `;
        return;
    }
    
    filteredProducts.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.innerHTML = `
            <div class="product-image-container">
                <img src="${product.image}" alt="${product.name}" onclick="showProductModal('${product.id}')">
                ${createTooltipHTML(product)}
            </div>
            <h3>${product.name}</h3>
            <div class="product-price">${product.price}</div>
            <button class="add-to-cart-btn" onclick="addProductToCart('${product.id}')">В корзину</button>
        `;
        container.appendChild(productCard);
    });
}

// Остальные функции остаются без изменений...
function showProductModal(productId) {
    const product = allProducts.find(p => p.id === productId);
    if (!product) return;
    
    const modal = document.getElementById('productModal');
    const body = document.getElementById('product-modal-body');
    
    let specsHTML = '';
    for (const [key, value] of Object.entries(product.specs)) {
        specsHTML += `<li><strong>${key}:</strong> ${value}</li>`;
    }
    
    body.innerHTML = `
        <div class="product-modal-image">
            <img src="${product.image}" alt="${product.name}">
        </div>
        <div class="product-modal-info">
            <h2>${product.name}</h2>
            <p>${product.description}</p>
            <div class="product-modal-price">${product.price}</div>
            <div class="product-specs">
                <h4>Характеристики:</h4>
                <ul>${specsHTML}</ul>
            </div>
            <button class="add-to-cart-btn" onclick="addProductToCart('${product.id}'); hideProductModal();" style="margin-top: 20px;">
                Добавить в корзину
            </button>
        </div>
    `;
    
    modal.style.display = 'block';
}

function hideProductModal() {
    document.getElementById('productModal').style.display = 'none';
}

function addProductToCart(productId) {
    const product = allProducts.find(p => p.id === productId);
    if (!product) return;
    
    addToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity: 1
    });
    
    showNotification('Товар добавлен в корзину!');
}

// Закрытие модальных окон при клике вне области
window.onclick = function(event) {
    const productModal = document.getElementById('productModal');
    const cartModal = document.getElementById('cartModal');
    
    if (event.target === productModal) {
        hideProductModal();
    }
    if (event.target === cartModal) {
        hideCartModal();
    }
}

// Обработка параметров URL и инициализация
document.addEventListener('DOMContentLoaded', async function() {
    await loadProductsData();
    
    const params = getUrlParams();
    const category = params.category || 'all';
    const searchQuery = params.search || '';
    
    // Заполняем поле поиска если есть поисковый запрос
    if (searchQuery) {
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.value = decodeURIComponent(searchQuery);
        }
    }
    
    loadProducts(category, searchQuery);
    
    // Обновляем ссылки в выпадающем меню
    document.querySelectorAll('.dropdown-menu a').forEach(link => {
        const category = link.getAttribute('href').split('=')[1];
        link.addEventListener('click', function(e) {
            e.preventDefault();
            loadProducts(category);
            // Обновляем URL без перезагрузки страницы
            window.history.pushState({}, '', `catalog.html?category=${category}`);
        });
    });
    
    // Обработчик для кнопки "Каталог" (показывает все товары)
    const catalogBtn = document.querySelector('.dropdown-toggle');
    if (catalogBtn) {
        catalogBtn.addEventListener('click', function(e) {
            if (window.innerWidth > 768) {
                e.preventDefault();
                loadProducts('all');
                window.history.pushState({}, '', 'catalog.html');
            }
        });
    }
    
    // Закрытие модальных окон по ESC
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            hideProductModal();
            hideCartModal();
        }
    });
});