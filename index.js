const express = require('express');
const app = express();
const port = 3000;

app.use(express.static('public'));



;

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});


//创建数据表
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database(':memory:');
db.serialize(() => {
    db.run("CREATE TABLE todos (id INTEGER PRIMARY KEY AUTOINCREMENT, text TEXT, completed BOOLEAN)");
  })

//创建API接口
app.use(express.json());

app.get('/api/todos', (req, res) => {
  db.all("SELECT * FROM todos", (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

app.post('/api/todos', (req, res) => {
  const { text } = req.body;
  db.run("INSERT INTO todos (text, completed) VALUES (?, ?)", [text, false], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ id: this.lastID, text, completed: false });
  });
});

app.put('/api/todos/:id', (req, res) => {
  const { id } = req.params;
  const { completed } = req.body;
  db.run("UPDATE todos SET completed = ? WHERE id = ?", [completed, id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ id, completed });
  });
});

app.delete('/api/todos/:id', (req, res) => {
  const { id } = req.params;
  db.run("DELETE FROM todos WHERE id = ?", [id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ id });
  });
});