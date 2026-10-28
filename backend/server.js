const express = require('express');
const cors = require('cors');
const db = require('./database');

const app = express();
app.use(cors());
app.use(express.json());

// --- АУТЕНТИФИКАЦИЯ ---
app.post('/api/register', (req, res) => {
    const { name, email, password } = req.body;
    db.run(`INSERT INTO users (name, email, password) VALUES (?, ?, ?)`, [name, email, password], function (err) {
        if (err) return res.status(400).json({ message: "Email уже занят" });
        res.status(201).json({ id: this.lastID, name, email });
    });
});

app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    db.get(`SELECT * FROM users WHERE email = ? AND password = ?`, [email, password], (err, user) => {
        if (user) res.json({ id: user.id, name: user.name, email: user.email });
        else res.status(401).json({ message: "Неверный email или пароль" });
    });
});

// --- КНИГИ ---
app.get('/api/books', (req, res) => {
    db.all(`SELECT * FROM books`, [], (err, rows) => res.json(rows));
});

app.get('/api/books/:id', (req, res) => {
    db.get(`SELECT * FROM books WHERE id = ?`, [req.params.id], (err, book) => {
        if (err || !book) return res.status(404).json({ message: "Не найдено" });

        db.all(`SELECT * FROM reviews WHERE book_id = ? ORDER BY id DESC`, [req.params.id], (err, reviews) => {
            res.json({ ...book, reviews: reviews || [] });
        });
    });
});

// Маршрут для сохранения отзыва
app.post('/api/books/:id/reviews', (req, res) => {
    const { userId, userName, rating, text } = req.body;
    db.run(`INSERT INTO reviews (book_id, user_id, user_name, rating, text) VALUES (?, ?, ?, ?, ?)`,
        [req.params.id, userId, userName, rating, text], function (err) {
            if (err) {
                console.error("Ошибка БД:", err.message);
                return res.status(500).json({ error: err.message });
            }
            res.status(201).json({ id: this.lastID, user_name: userName, rating, text });
        });
});

// --- ЛИЧНЫЕ ПОЛКИ ---
app.get('/api/user-books/:userId', (req, res) => {
    const sql = `
    SELECT b.*, ub.status, ub.current_page as currentPage 
    FROM books b JOIN user_books ub ON b.id = ub.book_id WHERE ub.user_id = ?
  `;
    db.all(sql, [req.params.userId], (err, rows) => res.json(rows));
});

app.post('/api/user-books', (req, res) => {
    const { userId, bookId, status } = req.body;
    const sql = `
    INSERT INTO user_books (user_id, book_id, status, current_page) 
    VALUES (?, ?, ?, 0) 
    ON CONFLICT(user_id, book_id) DO UPDATE SET status = excluded.status
  `;
    db.run(sql, [userId, bookId, status], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Успешно обновлено" });
    });
});

// Обновить прогресс чтения
app.put('/api/user-books/:userId/:bookId/progress', (req, res) => {
    const { currentPage } = req.body;
    const { userId, bookId } = req.params;

    db.get(`SELECT totalPages FROM books WHERE id = ?`, [bookId], (err, book) => {
        if (err || !book) return res.status(404).json({ message: "Книга не найдена" });

        let newStatus = 'reading';
        if (Number(currentPage) >= book.totalPages) {
            newStatus = 'read';
        }

        db.run(`UPDATE user_books SET current_page = ?, status = ? WHERE user_id = ? AND book_id = ?`,
            [currentPage, newStatus, userId, bookId],
            function (err) {
                if (err) return res.status(500).json({ error: err.message });
                res.json({ message: "Прогресс обновлен", status: newStatus });
            }
        );
    });
});

// Маршрут для удаления книги с полки
app.delete('/api/user-books/:userId/:bookId', (req, res) => {
    db.run(`DELETE FROM user_books WHERE user_id = ? AND book_id = ?`,
        [req.params.userId, req.params.bookId],
        function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: "Книга удалена с полки" });
        }
    );
});

// --- ЛЕНТА (ПОСТЫ) ---
app.get('/api/feed', (req, res) => {
    const userId = req.query.userId || 0;

    const sql = `
    SELECT 
      p.id, p.text, p.created_at, u.name as user, b.title as bookTitle,
      (SELECT COUNT(*) FROM post_reactions WHERE post_id = p.id AND reaction_type = 'like') as likes,
      (SELECT COUNT(*) FROM post_reactions WHERE post_id = p.id AND reaction_type = 'dislike') as dislikes,
      (SELECT reaction_type FROM post_reactions WHERE post_id = p.id AND user_id = ?) as my_reaction
    FROM posts p 
    JOIN users u ON p.user_id = u.id 
    JOIN books b ON p.book_id = b.id 
    ORDER BY p.id DESC
  `;

    db.all(sql, [userId], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.post('/api/feed', (req, res) => {
    const { userId, bookId, text } = req.body;
    db.run(`INSERT INTO posts (user_id, book_id, text) VALUES (?, ?, ?)`, [userId, bookId, text], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ message: "Пост создан" });
    });
});

app.post('/api/feed/:postId/react', (req, res) => {
    const postId = req.params.postId;
    const { userId, reactionType } = req.body;

    db.get(`SELECT * FROM post_reactions WHERE post_id = ? AND user_id = ?`, [postId, userId], (err, row) => {
        if (row) {
            if (row.reaction_type === reactionType) {
                db.run(`DELETE FROM post_reactions WHERE id = ?`, [row.id], () => res.json({ action: 'removed' }));
            } else {
                db.run(`UPDATE post_reactions SET reaction_type = ? WHERE id = ?`, [reactionType, row.id], () => res.json({ action: 'changed' }));
            }
        } else {
            db.run(`INSERT INTO post_reactions (post_id, user_id, reaction_type) VALUES (?, ?, ?)`, [postId, userId, reactionType], () => res.json({ action: 'added' }));
        }
    });
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Сервер запущен на порту ${PORT}`));