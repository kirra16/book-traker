import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './RegisterPage.css';

function RegisterPage({ setCurrentUser }) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');
        fetch('http://localhost:5000/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password })
        })
            .then(res => {
                if (!res.ok) return res.json().then(data => { throw new Error(data.message) });
                return res.json();
            })
            .then(user => {
                localStorage.setItem('user', JSON.stringify(user));
                setCurrentUser(user);
                navigate('/');
            })
            .catch(err => setError(err.message));
    };

    return (
        <div className="auth-container">
            <h1>Регистрация</h1>
            {error && <p className="error-msg">{error}</p>}

            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    placeholder="Ваше имя"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                />
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="Пароль"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <button type="submit">Создать аккаунт</button>
            </form>

            <p>Уже есть аккаунт? <Link to="/login">Войти</Link></p>
        </div>
    );
}
export default RegisterPage;