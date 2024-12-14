// 初始化
document.addEventListener('DOMContentLoaded', () => {
  loadTodos();
  setupQuickAdd();
});

// 加载所有todos
function loadTodos() {
  fetch('/api/todos')
    .then(response => response.json())
    .then(todos => {
      todos.forEach(todo => {
        addTodoToList(todo);
      });
    });
}

// 设置快速添加功能
function setupQuickAdd() {
  const quickAddInput = document.getElementById('quickAddInput');
  quickAddInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && quickAddInput.value.trim()) {
      const todoText = quickAddInput.value.trim();
      createNewTodo(todoText);
      quickAddInput.value = '';
    }
  });
}

// 创建新的todo
async function createNewTodo(text) {
  const todo = {
    text: text,
    detail: '',
    completed: false,
    createdAt: new Date().toISOString()
  };

  try {
    const response = await fetch('/api/todos', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(todo)
    });

    if (response.ok) {
      const savedTodo = await response.json();
      console.log('Created new todo:', savedTodo);  // 调试日志
      addTodoToList(savedTodo);
    }
  } catch (error) {
    console.error('Error creating todo:', error);
  }
}

// 添加todo到列表
function addTodoToList(todo) {
  const li = document.createElement('li');
  li.className = 'list-group-item todo-item';
  li.dataset.id = todo.id;
  // 存储完整的todo数据
  li.dataset.todo = JSON.stringify(todo);
  
  // 创建左侧容器（复选框和文本）
  const leftContainer = document.createElement('div');
  leftContainer.className = 'd-flex align-items-center flex-grow-1';
  
  // 创建复选框
  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.className = 'mr-3';
  checkbox.checked = todo.completed;
  checkbox.addEventListener('change', () => toggleTodo(todo.id, checkbox.checked));
  
  // 创建文本容器
  const textSpan = document.createElement('span');
  textSpan.className = 'flex-grow-1 ml-2';
  textSpan.textContent = todo.text;
  if (todo.completed) {
    textSpan.style.textDecoration = 'line-through';
    textSpan.style.color = '#6c757d';
  }
  
  // 修改点击事件，使用存储的完整todo数据
  textSpan.addEventListener('click', (e) => {
    e.stopPropagation();
    const todoData = JSON.parse(li.dataset.todo);
    showTodoDetail(todoData);
  });

  // 创建删除按钮
  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'btn btn-sm btn-outline-danger ml-2';
  deleteBtn.innerHTML = '&times;';
  deleteBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this todo?')) {
      deleteTodo(todo.id);
    }
  });
  
  // 组装元素
  leftContainer.appendChild(checkbox);
  leftContainer.appendChild(textSpan);
  li.appendChild(leftContainer);
  li.appendChild(deleteBtn);
  
  document.getElementById('todoList').appendChild(li);
}

// 显示todo详情
function showTodoDetail(todo) {
  console.log('showTodoDetail called with todo:', todo);  // 调试日志
  const detailPanel = document.getElementById('todoDetailPanel');
  const detailInput = document.getElementById('todoDetailInput');
  
  // 更新详情面板内容
  document.querySelector('.detail-title').textContent = todo.text;
  detailInput.value = todo.detail || '';
  console.log('Setting detail input value to:', todo.detail);  // 调试日志
  detailPanel.dataset.todoId = todo.id;
  
  // 显示详情面板
  detailPanel.classList.remove('d-none');
  setTimeout(() => detailPanel.classList.add('show'), 10);
  
  // 防抖函数
  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  // 使用防抖的输入事件处理器
  const debouncedUpdate = debounce((value) => {
    console.log('Debounced update with value:', value);
    updateTodoDetail(todo.id, value);
  }, 300);

  // 设置输入事件监听
  detailInput.oninput = (e) => {
    console.log('Detail input event fired with:', e.target.value);
    debouncedUpdate(e.target.value);
  };
}

// 关闭详情面板
function closeTodoDetail() {
  const detailPanel = document.getElementById('todoDetailPanel');
  detailPanel.classList.remove('show');
  setTimeout(() => detailPanel.classList.add('d-none'), 300);
}

// 实时更新左侧和右侧的todo标题
function updateTodoTitle(id, title) {
  console.log('Updating todo title:', { id, title }); // 打印更新的待办事项ID和标题
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

// 新增：监听详情输入框的变化并保存
const detailTextarea = document.getElementById('newTodoDetail');
if (detailTextarea) {
  detailTextarea.addEventListener('input', (event) => {
    const selectedTodoId = document.querySelector('#todoList .active')?.dataset.id;
    if (selectedTodoId) {
      const selectedTodoId = document.querySelector('#todoList .active')?.dataset.id;
      updateTodoDetail(selectedTodoId, event.target.value);
    }
  });
}

// 更新 Todo 的详情
function updateTodoDetail(id, detail) {
  console.log('Updating todo detail:', { id, detail });
  fetch(`/api/todos/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ detail })
  }).then(response => {
    console.log('Update detail response:', response.status);
    return response.json();
  }).then(updatedTodo => {
    console.log('Updated todo:', updatedTodo);
    // 更新DOM中存储的todo数据
    const todoItem = document.querySelector(`li[data-id="${id}"]`);
    if (todoItem) {
      // 将完整的更新后的todo数据存储在DOM元素中
      todoItem.dataset.todo = JSON.stringify(updatedTodo);
    }
  }).catch(error => {
    console.error('Error updating todo detail:', error);
  });
}

// 切换todo状态
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

// 删除todo
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

// 从详情面板删除todo
function deleteTodoFromDetail() {
  const detailPanel = document.getElementById('todoDetailPanel');
  const todoId = detailPanel.dataset.todoId;
  
  if (todoId && confirm('Are you sure you want to delete this todo?')) {
    deleteTodo(todoId);
    closeTodoDetail();
  }
}

// 更新todo状态
function updateTodoStatus(li, todo) {
  const statusSpan = li.querySelector('span.badge-primary');
  if (statusSpan) {
    statusSpan.textContent = todo.completed ? 'Completed' : 'Pending';
  }
}