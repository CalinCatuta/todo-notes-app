const { invoke } = window.__TAURI__.core;

let appData = { categories: [] };
let viewState = { mode: 'categories', currentCategoryId: null, currentTodoId: null };
let modalState = { type: null, id: null };

// --- Fetch & Save Data (Tauri Native) ---
async function loadData() {
    try {
        const responseString = await invoke('load_data');
        appData = JSON.parse(responseString);
        
        renderSidebar();
        if (viewState.currentTodoId) renderMain();
    } catch (error) {
        console.error("Eroare la citirea datelor din fișier:", error);
    }
}

async function saveData() {
    // Optimistic UI update
    renderSidebar();
    if (viewState.mode === 'todos' && viewState.currentTodoId) {
        renderMain();
    }

    try {
        await invoke('save_data', { payload: JSON.stringify(appData) });
    } catch (error) {
        console.error("Eroare la salvarea datelor:", error);
        alert("Eroare critică: Datele nu s-au putut salva pe disc!");
    }
}

// --- Helpers ---
const generateId = () => '_' + Math.random().toString(36).substr(2, 9);
const getCategory = (id) => appData.categories.find(c => c.id === id);
const getTodo = (catId, todoId) => getCategory(catId)?.todos.find(t => t.id === todoId);

// --- Funcție Auto-Resize pentru Textarea ---
function autoResize(el) {
    el.style.height = 'auto';
    el.style.height = el.scrollHeight + 'px';
}

// --- Funcție pentru Highlighting Text ---
function formatHighlighting(text) {
    if (!text) return '';
    let formatted = text.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    
    formatted = formatted.replace(/`([^`]+)`/g, '<span class="hl-blue">$1</span>');
    formatted = formatted.replace(/~([^~]+)~/g, '<span class="hl-red">$1</span>');
    formatted = formatted.replace(/@([^@]+)@/g, '<span class="hl-green">$1</span>');
    formatted = formatted.replace(/\^([^\^]+)\^/g, '<span class="hl-yellow">$1</span>');
    
    return formatted;
}

const cardDescInput = document.getElementById('cardDescInput');
if (cardDescInput) {
    cardDescInput.addEventListener('input', function() {
        autoResize(this);
    });
}

// --- DOM Elements ---
const sidebarTitle = document.getElementById('sidebarTitle');
const sidebarInput = document.getElementById('sidebarInput');
const sidebarList = document.getElementById('sidebarList');
const btnBack = document.getElementById('btnBack');
const sidebarAddBtn = document.getElementById('sidebarAddBtn');

const emptyState = document.getElementById('emptyState');
const todoContent = document.getElementById('todoContent');
const todoTitle = document.getElementById('todoTitle');
const todoCheck = document.getElementById('todoCheck');
const todoHeaderLeft = document.querySelector('.todo-header-left');

// --- Renders ---
function renderSidebar() {
    sidebarList.innerHTML = '';
    
    if (viewState.mode === 'categories') {
        sidebarTitle.innerText = 'Categories';
        sidebarInput.placeholder = 'Category name...';
        btnBack.classList.add('hidden');
        
        appData.categories.forEach(cat => {
            const li = document.createElement('li');
            li.className = `list-item ${viewState.currentCategoryId === cat.id ? 'active' : ''}`;
            li.innerHTML = `
                <span>${cat.name}</span>
                <div>
                    <button class="icon-btn" onclick="openModal('category', '${cat.id}')"><i class="ph ph-pencil-simple"></i></button>
                    <button class="icon-btn text-danger" onclick="deleteItem('category', '${cat.id}')"><i class="ph ph-trash"></i></button>
                </div>
            `;
            li.onclick = (e) => {
                if(e.target.closest('button')) return;
                viewState.mode = 'todos';
                viewState.currentCategoryId = cat.id;
                viewState.currentTodoId = null;
                renderSidebar();
                renderMain();
            };
            sidebarList.appendChild(li);
        });
    } else {
        const category = getCategory(viewState.currentCategoryId);
        sidebarTitle.innerText = 'Todos';
        sidebarInput.placeholder = 'Todo name...';
        btnBack.classList.remove('hidden');
        
        if(category && category.todos) {
            category.todos.forEach(todo => {
                const li = document.createElement('li');
                li.className = `list-item ${todo.completed ? 'completed' : ''} ${viewState.currentTodoId === todo.id ? 'active' : ''}`;
                li.innerHTML = `<span>${todo.name}</span>`;
                li.onclick = () => {
                    viewState.currentTodoId = todo.id;
                    renderSidebar();
                    renderMain();
                };
                sidebarList.appendChild(li);
            });
        }
    }
}

function renderMain() {
    if (viewState.mode === 'categories' || !viewState.currentTodoId) {
        emptyState.classList.remove('hidden');
        todoContent.classList.add('hidden');
        return;
    }

    emptyState.classList.add('hidden');
    todoContent.classList.remove('hidden');

    const todo = getTodo(viewState.currentCategoryId, viewState.currentTodoId);
    if(!todo) return;

    todoTitle.innerText = todo.name;
    todoCheck.checked = todo.completed;
    
    if (todo.completed) todoHeaderLeft.classList.add('completed');
    else todoHeaderLeft.classList.remove('completed');

    const cardsList = document.getElementById('cardsList');
    cardsList.innerHTML = '';

    todo.cards.forEach(card => {
        const div = document.createElement('div');
        div.className = 'todo-card';
        div.innerHTML = `
            <div class="todo-card-header">
                <span class="todo-card-title">${card.title}</span>
                <div>
                    <button class="icon-btn" onclick="openModal('card', '${card.id}')"><i class="ph ph-pencil-simple"></i></button>
                    <button class="icon-btn text-danger" onclick="deleteItem('card', '${card.id}')"><i class="ph ph-trash"></i></button>
                </div>
            </div>
            <p class="todo-card-desc">${formatHighlighting(card.description)}</p>
        `;
        cardsList.appendChild(div);
    });
}

// --- Actions ---
sidebarAddBtn.onclick = (e) => {
    e.preventDefault();
    const val = sidebarInput.value.trim();
    if (!val) return;

    if (viewState.mode === 'categories') {
        appData.categories.push({ id: generateId(), name: val, todos: [] });
    } else {
        const category = getCategory(viewState.currentCategoryId);
        category.todos.push({ id: generateId(), name: val, completed: false, cards: [] });
    }
    sidebarInput.value = '';
    saveData();
};

btnBack.onclick = (e) => {
    e.preventDefault();
    viewState.mode = 'categories';
    viewState.currentCategoryId = null;
    viewState.currentTodoId = null;
    renderSidebar();
    renderMain();
};

todoCheck.onchange = (e) => {
    const todo = getTodo(viewState.currentCategoryId, viewState.currentTodoId);
    todo.completed = e.target.checked;
    saveData();
};

document.getElementById('todoDeleteBtn').onclick = (e) => {
    e.preventDefault();
    window.deleteItem('todo', viewState.currentTodoId);
};

document.getElementById('todoEditBtn').onclick = (e) => {
    e.preventDefault();
    openModal('todo', viewState.currentTodoId);
};

document.getElementById('addCardBtn').onclick = (e) => {
    e.preventDefault();
    const title = document.getElementById('cardTitleInput').value.trim();
    const desc = document.getElementById('cardDescInput').value.trim();
    if (!title) return;

    const todo = getTodo(viewState.currentCategoryId, viewState.currentTodoId);
    todo.cards.push({ id: generateId(), title, description: desc });
    
    document.getElementById('cardTitleInput').value = '';
    document.getElementById('cardDescInput').value = '';
    document.getElementById('cardDescInput').style.height = 'auto';
    saveData();
};

// --- Modal Ștergere Logică ---
const deleteModal = document.getElementById('deleteModal');
let itemToDelete = { type: null, id: null };

window.deleteItem = (type, id) => {
    itemToDelete = { type, id };
    deleteModal.classList.remove('hidden');
};

document.getElementById('deleteCancelBtn').onclick = (e) => {
    e.preventDefault();
    deleteModal.classList.add('hidden');
    itemToDelete = { type: null, id: null };
};

document.getElementById('deleteConfirmBtn').onclick = (e) => {
    e.preventDefault();
    const { type, id } = itemToDelete;

    if (type === 'category') {
        appData.categories = appData.categories.filter(c => c.id !== id);
        if (viewState.currentCategoryId === id) {
            viewState.currentCategoryId = null;
            viewState.currentTodoId = null;
        }
    } else if (type === 'todo') {
        const category = getCategory(viewState.currentCategoryId);
        category.todos = category.todos.filter(t => t.id !== id);
        if (viewState.currentTodoId === id) {
            viewState.currentTodoId = null;
        }
    } else if (type === 'card') {
        const todo = getTodo(viewState.currentCategoryId, viewState.currentTodoId);
        todo.cards = todo.cards.filter(c => c.id !== id);
    }

    deleteModal.classList.add('hidden');
    saveData();
};

// --- Modal Editare Logică ---
const modal = document.getElementById('editModal');
const mInput1 = document.getElementById('modalInput1');
const mInput2 = document.getElementById('modalInput2');

window.openModal = (type, id) => {
    modalState = { type, id };
    modal.classList.remove('hidden');
    mInput2.classList.add('hidden');

    if (type === 'category') {
        mInput1.value = getCategory(id).name;
    } else if (type === 'todo') {
        mInput1.value = getTodo(viewState.currentCategoryId, id).name;
    } else if (type === 'card') {
        const card = getTodo(viewState.currentCategoryId, viewState.currentTodoId).cards.find(c => c.id === id);
        mInput1.value = card.title;
        mInput2.value = card.description;
        mInput2.classList.remove('hidden');
    }
};

document.getElementById('modalCancelBtn').onclick = (e) => {
    e.preventDefault();
    modal.classList.add('hidden');
};

document.getElementById('modalSaveBtn').onclick = (e) => {
    e.preventDefault();
    const val1 = mInput1.value.trim();
    const val2 = mInput2.value.trim();
    if (!val1) return;

    if (modalState.type === 'category') {
        getCategory(modalState.id).name = val1;
    } else if (modalState.type === 'todo') {
        getTodo(viewState.currentCategoryId, modalState.id).name = val1;
    } else if (modalState.type === 'card') {
        const card = getTodo(viewState.currentCategoryId, viewState.currentTodoId).cards.find(c => c.id === modalState.id);
        card.title = val1;
        card.description = val2;
    }
    
    modal.classList.add('hidden');
    saveData();
};

// Start App
loadData();