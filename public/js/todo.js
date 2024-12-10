document.addEventListener('DOMContentLoaded', () => {
  fetch('/api/todos')
    .then(response => response.json())
    .then(todos => {
      todos.forEach(todo => {
        addTodoToList(todo);
      });
    });
});

function addEmptyTodo() {
  // 创建一条新的空待办事项条目
  const emptyTodo = { text: '', detail: '' };

  // 显示在列表最下方，并设置焦点到新的待办事项
  addTodoToList(emptyTodo);

  // 获取最新添加的li元素并设置焦点到它的文本框
  const lastLi = document.getElementById('todoList').lastElementChild.querySelector('.flex-grow-1');
  if (lastLi) {
    lastLi.focus();
  }
}


function addTodo() {
  const todoText = document.getElementById('newTodoText').value;

  if (todoText) {
    fetch('/api/todos', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ text: todoText })
    })
      .then(response => response.json())
      .then(todo => {
        addTodoToList(todo);
        document.getElementById('newTodoText').value = '';
      });
  }
}

function addTodoToList(todo) {
  const li = document.createElement('li');
  li.className = 'list-group-item d-flex align-items-center todo-item';
  li.dataset.id = todo.id || Math.random().toString(36).substr(2, 9); // 为新创建的todo分配临时ID

  const textDiv = document.createElement('div');
  textDiv.className = 'flex-grow-1 editable';
  textDiv.contentEditable = true;
  textDiv.textContent = todo.text;

  // 监听编辑事件以实现实时保存
  textDiv.addEventListener('input', (event) => {
    updateTodoTitle(event.target.parentElement.dataset.id, event.target.textContent);
  });

  const span = document.createElement('span');
  span.className = 'badge badge-primary badge-pill mr-2';
  span.textContent = todo.completed ? 'Completed' : 'Pending';
  span.style.cursor = 'pointer';
  span.onclick = function() {
    const currentStatus = this.textContent.toLowerCase() === 'pending';
    toggleTodo(li.dataset.id, currentStatus);
  };

  const deleteButton = document.createElement('button');
  deleteButton.className = 'btn btn-danger btn-sm';
  deleteButton.textContent = 'Delete';
  deleteButton.onclick = () => deleteTodo(li.dataset.id);

  // 添加点击事件监听器以处理详情显示
  li.onclick = () => showTodoDetail(todo);

  li.appendChild(textDiv);
  li.appendChild(span);
  li.appendChild(deleteButton);

  document.getElementById('todoList').appendChild(li);

  // 如果是新创建的待办事项，则立即保存
  if (!todo.id) {
    createTodoInServer(todo.text, todo.detail)
      .then(savedTodo => {
        li.dataset.id = savedTodo.id; // 更新真实的ID
      })
      .catch(console.error);
  }
}

// 实时更新左侧和右侧的todo标题
function updateTodoTitle(id, title) {
  fetch(`/api/todos/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: title })
  })
    .then(() => {
      const todoDetail = document.getElementById('todoDetailContainer').querySelector('textarea');
      if (todoDetail && todoDetail.parentElement.parentElement.querySelector(`[data-id="${id}"]`)) {
        todoDetail.parentElement.previousElementSibling.textContent = title;
      }
    })
    .catch(console.error);
}

// 创建新待办事项并在服务器上保存
async function createTodoInServer(text, detail) {
  const response = await fetch('/api/todos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, detail })
  });
  return await response.json();
}

function showTodoDetail(todo) {
  const detailContainer = document.getElementById('todoDetailContainer');
  detailContainer.innerHTML = ''; // 清空之前的详情

  if (!todo) return;

  const textarea = document.createElement('textarea');
  textarea.className = 'form-control';
  textarea.rows = "10";
  textarea.value = todo.detail || '';

  // 监听 input 事件以实现实时保存
  textarea.addEventListener('input', (event) => {
    const updatedDetail = event.target.value;
    updateTodoDetail(todo.id, updatedDetail);
  });

  detailContainer.appendChild(textarea);
}

function updateTodoStatus(li, todo) {
  const statusSpan = li.querySelector('span.badge-primary');
  if (statusSpan) {
    statusSpan.textContent = todo.completed ? 'Completed' : 'Pending';
  }
}

function toggleTodo(id, completed) {
  fetch(`/api/todos/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ completed })
  })
    .then(response => response.json())
    .then(updatedTodo => {
      const li = document.querySelector(`li[data-id="${updatedTodo.id}"]`);
      if (li) {
        // 更新列表项和详细信息容器中的状态显示
        updateTodoStatus(li, updatedTodo);
        // 如果右侧详情区域显示的是当前正在更新的todo，则也更新其内的状态
        const detailContainer = document.getElementById('todoDetailContainer');
        const detailTextarea = detailContainer.querySelector('textarea');
        if (detailTextarea && li.dataset.id == updatedTodo.id) {
          updateTodoStatus(detailContainer, updatedTodo); 
        }
      }
    });
}

function deleteTodo(id) {
  fetch(`/api/todos/${id}`, {
    method: 'DELETE'
  })
    .then(response => response.json())
    .then(todo => {
      const li = document.querySelector(`li[data-id="${todo.id}"]`);
      if (li) {
        li.remove();
      }
    });
}

// 更新 Todo 的详情
function updateTodoDetail(id, detail) {
  fetch(`/api/todos/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ detail })
  });
}