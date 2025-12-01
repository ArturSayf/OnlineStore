// common.js - Общие функции для всех страниц

// Функция для показа уведомлений
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    const backgroundColor = type === 'success' ? '#0a4788' : '#ff4444';
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${backgroundColor};
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

// Обработка поиска (если осталась на других страницах)
document.addEventListener('DOMContentLoaded', function() {
    const searchForm = document.getElementById('searchForm');
    if (searchForm) {
        searchForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const searchQuery = document.getElementById('searchInput').value.trim();
            if (searchQuery) {
                window.location.href = `catalog.html?search=${encodeURIComponent(searchQuery)}`;
            }
        });
    }
    
    // Адаптивное меню для мобильных устройств
    const dropdowns = document.querySelectorAll('.dropdown');
    dropdowns.forEach(dropdown => {
        const toggle = dropdown.querySelector('.dropdown-toggle');
        if (toggle) {
            toggle.addEventListener('click', function(e) {
                if (window.innerWidth <= 768) {
                    e.preventDefault();
                    dropdown.classList.toggle('active');
                }
            });
        }
    });
    
    // Закрытие выпадающих меню при клике вне их области
    document.addEventListener('click', function(e) {
        if (window.innerWidth <= 768) {
            dropdowns.forEach(dropdown => {
                if (!dropdown.contains(e.target)) {
                    dropdown.classList.remove('active');
                }
            });
        }
    });

    // Принудительная инициализация корзины
    if (typeof createCartModal === 'function') {
        createCartModal();
    }
    if (typeof updateCartCount === 'function') {
        updateCartCount();
    }
});

// Функция для получения параметров URL
function getUrlParams() {
    const params = new URLSearchParams(window.location.search);
    const result = {};
    for (const [key, value] of params) {
        result[key] = value;
    }
    return result;
}