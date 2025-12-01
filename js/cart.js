// cart.js - Функции для работы с корзиной

// Глобальная переменная для отслеживания инициализации
let cartInitialized = false;

function getCart() {
    return JSON.parse(localStorage.getItem('cart')) || [];
}

function saveCart(cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
}

function addToCart(product) {
    const cart = getCart();
    const existingItem = cart.find(item => item.id === product.id);
    
    if (existingItem) {
        existingItem.quantity += product.quantity;
    } else {
        cart.push(product);
    }
    
    saveCart(cart);
    updateCartCount();
    return cart;
}

function removeFromCart(productId) {
    let cart = getCart();
    cart = cart.filter(item => item.id !== productId);
    saveCart(cart);
    updateCartCount();
    return cart;
}

function updateCartCount() {
    const cart = getCart();
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const cartCountElements = document.querySelectorAll('#cart-count');
    
    cartCountElements.forEach(element => {
        element.textContent = totalItems;
    });
    
    return totalItems;
}

function clearCart() {
    localStorage.removeItem('cart');
    updateCartCount();
}

// Функция для создания модального окна корзины
function createCartModal() {
    if (document.getElementById('cartModal')) {
        return; // Модальное окно уже существует
    }
    
    const cartModalHTML = `
        <div id="cartModal" class="cart-modal">
            <div class="cart-modal-content">
                <div class="cart-modal-header">
                    <h3>🛒 Ваша корзина</h3>
                    <button class="cart-modal-close" onclick="hideCartModal()">&times;</button>
                </div>
                <div class="cart-modal-body">
                    <div id="cart-modal-empty" class="cart-modal-empty">
                        <p>Корзина пуста</p>
                        <p>Добавьте товары из каталога</p>
                    </div>
                    <div id="cart-modal-content" style="display: none;">
                        <div id="cart-modal-items" class="cart-modal-items"></div>
                        <div class="cart-modal-summary">
                            <div class="cart-modal-total">
                                Итого: <span id="cart-modal-total">0</span> ₽
                            </div>
                            <button class="cart-modal-checkout-btn" onclick="checkoutFromModal()">
                                Оформить заказ
                            </button>
                            <button class="cart-modal-continue-btn" onclick="hideCartModal()">
                                Продолжить покупки
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', cartModalHTML);
    cartInitialized = true;
    
    // Принудительно устанавливаем правильное позиционирование
    const modal = document.getElementById('cartModal');
    const modalContent = modal.querySelector('.cart-modal-content');
    modalContent.style.transform = 'translate(-50%, -50%)';
}

// Функции для всплывающей корзины
function showCartModal() {
    // Создаем модальное окно, если его нет
    if (!document.getElementById('cartModal')) {
        createCartModal();
    }
    
    const modal = document.getElementById('cartModal');
    if (modal) {
        // Принудительно обновляем позиционирование перед показом
        const modalContent = modal.querySelector('.cart-modal-content');
        modalContent.style.transform = 'translate(-50%, -50%)';
        
        // Показываем модальное окно
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
        
        updateCartModal();
    }
}

function hideCartModal() {
    const modal = document.getElementById('cartModal');
    if (modal) {
        modal.classList.remove('show');
        document.body.style.overflow = '';
    }
}

function updateCartModal() {
    const cart = getCart();
    const container = document.getElementById('cart-modal-items');
    const totalPriceElement = document.getElementById('cart-modal-total');
    const emptyCartElement = document.getElementById('cart-modal-empty');
    const cartContentElement = document.getElementById('cart-modal-content');

    if (!container || !totalPriceElement || !emptyCartElement || !cartContentElement) {
        console.error('Cart modal elements not found');
        return;
    }

    if (cart.length === 0) {
        emptyCartElement.style.display = 'block';
        cartContentElement.style.display = 'none';
        return;
    }

    emptyCartElement.style.display = 'none';
    cartContentElement.style.display = 'block';
    container.innerHTML = '';

    let totalPrice = 0;

    cart.forEach(item => {
        const price = parseFloat(item.price.replace(/[^\d]/g, ''));
        const itemTotal = price * item.quantity;
        totalPrice += itemTotal;

        const cartItem = document.createElement('div');
        cartItem.className = 'cart-modal-item';
        cartItem.innerHTML = `
            <img src="${item.image}" alt="${item.name}" class="cart-modal-item-image">
            <div class="cart-modal-item-info">
                <div class="cart-modal-item-name">${item.name}</div>
                <div class="cart-modal-item-price">${item.price} × ${item.quantity}</div>
                <div class="cart-modal-item-total">${itemTotal.toLocaleString()} ₽</div>
            </div>
            <div class="cart-modal-item-controls">
                <button class="cart-modal-quantity-btn" onclick="changeCartModalQuantity('${item.id}', -1)">-</button>
                <span class="cart-modal-quantity">${item.quantity}</span>
                <button class="cart-modal-quantity-btn" onclick="changeCartModalQuantity('${item.id}', 1)">+</button>
                <button class="cart-modal-remove-btn" onclick="removeFromCartModal('${item.id}')">×</button>
            </div>
        `;
        container.appendChild(cartItem);
    });

    totalPriceElement.textContent = totalPrice.toLocaleString();
}

function changeCartModalQuantity(productId, change) {
    const cart = getCart();
    const item = cart.find(item => item.id === productId);
    
    if (item) {
        item.quantity += change;
        if (item.quantity < 1) {
            removeFromCartModal(productId);
            return;
        }
        saveCart(cart);
        updateCartCount();
        updateCartModal();
    }
}

function removeFromCartModal(productId) {
    removeFromCart(productId);
    updateCartModal();
    showNotification('Товар удален из корзины');
}

function checkoutFromModal() {
    const cart = getCart();
    if (cart.length === 0) {
        alert('Корзина пуста!');
        return;
    }

    alert('Заказ оформлен! С вами свяжется менеджер для подтверждения.');
    clearCart();
    hideCartModal();
    updateCartModal();
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    // Создаем модальное окно корзины сразу при загрузке
    createCartModal();
    updateCartCount();
    
    // Закрытие корзины при клике вне области
    document.addEventListener('click', function(event) {
        const cartModal = document.getElementById('cartModal');
        if (event.target === cartModal) {
            hideCartModal();
        }
    });

    // Закрытие корзины по ESC
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            hideCartModal();
        }
    });
});

function showNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #0a4788;
        color: white;
        padding: 15px 20px;
        border-radius: 5px;
        z-index: 10000;
        font-family: Tahoma;
        box-shadow: 0 2px 10px rgba(0,0,0,0.3);
        max-width: 300px;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Экспортируем функции в глобальную область видимости
window.showCartModal = showCartModal;
window.hideCartModal = hideCartModal;
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.updateCartCount = updateCartCount;
window.createCartModal = createCartModal;