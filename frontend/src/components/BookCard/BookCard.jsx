import React from 'react';
import { Link } from 'react-router-dom';
import './BookCard.css';

function BookCard({ book, currentUser, addToShelf }) {

    const handleAdd = (status) => {
        if (!currentUser) {
            alert("Войдите, чтобы добавлять книги!");
            return;
        }
        addToShelf(book.id, status);
    };

    return (
        <div className="book-card">
            <img src={book.cover} alt={book.title} />
            <div className="book-info">
                <h3>{book.title}</h3>
                <p className="author">{book.author}</p>

                <div className="card-actions">
                    <Link to={`/book/${book.id}`} className="btn btn-details">Подробнее</Link>
                    <button onClick={() => handleAdd('reading')} className="btn btn-action">📖 Читаю сейчас</button>
                    <button onClick={() => handleAdd('planned')} className="btn btn-action">📌 В планы</button>
                </div>
            </div>
        </div>
    );
}
export default BookCard;