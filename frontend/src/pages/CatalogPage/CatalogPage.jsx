import React, { useState, useEffect } from 'react';
import BookCard from '../../components/BookCard/BookCard';
import './CatalogPage.css';

function CatalogPage({ currentUser }) {
    const [books, setBooks] = useState([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('http://localhost:5000/api/books')
            .then(res => res.json())
            .then(data => {
                setBooks(data);
                setLoading(false);
            });
    }, []);

    const addToShelf = (bookId, status) => {
        fetch('http://localhost:5000/api/user-books', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: currentUser.id, bookId, status })
        }).then(() => alert("Книга добавлена в планы!"));
    };

    const filteredBooks = books.filter(b =>
        b.title.toLowerCase().includes(search.toLowerCase()) ||
        b.author.toLowerCase().includes(search.toLowerCase())
    );

    if (loading) return <p>Загрузка каталога...</p>;

    return (
        <div>
            <h1>Каталог книг</h1>
            <input
                type="text"
                className="search-input"
                placeholder="Поиск по названию или автору..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            />

            <div className="books-grid">
                {filteredBooks.map(book => (
                    <BookCard key={book.id} book={book} currentUser={currentUser} addToShelf={addToShelf} />
                ))}
            </div>
        </div>
    );
}
export default CatalogPage;