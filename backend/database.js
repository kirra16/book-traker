const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.sqlite');

const initialBooks = [
    { id: 1, title: "Гарри Поттер и философский камень", author: "Дж. К. Роулинг", cover: "/covers/1.jpg", description: "Первая книга о юном волшебнике.", totalPages: 300 },
    { id: 2, title: "1984", author: "Джордж Оруэлл", cover: "/covers/2.jpg", description: "Культовая антиутопия.", totalPages: 250 },
    { id: 3, title: "Мастер и Маргарита", author: "Михаил Булгаков", cover: "/covers/3.jpg", description: "Мистический роман.", totalPages: 400 },
    { id: 4, title: "Преступление и наказание", author: "Ф. М. Достоевский", cover: "/covers/4.jpg", description: "Психологический роман.", totalPages: 500 },
    { id: 5, title: "Дюна", author: "Фрэнк Герберт", cover: "/covers/5.jpg", description: "Эпическая фантастика.", totalPages: 600 },
    { id: 6, title: "Цветы для Элджернона", author: "Дэниел Киз", cover: "/covers/6.jpg", description: "История о гениальности.", totalPages: 350 },
    { id: 7, title: "Война и мир", author: "Л. Н. Толстой", cover: "/covers/7.jpg", description: "Роман-эпопея.", totalPages: 1300 },
    { id: 8, title: "Три товарища", author: "Э. М. Ремарк", cover: "/covers/8.jpg", description: "История дружбы и любви.", totalPages: 400 },
    { id: 9, title: "Маленький принц", author: "Антуан де Сент-Экзюпери", cover: "/covers/9.jpg", description: "Философская сказка.", totalPages: 100 },
    { id: 10, title: "Шерлок Холмс", author: "Артур Конан Дойл", cover: "/covers/10.jpg", description: "Детективные рассказы.", totalPages: 800 },
    { id: 11, title: "Убить пересмешника", author: "Харпер Ли", cover: "/covers/11.jpg", description: "Роман о расовой несправедливости.", totalPages: 350 },
    { id: 12, title: "Над пропастью во ржи", author: "Дж. Д. Сэлинджер", cover: "/covers/12.jpg", description: "История подростка.", totalPages: 250 },
    { id: 13, title: "Гордость и предубеждение", author: "Джейн Остин", cover: "/covers/13.jpg", description: "Классический роман.", totalPages: 400 },
    { id: 14, title: "Властелин колец", author: "Дж. Р. Р. Толкин", cover: "/covers/14.jpg", description: "Эпическое фэнтези.", totalPages: 900 },
    { id: 15, title: "Автостопом по галактике", author: "Дуглас Адамс", cover: "/covers/15.jpg", description: "Комическая фантастика.", totalPages: 200 },
    { id: 16, title: "Марсианин", author: "Энди Вейер", cover: "/covers/16.jpg", description: "Выживание на Марсе.", totalPages: 350 },
    { id: 17, title: "Игра престолов", author: "Джордж Мартин", cover: "/covers/17.jpg", description: "Фэнтези о борьбе за власть.", totalPages: 800 },
    { id: 18, title: "Сто лет одиночества", author: "Габриэль Гарсиа Маркес", cover: "/covers/18.jpg", description: "Магический реализм.", totalPages: 450 },
    { id: 19, title: "О дивный новый мир", author: "Олдос Хаксли", cover: "/covers/19.jpg", description: "Антиутопия.", totalPages: 300 },
    { id: 20, title: "Зеленая миля", author: "Стивен Кинг", cover: "/covers/20.jpg", description: "Тюремная драма.", totalPages: 400 }
];

db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, email TEXT UNIQUE, password TEXT)`);
    db.run(`CREATE TABLE IF NOT EXISTS books (id INTEGER PRIMARY KEY, title TEXT, author TEXT, cover TEXT, description TEXT, totalPages INTEGER)`);
    db.run(`CREATE TABLE IF NOT EXISTS user_books (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER, book_id INTEGER, status TEXT, current_page INTEGER DEFAULT 0, UNIQUE(user_id, book_id))`);
    db.run(`CREATE TABLE IF NOT EXISTS posts (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER, book_id INTEGER, text TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP)`);
    db.run(`CREATE TABLE IF NOT EXISTS post_reactions (id INTEGER PRIMARY KEY AUTOINCREMENT, post_id INTEGER, user_id INTEGER, reaction_type TEXT, UNIQUE(post_id, user_id))`);

    db.run(`CREATE TABLE IF NOT EXISTS reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT, 
    book_id INTEGER, 
    user_id INTEGER, 
    user_name TEXT, 
    rating INTEGER, 
    text TEXT, 
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

    db.get(`SELECT COUNT(*) as count FROM books`, (err, row) => {
        if (row.count === 0) {
            const stmt = db.prepare(`INSERT INTO books VALUES (?, ?, ?, ?, ?, ?)`);
            initialBooks.forEach(book => {
                stmt.run(book.id, book.title, book.author, book.cover, book.description, book.totalPages);
            });
            stmt.finalize();
            console.log("База данных заполнена 20 книгами!");
        }
    });
});

module.exports = db;