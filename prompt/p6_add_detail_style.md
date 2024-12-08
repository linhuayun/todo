# 代码工程信息
## 工程源代码结构
```
.
├── index.js
├── models
│   └── todo.js
├── public
│   ├── index.html
│   └── js
│       └── todo.js
└── routes
    └── todoController.js

```

## 各源代码内容

index.js:
```js
// index.js
const express = require('express');
const app = express();
const port = 3000;

app.use(express.static('public'));
app.use(express.json());

// Load the controllers/routes
const todoRoutes = require('./routes/todoController');
app.use('/api/todos', todoRoutes);

// 引入todo模型，以便在关闭服务器时可以访问它来关闭数据库连接
const todoModel = require('./models/todo');

// 处理优雅关闭
process.on('SIGINT', async () => {
  console.log("Received SIGINT. Closing server...");
  try {
    await new Promise(resolve => {
      db.close((err) => {
        if (err) {
          console.error("Error closing database:", err.message);
        } else {
          console.log("Database closed successfully.");
        }
        resolve();
      });
    });
  } catch (error) {
    console.error("Error during cleanup:", error);
  } finally {
    process.exit(0);
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
```

models/todo.js:
```js
// models/todo.js
const sqlite3 = require('sqlite3').verbose();
const dbPath = './database.sqlite';
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error("Cannot open database:", err.message);
    } else {
        console.log("Connected to the SQLite database.");
    }
});

db.serialize(() => {
    db.run(`
      CREATE TABLE IF NOT EXISTS todos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        text TEXT NOT NULL,
        detail TEXT,
        completed BOOLEAN
      )
    `);
    console.log("Todos table created or already exists.");
});

module.exports = {
    getAll: () => {
        return new Promise((resolve, reject) => {
            db.all("SELECT * FROM todos", (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    },
    create: ({ text, detail }) => {
        return new Promise((resolve, reject) => {
            db.run("INSERT INTO todos (text, detail, completed) VALUES (?, ?, ?)", [text, detail || '', false], function(err) {
                if (err) reject(err);
                else resolve({ id: this.lastID, text, detail: detail || '', completed: false });
            });
        });
    },
    
    update: (id, updates) => {
        return new Promise((resolve, reject) => {
          // 构建更新字段和值列表
          const updateFields = [];
          const values = [];
      
          if ('text' in updates && updates.text !== undefined && updates.text !== null) {
            updateFields.push('text = ?');
            values.push(updates.text);
          }
      
          if ('detail' in updates && updates.detail !== undefined && updates.detail !== null) {
            updateFields.push('detail = ?');
            values.push(updates.detail);
          }
      
          if ('completed' in updates) {
            updateFields.push('completed = ?');
            values.push(updates.completed);
          }
      
          if (updateFields.length === 0) {
            return resolve({ id }); // 如果没有提供任何需要更新的字段，则直接返回
          }
      
          // 添加 ID 到值数组的最后
          values.push(id);
      
          console.log('Executing SQL:', `UPDATE todos SET ${updateFields.join(', ')} WHERE id = ?`, 'with values:', values); // 调试信息
      
          db.run(`UPDATE todos SET ${updateFields.join(', ')} WHERE id = ?`, values, function(err) {
            if (err) {
              console.error('Error executing SQL:', err); // 错误日志
              reject(err);
            } else {
              resolve({ id, ...updates });
            }
          });
        });
      },

    delete: (id) => {
        return new Promise((resolve, reject) => {
            db.run("DELETE FROM todos WHERE id = ?", [id], function(err) {
                if (err) reject(err);
                else resolve({ id });
            });
        });
    }
};
```

public/index.html:
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Todo App</title>
  <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css">
  <style>
    @media (min-width: 768px) {
      .todo-item {
        display: flex;
        justify-content: space-between;
      }

      .todo-detail {
        width: 50%;
        margin-left: 20px;
      }
    }
  </style>
</head>
<body>
  <div class="container mt-5">
    <h1 class="text-center">Todo List</h1>
    <div class="input-group mb-3">
      <input type="text" id="newTodoText" class="form-control" placeholder="Add a new todo">
      <textarea id="newTodoDetail" class="form-control" placeholder="Enter detailed information here..." rows="3"></textarea>
      <div class="input-group-append">
        <button class="btn btn-primary" onclick="addTodo()">Add</button>
      </div>
    </div>
    <ul id="todoList" class="list-group"></ul>
  </div>

  <script src="js/todo.js"></script>
</body>
</html>
```

public/js/todo.js:
```js
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

const detailContainer = document.createElement('div');
detailContainer.className = 'todo-detail d-none';
const textarea = document.createElement('textarea');
textarea.className = 'form-control';
textarea.rows = "3";
textarea.value = todo.detail || '';
detailContainer.appendChild(textarea);

const editIcon = document.createElement('span');
editIcon.className = 'badge badge-info mr-2';
editIcon.textContent = 'Details';
editIcon.onclick = () => toggleDetail(li);

const span = document.createElement('span');
span.className = 'badge badge-primary badge-pill';
span.textContent = todo.completed ? 'Completed' : 'Pending';
span.style.cursor = 'pointer';
span.onclick = () => toggleTodo(todo.id, !todo.completed);



const deleteButton = document.createElement('button');
deleteButton.className = 'btn btn-danger btn-sm';
deleteButton.textContent = 'Delete';
deleteButton.onclick = () => deleteTodo(todo.id);

li.appendChild(textDiv);
li.appendChild(editIcon);
li.appendChild(span);
li.appendChild(deleteButton);
li.appendChild(detailContainer); // 将详细信息容器添加到最后

document.getElementById('todoList').appendChild(li);
}

function toggleDetail(item) {
const detail = item.querySelector('.todo-detail');
detail.classList.toggle('d-none');
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
```
routes/todoController.js:
```js
// routes/todoController.js
const express = require('express');
const router = express.Router();
const todoModel = require('../models/todo');

router.get('/', async (req, res) => {
  try {
    const todos = await todoModel.getAll();
    res.json(todos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { text, detail } = req.body;
    const todo = await todoModel.create({ text, detail });
    res.json(todo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { text, detail, completed } = req.body;
    const todo = await todoModel.update(id, { text, detail, completed });
    res.json(todo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const todo = await todoModel.delete(id);
    res.json(todo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
```



# 任务
【Me】
1、请理解这个程序
2、这个程序有个bug请分析：点击pending按钮的时候不能切换到completed，
前端console打印：
todo.js:89 
 PUT http://localhost:3000/api/todos/6 500 (Internal Server Error)
toggleTodo	@	todo.js:89
span.onclick	@	todo.js:58



在我`router.put`中添加了“const todo = await todoModel.update(id, { text, detail, completed });”，点击pending按钮在后台控制台看到：“recv PUT 5 undefined undefined true”，请分析原因或者告诉我进一步定位需要再哪里插入打印语句