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
    const todoText = document.getElementById('newTodo').value;
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
          document.getElementById('newTodo').value = '';
        });
    }
  }
  
  function addTodoToList(todo) {
    const li = document.createElement('li');
    li.className = 'list-group-item d-flex justify-content-between align-items-center';
    li.textContent = todo.text;
    li.dataset.id = todo.id;
  
    const span = document.createElement('span');
    span.className = 'badge badge-primary badge-pill';
    span.textContent = todo.completed ? 'Completed' : 'Pending';
    span.style.cursor = 'pointer';
    span.onclick = () => toggleTodo(todo.id, !todo.completed);
  
    const deleteButton = document.createElement('button');
    deleteButton.className = 'btn btn-danger btn-sm';
    deleteButton.textContent = 'Delete';
    deleteButton.onclick = () => deleteTodo(todo.id);
  
    li.appendChild(span);
    li.appendChild(deleteButton);
    document.getElementById('todoList').appendChild(li);
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
          li.querySelector('span').textContent = todo.completed ? 'Completed' : 'Pending';
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