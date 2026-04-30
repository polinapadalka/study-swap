const API = "https://study-swap.onrender.com";

async function load() {
    try {
        const res = await fetch(API + "/materials");
        const data = await res.json();
        const board = document.getElementById('kanban-board');
        board.innerHTML = "";

        const groups = {};
        data.forEach(m => {
            if (!groups[m.subject]) groups[m.subject] = [];
            groups[m.subject].push(m);
        });

        for (let subject in groups) {
            const column = document.createElement('div');
            column.className = 'kanban-column';
            let content = `<h3>📌 ${subject}</h3>`;

            groups[subject].forEach(m => {
                const fileButton = m.file 
                    ? `<a href="${m.file}" target="_blank" class="view-link">👁 Переглянути</a>` 
                    : `<span style="color:gray; font-size:0.8em;">Немає файлу</span>`;

                content += `
                    <div class="material-card">
                        <div class="card-header">${subject}</div>
                        <div class="card-body"><h4>${m.title}</h4></div>
                        <div class="card-footer">
                            ${fileButton}
                            <button class="like-btn" onclick="like('${m._id}')">❤️ ${m.likes}</button>
                        </div>
                    </div>`;
            });
            column.innerHTML = content;
            board.appendChild(column);
        }
    } catch (err) { console.error("Помилка завантаження:", err); }
}

async function upload() {
    const title = document.getElementById('title');
    const subject = document.getElementById('subject');
    const fileInput = document.getElementById('file');
    const btn = document.querySelector('button');

    if (!title.value || !subject.value || !fileInput.files[0]) {
        alert("Заповни всі поля та обери файл!");
        return;
    }

    const formData = new FormData();
    formData.append("title", title.value);
    formData.append("subject", subject.value);
    formData.append("file", fileInput.files[0]);

    try {
        btn.disabled = true;
        btn.innerText = "Завантаження...";

        const res = await fetch(API + "/materials", {
            method: "POST",
            body: formData
        });

        if (res.ok) {
            title.value = ""; subject.value = ""; fileInput.value = "";
            await load();
        } else {
            alert("Сервер відхилив запит. Перевір консоль бекенду.");
        }
    } catch (err) {
        console.error("Помилка відправки:", err);
    } finally {
        btn.disabled = false;
        btn.innerText = "Завантажити";
    }
}

async function like(id) {
    await fetch(`${API}/materials/${id}/like`, { method: "POST" });
    load();
}

load();