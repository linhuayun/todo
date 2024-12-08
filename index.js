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