const API_URL = "https://study-swap.onrender.com/api/items";
let allItems = [];

// Тема
document.getElementById('theme-toggle').addEventListener('click', () => {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    document.documentElement.setAttribute('data-theme', isDark ? 'light' : 'dark');
});

async function loadItems() {
    try {
        const res = await fetch(API_URL);
        allItems = await res.json();
        renderItems(allItems);
        AOS.init({ duration: 800 });
    } catch (e) { console.error("Error loading"); }
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
                <div class="date-tag">🗓 ${date}</div>
                ${item.imageUrl ? `<img src="${item.imageUrl}">` : ''}
                <div style="display:flex; justify-content: space-between; align-items: center;">
                    <button class="delete-btn" onclick="deleteItem('${item._id}')">🗑 Видалити</button>
                    <span style="font-size: 18px;">❤️ 0</span>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}

function filterItems() {
    const q = document.getElementById('search').value.toLowerCase();
    const filtered = allItems.filter(i => i.title.toLowerCase().includes(q) || i.description.toLowerCase().includes(q));
    renderItems(filtered);
}

async function uploadItem() {
    const title = document.getElementById('title').value;
    const desc = document.getElementById('description').value;
    const img = document.getElementById('image').files[0];

    if (!title || !desc) return alert("Заповни всі поля!");

    const fd = new FormData();
    fd.append('title', title);
    fd.append('description', desc);
    if(img) fd.append('image', img);

    await fetch(API_URL, { method: 'POST', body: fd });
    location.reload(); // Перезавантаження для оновлення списку
}

async function deleteItem(id) {
    if(confirm("Видалити цей матеріал?")) {
        await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
        loadItems();
    }
}

loadItems();