// Адреса твого бекенду (ЗАЛИШАЄТЬСЯ ТА Ж)
const API_URL = "https://study-swap.onrender.com/api/items";
let allItems = [];

// 1. Логіка перемикача тем (БЕЗ ЗМІН)
const themeToggle = document.getElementById('theme-toggle');
themeToggle.addEventListener('click', () => {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    document.documentElement.setAttribute('data-theme', isDark ? 'light' : 'dark');
});

// 2. Завантаження даних та ефект скелетонів (ЛОГІКА ТА Ж)
async function loadItems() {
    try {
        // Залишаємо скелетони в HTML, щоб вони показувалися поки йде запит
        const res = await fetch(API_URL);
        allItems = await res.json();
        renderItems(allItems);
        
        // Ініціалізуємо AOS для нових карток
        AOS.refresh();
    } catch (err) {
        console.error("Помилка завантаження", err);
        document.getElementById('items-container').innerHTML = "<p style='text-align:center;'>❌ Не вдалося завантажити матеріали</p>";
    }
}

// 3. Відтворення карток (ЗМІНЕНО ТІЛЬКИ ОФОРМЛЕННЯ КЛАСІВ)
function renderItems(items) {
    const container = document.getElementById('items-container');
    container.innerHTML = '';
    
    if(items.length === 0) {
        container.innerHTML = "<p style='grid-column: 1 / -1; text-align:center; opacity:0.5;'>Оголошень ще немає. Будь першою!</p>";
        return;
    }

    items.forEach((item, index) => {
        const card = document.createElement('div');
        
        // Нові стильні класи та анімація AOS
        card.className = 'item-card';
        card.setAttribute('data-aos', 'fade-up');
        card.setAttribute('data-aos-delay', index * 50); // Легкий ефект черговості
        
        const date = new Date(item.createdAt).toLocaleDateString('uk-UA', { day: 'numeric', month: 'long' });

        // Оновлена стильна верстка картки (ЗБЕРІГАЄ ВЕСЬ ФУНКЦІОНАЛ)
        card.innerHTML = `
            <div class="item-card-header">
                📌 <span>${item.description}</span>
            </div>
            <div class="item-card-body">
                <h3 class="item-title">${item.title}</h3>
                
                ${item.imageUrl ? `
                    <a href="${item.imageUrl}" target="_blank" class="item-image-wrapper">
                        <img src="${item.imageUrl}" alt="${item.title}" loading="lazy">
                        <div class="zoom-overlay">🔍 Відкрити файл</div>
                    </a>
                ` : ''}

                <div class="item-date">
                    🗓 <span>Опубліковано: ${date}</span>
                </div>
            </div>
            <div class="item-card-footer">
                <button class="item-delete-btn" onclick="deleteItem('${item._id}')">🗑 Видалити</button>
                <div class="item-likes">
                    <span class="like-button">🤍 0</span>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}

// 4. Пошук (БЕЗ ЗМІН)
function filterItems() {
    const query = document.getElementById('search').value.toLowerCase();
    const filtered = allItems.filter(item => 
        item.title.toLowerCase().includes(query) || 
        item.description.toLowerCase().includes(query)
    );
    renderItems(filtered);
}

// 5. Завантаження нового оголошення (БЕЗ ЗМІН ЛОГІКИ)
async function uploadItem() {
    const title = document.getElementById('title').value;
    const desc = document.getElementById('description').value;
    const imageFile = document.getElementById('image').files[0];

    if(!title || !desc) return alert("Заповни назву та предмет!");

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', desc);
    if(imageFile) formData.append('image', imageFile);

    try {
        await fetch(API_URL, { method: 'POST', body: formData });
        
        // Очищення полів (БЕЗ ЗМІН)
        document.getElementById('title').value = '';
        document.getElementById('description').value = '';
        document.getElementById('image').value = '';
        
        loadItems(); // Перезавантажуємо
    } catch (err) {
        console.error("Помилка публікації", err);
    }
}

// 6. Видалення оголошення (БЕЗ ЗМІН)
async function deleteItem(id) {
    if(confirm('Видалити цей матеріал назавжди?')) {
        await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
        loadItems(); // Перезавантажуємо
    }
}

// Завантаження при старті
loadItems();