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