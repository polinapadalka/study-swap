const API_URL = "https://study-swap.onrender.com/api/items";
let allItems = []; // Зберігаємо тут копію даних для пошуку

// Темна тема
document.getElementById('theme-toggle').addEventListener('click', () => {
    const theme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', theme);
});

// Завантаження даних
async function loadItems() {
    const container = document.getElementById('items-container');
    container.innerHTML = '<div class="card skeleton"></div>'; // Показуємо скелетон

    try {
        const res = await fetch(API_URL);
        allItems = await res.json();
        renderItems(allItems);
        AOS.init(); // Перезапуск анімацій
    } catch (err) {
        container.innerHTML = "Помилка завантаження";
    }
}

function renderItems(items) {
    const container = document.getElementById('items-container');
    container.innerHTML = '';
    
    items.forEach(item => {
        const date = new Date(item.createdAt).toLocaleString('uk-UA');
        const card = document.createElement('div');
        card.className = 'card';
        card.setAttribute('data-aos', 'fade-up');
        
        card.innerHTML = `
            <h3>${item.title} <small>(${item.category})</small></h3>
            <p>${item.description}</p>
            ${item.imageUrl ? `<img src="${item.imageUrl}">` : ''}
            <p style="font-size: 12px; opacity: 0.6;">Створено: ${date}</p>
            <button class="delete-btn" onclick="deleteItem('${item._id}')">🗑 Видалити</button>
        `;
        container.appendChild(card);
    });
}

// Пошук
function filterItems() {
    const query = document.getElementById('search').value.toLowerCase();
    const filtered = allItems.filter(item => 
        item.title.toLowerCase().includes(query) || 
        item.description.toLowerCase().includes(query)
    );
    renderItems(filtered);
}

// Створення
async function uploadItem() {
    const formData = new FormData();
    formData.append('title', document.getElementById('title').value);
    formData.append('description', document.getElementById('description').value);
    formData.append('category', document.getElementById('category').value);
    formData.append('image', document.getElementById('image').files[0]);

    await fetch(API_URL, { method: 'POST', body: formData });
    loadItems();
}

// Видалення
async function deleteItem(id) {
    if(confirm('Видалити це оголошення?')) {
        await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
        loadItems();
    }
}

loadItems();