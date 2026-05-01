const API_URL = "https://study-swap.onrender.com/api/items";
let allItems = [];

document.getElementById('theme-toggle').addEventListener('click', () => {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    document.documentElement.setAttribute('data-theme', isDark ? 'light' : 'dark');
});

async function loadItems() {
    try {
        const res = await fetch(API_URL);
        allItems = await res.json();
        renderItems(allItems);
        if (window.AOS) {
            AOS.init({ duration: 800, once: true });
        }
    } catch (err) {
        console.error("Помилка завантаження");
    }
}

function renderItems(items) {
    const container = document.getElementById('items-container');
    container.innerHTML = '';
    
    items.forEach(item => {
        const card = document.createElement('div');
        card.className = 'item-card';
        card.setAttribute('data-aos', 'fade-up');
        
        const date = new Date(item.createdAt).toLocaleDateString('uk-UA');

        card.innerHTML = `
            <div class="item-card-header">📌 ${item.description}</div>
            <div class="item-card-body">
                <h3 style="margin:0">${item.title}</h3>
                <small style="opacity:0.6">🗓 ${date}</small>
                ${item.imageUrl ? `<a href="${item.imageUrl}" target="_blank"><img src="${item.imageUrl}"></a>` : ''}
                <div style="display:flex; justify-content: space-between; align-items: center;">
                    <button class="item-delete-btn" onclick="deleteItem('${item._id}')">🗑 Видалити</button>
                    <span>🤍 0</span>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}

function filterItems() {
    const q = document.getElementById('search').value.toLowerCase();
    const filtered = allItems.filter(i => 
        i.title.toLowerCase().includes(q) || 
        i.description.toLowerCase().includes(q)
    );
    renderItems(filtered);
}

async function uploadItem() {
    const t = document.getElementById('title').value;
    const d = document.getElementById('description').value;
    const i = document.getElementById('image').files[0];
    if(!t || !d) return alert("Заповни поля!");

    const fd = new FormData();
    fd.append('title', t); 
    fd.append('description', d);
    if(i) fd.append('image', i);

    await fetch(API_URL, { method: 'POST', body: fd });
    
    document.getElementById('title').value = '';
    document.getElementById('description').value = '';
    document.getElementById('image').value = '';
    
    loadItems();
}

async function deleteItem(id) {
    if(confirm("Видалити цей матеріал?")) {
        await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
        loadItems();
    }
}

loadItems();