document.addEventListener('DOMContentLoaded', () => {
  fetch('/api/todos')
    .then(response => response.json())
    .then(todos => {
      todos.forEach(todo => {
        addTodoToList(todo);
      });
    });
});

function addTodo() {
  const todoText = document.getElementById('newTodoText').value;
  const todoDetail = document.getElementById('newTodoDetail').value;

  if (todoText) {
    fetch('/api/todos', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ text: todoText, detail: todoDetail })
    })
      .then(response => response.json())
      .then(todo => {
        addTodoToList(todo);
        document.getElementById('newTodoText').value = '';
        document.getElementById('newTodoDetail').value = '';
      });
  }
}

function addTodoToList(todo) {
  const li = document.createElement('li');
  li.className = 'list-group-item d-flex align-items-center todo-item';
  li.dataset.id = todo.id;

  const textDiv = document.createElement('div');
  textDiv.className = 'flex-grow-1';
  textDiv.textContent = todo.text;

  const span = document.createElement('span');
  span.className = 'badge badge-primary badge-pill mr-2';
  span.textContent = todo.completed ? 'Completed' : 'Pending';
  span.style.cursor = 'pointer';
  span.onclick = function() {
      const currentStatus = this.textContent.toLowerCase() === 'pending';
      toggleTodo(todo.id, currentStatus);
  };

  const deleteButton = document.createElement('button');
  deleteButton.className = 'btn btn-danger btn-sm';
  deleteButton.textContent = 'Delete';
  deleteButton.onclick = () => deleteTodo(todo.id);

  // 添加点击事件监听器以处理详情显示
  li.onclick = () => showTodoDetail(todo);

  li.appendChild(textDiv);
  li.appendChild(span);
  li.appendChild(deleteButton);

  document.getElementById('todoList').appendChild(li);
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
    .then(todo => {
      const li = document.querySelector(`li[data-id="${todo.id}"]`);
      if (li) {
        // 更新列表项和详细信息容器中的状态显示
        updateTodoStatus(li, todo);
        const detailContainer = li.querySelector('.todo-detail');
        if (detailContainer) {
          updateTodoStatus(detailContainer, todo); // 如果有详细信息，则也更新其内的状态
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