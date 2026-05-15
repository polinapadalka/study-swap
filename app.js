const RPC_URL = "https://study-swap.onrender.com/rpc";
const REST_URL = "https://study-swap.onrender.com/api/items";
let allItems = [];

// Функція-помічник для JSON-RPC запитів
async function callRPC(method, params = {}) {
    try {
        const response = await fetch(RPC_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                jsonrpc: "2.0",
                method: method,
                params: params,
                id: Math.floor(Math.random() * 1000)
            })
        });
        const data = await response.json();
        if (data.error) throw new Error(data.error.message);
        return data.result;
    } catch (err) {
        console.error("RPC Request Failed:", err);
        throw err;
    }
}

// Завантаження списку через RPC
async function loadItems() {
    try {
        console.log("Завантаження даних...");
        allItems = await callRPC("getAllItems");
        renderItems(allItems);
        
        // Ініціалізація анімації AOS, якщо вона підключена
        if (window.AOS) {
            AOS.init({ duration: 800, once: true });
        }
    } catch (err) {
        console.error("Помилка завантаження матеріалів:", err);
    }
}

// Видалення матеріалу через RPC
async function deleteItem(id) {
    if (confirm("Видалити цей матеріал?")) {
        try {
            await callRPC("deleteItem", { id: id });
            await loadItems(); // Оновлюємо список після видалення
        } catch (err) {
            alert("Не вдалося видалити: " + err.message);
        }
    }
}

// Завантаження нового матеріалу 
async function uploadItem() {
    const t = document.getElementById('title').value;
    const d = document.getElementById('description').value;
    const i = document.getElementById('image').files[0];
    
    if(!t || !d) return alert("Будь ласка, заповни назву та предмет!");

    const fd = new FormData();
    fd.append('title', t); 
    fd.append('description', d);
    if(i) fd.append('image', i);

    try {
        const res = await fetch(REST_URL, { method: 'POST', body: fd });
        if (res.ok) {
            // Очищення полів після успіху
            document.getElementById('title').value = '';
            document.getElementById('description').value = '';
            document.getElementById('image').value = '';
            await loadItems();
        }
    } catch (err) {
        alert("Помилка при публікації");
    }
}

// Функція малювання карток на сторінці
function renderItems(items) {
    const container = document.getElementById('items-container');
    if (!container) return;
    
    container.innerHTML = '';
    
    if (items.length === 0) {
        container.innerHTML = '<p style="text-align:center; opacity:0.5;">Тут поки порожньо...</p>';
        return;
    }

    items.forEach(item => {
        const card = document.createElement('div');
        card.className = 'item-card';
        card.setAttribute('data-aos', 'fade-up');
        
        const date = item.createdAt ? new Date(item.createdAt).toLocaleDateString('uk-UA') : 'Невідомо';
        
        card.innerHTML = `
            <div class="item-card-header">📌 ${item.description || 'Без предмету'}</div>
            <div class="item-card-body">
                <h3 style="margin:0">${item.title}</h3>
                <small style="opacity:0.6">🗓 ${date}</small>
                ${item.imageUrl ? `<a href="${item.imageUrl}" target="_blank"><img src="${item.imageUrl}" style="width:100%; border-radius:10px; margin-top:10px;"></a>` : ''}
                <div style="display:flex; justify-content: space-between; align-items: center; margin-top:15px;">
                    <button class="item-delete-btn" onclick="deleteItem('${item._id}')">🗑 Видалити</button>
                    <span style="cursor:pointer">🤍 0</span>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}

// Пошук/Фільтрація
function filterItems() {
    const q = document.getElementById('search').value.toLowerCase();
    const filtered = allItems.filter(i => 
        (i.title && i.title.toLowerCase().includes(q)) || 
        (i.description && i.description.toLowerCase().includes(q))
    );
    renderItems(filtered);
}

// Перемикач теми
document.getElementById('theme-toggle')?.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
});

// Запуск при завантаженні
loadItems();