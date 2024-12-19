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
  
  // 从DOM中获取最新的todo数据
  const li = document.querySelector(`li[data-id="${todo.id}"]`);
  if (li) {
    todo = JSON.parse(li.dataset.todo);
  }
  
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
    try {
      // 更新现有todo
      const response = await fetch(`/api/todos/${todoId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: title,
          detail: content
        })
      });

      if (response.ok) {
        const updatedTodo = await response.json();
        // 更新左侧列表项
        const li = document.querySelector(`li[data-id="${todoId}"]`);
        if (li) {
          const titleElement = li.querySelector('.todo-title');
          const detailElement = li.querySelector('.todo-detail-preview');
          if (titleElement) titleElement.textContent = updatedTodo.text;
          if (detailElement) detailElement.textContent = updatedTodo.detail || 'No details';
          
          // 更新存储的todo数据
          li.dataset.todo = JSON.stringify(updatedTodo);
          
          // 更新详情面板的显示
          detailTitle.textContent = updatedTodo.text;
          detailInput.value = updatedTodo.detail || '';
        }
      }
    } catch (error) {
      console.error('Error updating todo:', error);
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
        
        // 更新详情面板显示完整的保存后的数据
        detailInput.value = savedTodo.detail || '';
      }
    } catch (error) {
      console.error('Error creating todo:', error);
    }
  }
}

// 切换todo状态
async function toggleTodoStatus(id, newStatus) {
  try {
    console.log('Toggling status:', { id, newStatus }); // 调试日志
    const response = await fetch(`/api/todos/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ completed: newStatus })
    });

    if (response.ok) {
      const updatedTodo = await response.json();
      console.log('Server response:', updatedTodo); // 调试日志
      
      // 更新列表项的状态
      const li = document.querySelector(`li[data-id="${id}"]`);
      if (li) {
        const checkbox = li.querySelector('.todo-checkbox');
        
        // 更新复选框状态
        if (updatedTodo.completed) {
          li.classList.add('completed');
          checkbox.classList.add('completed');
          checkbox.innerHTML = '<i class="fas fa-check"></i>';
        } else {
          li.classList.remove('completed');
          checkbox.classList.remove('completed');
          checkbox.innerHTML = '';
        }
        
        // 更新存储的todo数据
        li.dataset.todo = JSON.stringify(updatedTodo);
        
        // 如果当前正在显示这个todo的详情，也更新详情面板
        const detailPanel = document.getElementById('todoDetailPanel');
        if (detailPanel.dataset.todoId === id) {
          showTodoDetail(updatedTodo);
        }
      }
    } else {
      console.error('Server returned error:', await response.text()); // 调试日志
    }
  } catch (error) {
    console.error('Error updating todo status:', error);
  }
}

// 更新todo详情
async function updateTodoDetail(id, detail) {
  if (!id) return;
  
  try {
    const response = await fetch(`/api/todos/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ detail })
    });

    if (response.ok) {
      const updatedTodo = await response.json();
      // 更新列表项中的详情预览
      const li = document.querySelector(`li[data-id="${id}"]`);
      if (li) {
        const detailPreview = li.querySelector('.todo-detail-preview');
        if (detailPreview) {
          detailPreview.textContent = detail || 'No details';
        }
        
        // 更新存储的todo数据
        li.dataset.todo = JSON.stringify(updatedTodo);
      }
    }
  } catch (error) {
    console.error('Error updating todo detail:', error);
  }
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
  li.className = `list-group-item todo-item${todo.completed ? ' completed' : ''}`;
  li.dataset.id = todo.id;
  li.dataset.todo = JSON.stringify(todo);
  
  // 创建复选框
  const checkbox = document.createElement('div');
  checkbox.className = `todo-checkbox${todo.completed ? ' completed' : ''}`;
  if (todo.completed) {
    checkbox.innerHTML = '<i class="fas fa-check"></i>';
  }
  
  // 添加点击事件处理器
  checkbox.addEventListener('click', async (e) => {
    e.stopPropagation();
    // 获取当前todo的最新状态
    const currentTodo = JSON.parse(li.dataset.todo);
    await toggleTodoStatus(todo.id, !currentTodo.completed);
  });
  
  // 创建内容容器
  const content = document.createElement('div');
  content.className = 'todo-content';
  
  // 创建标题
  const title = document.createElement('div');
  title.className = 'todo-title';
  title.textContent = todo.text;
  
  // 创建详情预览
  const detailPreview = document.createElement('div');
  detailPreview.className = 'todo-detail-preview';
  detailPreview.textContent = todo.detail || 'No details';
  
  // 组装内容
  content.appendChild(title);
  content.appendChild(detailPreview);
  
  // 添加点击事件，显示详情
  content.addEventListener('click', () => {
    showTodoDetail(todo);
  });
  
  // 组装列表项
  li.appendChild(checkbox);
  li.appendChild(content);
  
  // 添加到列表
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
async function updateTodoStatus(li, todo) {
  const statusSpan = li.querySelector('span.badge-primary');
  if (statusSpan) {
    statusSpan.textContent = todo.completed ? 'Completed' : 'Pending';
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