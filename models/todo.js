// models/todo.js
const sqlite3 = require('sqlite3').verbose();
// 使用绝对或相对路径来创建或打开一个现有的SQLite3数据库文件。
const dbPath = './database.sqlite'; // 你可以根据需要调整这个路径
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error("Cannot open database:", err.message);
    } else {
        console.log("Connected to the SQLite database.");
    }
});

db.serialize(() => {
    db.run("CREATE TABLE IF NOT EXISTS todos (id INTEGER PRIMARY KEY AUTOINCREMENT, text TEXT, completed BOOLEAN)");
    console.log("Todos table created or already exists."); // 确认表创建成功
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
    create: (text) => {
        return new Promise((resolve, reject) => {
            db.run("INSERT INTO todos (text, completed) VALUES (?, ?)", [text, false], function(err) {
                if (err) reject(err);
                else resolve({ id: this.lastID, text, completed: false });
            });
        });
    },
    update: (id, completed) => {
        return new Promise((resolve, reject) => {
            db.run("UPDATE todos SET completed = ? WHERE id = ?", [completed, id], function(err) {
                if (err) reject(err);
                else resolve({ id, completed });
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