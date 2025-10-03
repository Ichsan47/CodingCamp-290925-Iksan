let todos = [];
let currentFilter = '';

// Custom Modal Functions
function showAlert(message, title = "Alert") {
    return new Promise((resolve) => {
        const modal = document.getElementById('alertModal');
        const titleEl = document.getElementById('alertTitle');
        const messageEl = document.getElementById('alertMessage');
        const okBtn = document.getElementById('alertOk');
        
        titleEl.textContent = title;
        messageEl.textContent = message;
        modal.style.display = 'block';
        
        const handleOk = () => {
            modal.style.display = 'none';
            okBtn.removeEventListener('click', handleOk);
            resolve();
        };
        
        okBtn.addEventListener('click', handleOk);
        
        // Close on overlay click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                handleOk();
            }
        });
    });
}

function showConfirm(message, title = "Confirm") {
    return new Promise((resolve) => {
        const modal = document.getElementById('confirmModal');
        const titleEl = document.getElementById('confirmTitle');
        const messageEl = document.getElementById('confirmMessage');
        const okBtn = document.getElementById('confirmOk');
        const cancelBtn = document.getElementById('confirmCancel');
        
        titleEl.textContent = title;
        messageEl.textContent = message;
        modal.style.display = 'block';
        
        const handleResult = (result) => {
            modal.style.display = 'none';
            okBtn.removeEventListener('click', handleOk);
            cancelBtn.removeEventListener('click', handleCancel);
            resolve(result);
        };
        
        const handleOk = () => handleResult(true);
        const handleCancel = () => handleResult(false);
        
        okBtn.addEventListener('click', handleOk);
        cancelBtn.addEventListener('click', handleCancel);
        
        // Close on overlay click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                handleCancel();
            }
        });
    });
}

function showPrompt(message, title = "Input", defaultValue = "") {
    return new Promise((resolve) => {
        const modal = document.getElementById('promptModal');
        const titleEl = document.getElementById('promptTitle');
        const messageEl = document.getElementById('promptMessage');
        const inputEl = document.getElementById('promptInput');
        const okBtn = document.getElementById('promptOk');
        const cancelBtn = document.getElementById('promptCancel');
        
        titleEl.textContent = title;
        messageEl.textContent = message;
        inputEl.value = defaultValue;
        modal.style.display = 'block';
        inputEl.focus();
        
        const handleResult = (result) => {
            modal.style.display = 'none';
            okBtn.removeEventListener('click', handleOk);
            cancelBtn.removeEventListener('click', handleCancel);
            inputEl.removeEventListener('keypress', handleEnter);
            resolve(result);
        };
        
        const handleOk = () => handleResult(inputEl.value);
        const handleCancel = () => handleResult(null);
        const handleEnter = (e) => {
            if (e.key === 'Enter') handleOk();
        };
        
        okBtn.addEventListener('click', handleOk);
        cancelBtn.addEventListener('click', handleCancel);
        inputEl.addEventListener('keypress', handleEnter);
        
        // Close on overlay click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                handleCancel();
            }
        });
    });
}

// Todo Functions
async function addTodo() {
    const taskText = document.getElementById('taskInput').value.trim();
    const dueDate = document.getElementById('dateInput').value;

    if (taskText === '') {
        await showAlert('Masukkan tugas terlebih dahulu!', 'Input Required');
        return;
    }

    const newTodo = {
        id: Date.now(),
        text: taskText,
        date: dueDate,
        status: 'pending'
    };

    todos.push(newTodo);
    
    // Clear inputs
    document.getElementById('taskInput').value = '';
    document.getElementById('dateInput').value = '';
    
    renderTodos();
}

async function deleteTodo(id) {
    const confirmed = await showConfirm('Yakin ingin menghapus tugas ini?', 'Delete Task');
    if (confirmed) {
        todos = todos.filter(todo => todo.id !== id);
        renderTodos();
    }
}

function toggleStatus(id) {
    const todo = todos.find(todo => todo.id === id);
    if (todo) {
        todo.status = todo.status === 'pending' ? 'done' : 'pending';
        renderTodos();
    }
}

async function deleteAllTodos() {
    if (todos.length === 0) {
        await showAlert('Tidak ada tugas untuk dihapus!', 'No Tasks');
        return;
    }
    
    const confirmed = await showConfirm('Yakin ingin menghapus semua tugas?', 'Delete All Tasks');
    if (confirmed) {
        todos = [];
        currentFilter = '';
        renderTodos();
    }
}

async function filterTodos() {
    const filterText = await showPrompt('Masukkan kata kunci untuk filter:', 'Filter Tasks', currentFilter);
    
    if (filterText === null) return;
    
    currentFilter = filterText.toLowerCase();
    renderTodos();
}

function renderTodos() {
    const todoList = document.getElementById('todoList');
    todoList.innerHTML = '';
    
    let todosToShow = todos;
    
    // Apply filter if exists
    if (currentFilter) {
        todosToShow = todos.filter(todo => 
            todo.text.toLowerCase().includes(currentFilter) ||
            (todo.date && todo.date.includes(currentFilter))
        );
    }
    
    if (todosToShow.length === 0) {
        todoList.innerHTML = '<tr><td colspan="4" class="no-task">No task found</td></tr>';
        return;
    }

    todosToShow.forEach(todo => {
        const statusClass = todo.status === 'done' ? 'status-done' : 'status-pending';
        const statusText = todo.status === 'done' ? 'Done' : 'Pending';
        const toggleButtonText = todo.status === 'done' ? 'Pending' : 'Done';
        
        const row = `
            <tr>
                <td>${todo.text}</td>
                <td>${todo.date || '-'}</td>
                <td><span class="${statusClass}">${statusText}</span></td>
                <td>
                    <button class="action-btn" onclick="toggleStatus(${todo.id})">${toggleButtonText}</button>
                    <button class="action-btn delete" onclick="deleteTodo(${todo.id})">Delete</button>
                </td>
            </tr>
        `;
        
        todoList.innerHTML += row;
    });
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('addBtn').addEventListener('click', addTodo);
    document.getElementById('filterBtn').addEventListener('click', filterTodos);
    document.getElementById('deleteAllBtn').addEventListener('click', deleteAllTodos);
    
    document.getElementById('taskInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') addTodo();
    });
    
    document.getElementById('dateInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') addTodo();
    });
    
    renderTodos();
});
