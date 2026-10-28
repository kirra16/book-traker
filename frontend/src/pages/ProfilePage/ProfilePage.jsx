import React, { useState, useEffect } from 'react';
import './ProfilePage.css';

function ProfilePage({ currentUser }) {
    const [books, setBooks] = useState([]);

    const fetchMyBooks = () => {
        fetch(`http://localhost:5000/api/user-books/${currentUser.id}`)
            .then(res => res.json())
            .then(data => setBooks(data));
    };

    useEffect(() => {
        fetchMyBooks();
    }, []);

    const updateProgress = (bookId, newPage, maxPages) => {
        let safePage = Number(newPage);
        if (safePage > maxPages) safePage = maxPages;
        if (safePage < 0) safePage = 0;

        fetch(`http://localhost:5000/api/user-books/${currentUser.id}/${bookId}/progress`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ currentPage: safePage })
        }).then(() => {
            fetchMyBooks();
        });
    };

    const removeFromShelf = (bookId) => {
        if (window.confirm("Удалить книгу с полки?")) {
            fetch(`http://localhost:5000/api/user-books/${currentUser.id}/${bookId}`, {
                method: 'DELETE'
            }).then(() => {
                setBooks(books.filter(b => b.id !== bookId));
            });
        }
    };

    const renderShelf = (title, status, showTracker = false) => {
        const filtered = books.filter(b => b.status === status);
        return (
            <div className="shelf">
                <h3>{title}</h3>
                {filtered.length === 0 ? <p>Пока пусто</p> : (
                    <ul>
                        {filtered.map(book => (
                            <li key={book.id}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <strong>{book.title}</strong>
                                    <button
                                        onClick={() => removeFromShelf(book.id)}
                                        style={{ background: 'transparent', color: '#e74c3c', border: 'none', cursor: 'pointer', fontSize: '18px' }}
                                        title="Удалить с полки"
                                    >
                                        ✕
                                    </button>
                                </div>

                                {showTracker && (
                                    <div className="tracker">
                                        <p>{book.currentPage} из {book.totalPages} стр.</p>
                                        <div className="progress-bar-bg">
                                            <div className="progress-bar-fill" style={{ width: `${(book.currentPage / (book.totalPages || 1)) * 100}%` }}></div>
                                        </div>
                                        <input
                                            type="number"
                                            value={book.currentPage}
                                            onChange={(e) => updateProgress(book.id, e.target.value, book.totalPages)}
                                            min="0"
                                            max={book.totalPages}
                                        />
                                    </div>
                                )}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        );
    };

    return (
        <div>
            <h1>Личный кабинет</h1>
            <div className="shelves-container">
                {renderShelf("📖 Читаю сейчас", "reading", true)}
                {renderShelf("✅ Прочитано", "read")}
                {renderShelf("📌 В планах", "planned")}
            </div>
        </div>
    );
}
export default ProfilePage;