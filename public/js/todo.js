// 初始化
document.addEventListener('DOMContentLoaded', () => {
  loadTodos();
  showNewTodo();
  setupTitleListener();
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

// 显示新建todo面板
function showNewTodo() {
  const detailPanel = document.getElementById('todoDetailPanel');
  const detailInput = document.getElementById('todoDetailInput');
  const detailTitle = document.querySelector('.detail-title');
  
  // 重置面板内容
  setTitlePlaceholder(detailTitle, true);
  detailInput.value = '';
  detailPanel.dataset.todoId = '';
  
  // 显示面板
  detailPanel.classList.remove('d-none');
  setTimeout(() => detailPanel.classList.add('show'), 10);
  
  // 设置输入事件监听
  setupDetailInputListener();
}

// 设置标题编辑监听器
function setupTitleListener() {
  const detailTitle = document.querySelector('.detail-title');
  
  detailTitle.addEventListener('focus', (e) => {
    if (e.target.classList.contains('placeholder')) {
      e.target.textContent = '';
      e.target.classList.remove('placeholder');
    }
  });

  detailTitle.addEventListener('blur', (e) => {
    if (!e.target.textContent.trim()) {
      setTitlePlaceholder(e.target, true);
    }
  });
  
  detailTitle.addEventListener('input', debounce((e) => {
    const todoId = document.getElementById('todoDetailPanel').dataset.todoId;
    const newTitle = e.target.textContent.trim();
    
    if (todoId && newTitle && !e.target.classList.contains('placeholder')) {
      // 更新已存在的todo标题
      updateTodoTitle(todoId, newTitle);
    }
  }, 300));

  // 处理回车键
  detailTitle.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      detailTitle.blur();
    }
  });
}

// 设置标题占位符
function setTitlePlaceholder(titleElement, isPlaceholder) {
  if (isPlaceholder) {
    titleElement.textContent = 'Click to add title';
    titleElement.classList.add('placeholder');
  } else {
    titleElement.classList.remove('placeholder');
  }
}

// 显示todo详情
function showTodoDetail(todo) {
  console.log('showTodoDetail called with todo:', todo);
  const detailPanel = document.getElementById('todoDetailPanel');
  const detailInput = document.getElementById('todoDetailInput');
  const detailTitle = document.querySelector('.detail-title');
  
  // 更新详情面板内容
  if (todo && todo.text) {
    detailTitle.textContent = todo.text;
    detailTitle.classList.remove('placeholder');
  } else {
    setTitlePlaceholder(detailTitle, true);
  }
  detailInput.value = todo.detail || '';
  detailPanel.dataset.todoId = todo.id || '';
  
  // 显示面板
  detailPanel.classList.remove('d-none');
  setTimeout(() => detailPanel.classList.add('show'), 10);
  
  // 设置输入事件监听
  setupDetailInputListener();
}

// 设置详情输入监听器
function setupDetailInputListener() {
  const detailInput = document.getElementById('todoDetailInput');
  
  // 移除之前的事件监听器
  detailInput.oninput = null;
  
  // 添加新的事件监听器
  detailInput.oninput = debounce((e) => {
    const todoId = document.getElementById('todoDetailPanel').dataset.todoId;
    const value = e.target.value;
    
    if (todoId) {
      // 更新现有todo的详情
      updateTodoDetail(todoId, value);
    }
  }, 300);
}

// 保存todo
async function saveTodo() {
  const detailPanel = document.getElementById('todoDetailPanel');
  const detailInput = document.getElementById('todoDetailInput');
  const detailTitle = document.querySelector('.detail-title');
  const todoId = detailPanel.dataset.todoId;
  const title = detailTitle.classList.contains('placeholder') ? '' : detailTitle.textContent.trim();
  const content = detailInput.value;
  
  if (!title && !content.trim()) {
    return;
  }
  
  if (todoId) {
    // 更新现有todo
    await updateTodoDetail(todoId, content);
    if (title) {
      await updateTodoTitle(todoId, title);
    }
  } else {
    // 创建新todo
    const todo = {
      text: title || 'Untitled',
      detail: content,
      completed: false
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
        addTodoToList(savedTodo);
        detailPanel.dataset.todoId = savedTodo.id;
        
        // 更新标题显示
        if (!title) {
          detailTitle.textContent = 'Untitled';
          detailTitle.classList.remove('placeholder');
        }
      }
    } catch (error) {
      console.error('Error creating todo:', error);
    }
  }
}

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
  
  // 创建状态切换按钮
  const statusBtn = document.createElement('button');
  statusBtn.className = 'btn btn-sm btn-outline-secondary ml-2';
  statusBtn.textContent = todo.completed ? 'completed' : 'pending';
  statusBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    // 获取当前todo的最新状态
    const currentTodo = JSON.parse(li.dataset.todo);
    // 切换状态
    toggleTodoStatus(todo.id, !currentTodo.completed);
  });
  
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
  li.appendChild(statusBtn);
  li.appendChild(deleteBtn);
  
  document.getElementById('todoList').appendChild(li);
}

// 关闭详情面板
function closeTodoDetail() {
  const detailPanel = document.getElementById('todoDetailPanel');
  const detailTitle = document.querySelector('.detail-title');
  detailPanel.classList.remove('show');
  setTimeout(() => {
    detailPanel.classList.add('d-none');
    detailTitle.textContent = 'New Task';
  }, 300);
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

// 切换Todo状态并更新后端
function toggleTodoStatus(id, newStatus) {
  fetch(`/api/todos/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ completed: newStatus })
  })
  .then(response => {
    if (response.ok) {
      return response.json();
    }
    throw new Error('Failed to update todo status');
  })
  .then(updatedTodo => {
    console.log('Updated todo status:', updatedTodo);
    // 更新DOM中的状态
    const todoItem = document.querySelector(`li[data-id="${id}"]`);
    if (todoItem) {
      const statusBtn = todoItem.querySelector('button.btn-outline-secondary');
      // 更新内存中的todo数据
      todoItem.dataset.todo = JSON.stringify(updatedTodo);
      // 更新按钮文本
      statusBtn.textContent = updatedTodo.completed ? 'completed' : 'pending';
      // 更新复选框状态
      const checkbox = todoItem.querySelector('input[type="checkbox"]');
      if (checkbox) {
        checkbox.checked = updatedTodo.completed;
      }
    }
  })
  .catch(error => {
    console.error('Error toggling todo status:', error);
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

// 更新todo标题
async function updateTodoTitle(id, newTitle) {
  if (!id) return;

  try {
    const response = await fetch(`/api/todos/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text: newTitle })
    });

    if (response.ok) {
      const updatedTodo = await response.json();
      // 更新左侧列表中的标题
      const todoItem = document.querySelector(`li[data-id="${id}"] span`);
      if (todoItem) {
        todoItem.textContent = newTitle;
        // 更新存储在dataset中的todo数据
        const li = todoItem.closest('li');
        const todoData = JSON.parse(li.dataset.todo);
        todoData.text = newTitle;
        li.dataset.todo = JSON.stringify(todoData);
      }
    }
  } catch (error) {
    console.error('Error updating todo title:', error);
  }
}