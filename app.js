const API_URL = "https://study-swap.onrender.com/api/items";
let allItems = [];

// Перемикач теми
document.getElementById('theme-toggle').addEventListener('click', () => {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    document.documentElement.setAttribute('data-theme', isDark ? 'light' : 'dark');
});

// Завантаження даних
async function loadItems() {
    try {
        const res = await fetch(API_URL);
        allItems = await res.json();
        renderItems(allItems);
        AOS.init({ duration: 800, once: true });
    } catch (err) {
        console.error("Помилка завантаження даних");
    }
}

function renderItems(items) {
    const container = document.getElementById('items-container');
    container.innerHTML = '';
    
    items.forEach(item => {
        const card = document.createElement('div');
        card.className = 'card';
        card.setAttribute('data-aos', 'fade-up');
        
        const date = new Date(item.createdAt).toLocaleDateString('uk-UA');

        card.innerHTML = `
            <div class="card-header">📌 ${item.description}</div>
            <div class="card-body">
                <h3>${item.title}</h3>
                <div class="date-info">🗓 ${date}</div>
                
                ${item.imageUrl ? `
                    <a href="${item.imageUrl}" target="_blank">
                        <img src="${item.imageUrl}" title="Натисніть, щоб відкрити">
                    </a>
                ` : ''}

                <div style="display:flex; justify-content: space-between; align-items: center;">
                    <button class="delete-btn" onclick="deleteItem('${item._id}')">🗑 Видалити</button>
                    <span style="font-size: 18px;">❤️ 0</span>
                </div>
            </div>
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

// Завантаження нового
async function uploadItem() {
    const title = document.getElementById('title').value;
    const desc = document.getElementById('description').value;
    const imageFile = document.getElementById('image').files[0];

    if(!title || !desc) return alert("Заповніть назву та предмет!");

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', desc);
    if(imageFile) formData.append('image', imageFile);

    await fetch(API_URL, { method: 'POST', body: formData });
    
    // Скидання полів
    document.getElementById('title').value = '';
    document.getElementById('description').value = '';
    document.getElementById('image').value = '';
    
    loadItems();
}

// Видалення
async function deleteItem(id) {
    if(confirm('Видалити цей матеріал?')) {
        await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
        loadItems();
    }
}

loadItems();