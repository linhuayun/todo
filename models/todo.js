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
    update: (id, { text, detail, completed }) => {
        return new Promise((resolve, reject) => {
            db.run("UPDATE todos SET text = ?, detail = ?, completed = ? WHERE id = ?", [text, detail || '', completed, id], function(err) {
                if (err) reject(err);
                else resolve({ id, text, detail: detail || '', completed });
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