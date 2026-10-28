import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import './BookDetailPage.css';

function BookDetailPage({ currentUser }) {
    const { id } = useParams();
    const [book, setBook] = useState(null);
    const [reviewText, setReviewText] = useState('');
    const [rating, setRating] = useState(5);

    const fetchBook = () => {
        fetch(`http://localhost:5000/api/books/${id}`)
            .then(res => res.json())
            .then(data => setBook(data));
    };

    useEffect(() => {
        fetchBook();
    }, [id]);

    if (!book) return <p>Загрузка...</p>;

    const reviews = book.reviews || [];

    const avgRating = reviews.length > 0
        ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
        : "Нет";

    const handleSubmit = (e) => {
        e.preventDefault();
        if (reviewText.trim() === '') return;

        if (!currentUser) {
            alert("Пожалуйста, войдите в аккаунт, чтобы оставить отзыв!");
            return;
        }

        fetch(`http://localhost:5000/api/books/${id}/reviews`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: currentUser.id,
                userName: currentUser.name,
                rating,
                text: reviewText
            })
        })
            .then(res => res.json())
            .then(() => {
                setReviewText('');
                setRating(5);
                fetchBook();
            });
    };

    return (
        <div className="book-detail">
            <div className="book-header">
                <img src={book.cover} alt={book.title} />
                <div className="info">
                    <h1>{book.title}</h1>
                    <p className="author">Автор: {book.author}</p>
                    <p><strong>Описание:</strong> {book.description}</p>
                    <p><strong>Средняя оценка:</strong> ⭐ {avgRating} / 5</p>
                </div>
            </div>

            <hr />
            <h3>Рецензии ({reviews.length})</h3>
            <ul className="reviews-list">
                {reviews.map(rev => (
                    <li key={rev.id}>
                        <strong>{rev.user_name}</strong> <span className="stars">{"⭐".repeat(rev.rating)}</span>
                        <p>{rev.text}</p>
                    </li>
                ))}
            </ul>

            <div className="review-form-container">
                <h3>Оставить рецензию</h3>
                <form onSubmit={handleSubmit}>
                    <select value={rating} onChange={(e) => setRating(Number(e.target.value))}>
                        <option value={5}>5 звезд</option>
                        <option value={4}>4 звезды</option>
                        <option value={3}>3 звезды</option>
                        <option value={2}>2 звезды</option>
                        <option value={1}>1 звезда</option>
                    </select>
                    <textarea
                        placeholder="Напишите ваш отзыв..."
                        value={reviewText}
                        onChange={(e) => setReviewText(e.target.value)}
                    />
                    <button type="submit" disabled={reviewText.trim() === ''}>
                        Отправить
                    </button>
                </form>
            </div>
        </div>
    );
}
export default BookDetailPage;