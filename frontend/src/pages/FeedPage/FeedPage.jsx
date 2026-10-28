import React, { useState, useEffect } from 'react';
import './FeedPage.css';

function FeedPage({ currentUser }) {
    const [feed, setFeed] = useState([]);
    const [books, setBooks] = useState([]);
    const [selectedBook, setSelectedBook] = useState('');
    const [thought, setThought] = useState('');

    const fetchFeed = () => {
        fetch(`http://localhost:5000/api/feed?userId=${currentUser.id}`)
            .then(res => res.json())
            .then(data => setFeed(data));
    };

    useEffect(() => {
        fetchFeed();
        fetch('http://localhost:5000/api/books')
            .then(res => res.json())
            .then(data => {
                setBooks(data);
                if (data.length > 0) setSelectedBook(data[0].id);
            });
    }, []);

    const handlePost = (e) => {
        e.preventDefault();
        if (!thought.trim() || !selectedBook) return;

        fetch('http://localhost:5000/api/feed', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: currentUser.id, bookId: Number(selectedBook), text: thought })
        }).then(() => {
            setThought('');
            fetchFeed();
        });
    };

    const handleReaction = (postId, type) => {
        fetch(`http://localhost:5000/api/feed/${postId}/react`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: currentUser.id, reactionType: type })
        }).then(() => fetchFeed()); // Обновляем ленту после клика
    };

    return (
        <div>
            <h1>Лента активности</h1>

            <div className="subscription-box">
                <h3>Поделиться мыслями о книге</h3>
                <form onSubmit={handlePost} style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
                    <select value={selectedBook} onChange={(e) => setSelectedBook(e.target.value)} style={{ padding: '10px' }}>
                        {books.map(b => <option key={b.id} value={b.id}>{b.title}</option>)}
                    </select>
                    <textarea
                        placeholder="Что вы думаете об этой книге?"
                        value={thought}
                        onChange={(e) => setThought(e.target.value)}
                        style={{ padding: '10px', minHeight: '80px', borderRadius: '8px', border: '1px solid #cbd5e0' }}
                    />

                    <button type="submit" disabled={!thought.trim()} className="publish-btn">
                        Опубликовать
                    </button>
                </form>
            </div>

            <ul className="feed-list" style={{ marginTop: '20px', listStyle: 'none', padding: 0 }}>
                {feed.map(item => (
                    <li key={item.id} style={{ background: '#f9f9f9', padding: '15px', marginBottom: '10px', borderRadius: '8px', borderLeft: '4px solid #3498db' }}>
                        <strong>{item.user}</strong> делится мыслями о книге <em>«{item.bookTitle}»</em>:
                        <p style={{ marginTop: '10px', fontStyle: 'italic' }}>"{item.text}"</p>

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '15px' }}>

                            <div style={{ display: 'flex', gap: '15px' }}>
                                <button
                                    onClick={() => handleReaction(item.id, 'like')}
                                    style={{
                                        background: item.my_reaction === 'like' ? '#e8f4fd' : 'transparent',
                                        border: '1px solid #ccc', padding: '5px 10px', borderRadius: '20px', cursor: 'pointer',
                                        color: item.my_reaction === 'like' ? '#3498db' : '#333',
                                        fontWeight: item.my_reaction === 'like' ? 'bold' : 'normal'
                                    }}
                                >
                                    + {item.likes}
                                </button>

                                <button
                                    onClick={() => handleReaction(item.id, 'dislike')}
                                    style={{
                                        background: item.my_reaction === 'dislike' ? '#fdedec' : 'transparent',
                                        border: '1px solid #ccc', padding: '5px 10px', borderRadius: '20px', cursor: 'pointer',
                                        color: item.my_reaction === 'dislike' ? '#e74c3c' : '#333',
                                        fontWeight: item.my_reaction === 'dislike' ? 'bold' : 'normal'
                                    }}
                                >
                                    - {item.dislikes}
                                </button>
                            </div>

                            <small style={{ color: '#888' }}>
                                {new Date(item.created_at).toLocaleDateString('ru-RU')}
                            </small>
                        </div>

                    </li>
                ))}
            </ul>
        </div>
    );
}

export default FeedPage;