import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import CatalogPage from './pages/CatalogPage/CatalogPage';
import BookDetailPage from './pages/BookDetailPage/BookDetailPage';
import ProfilePage from './pages/ProfilePage/ProfilePage';
import FeedPage from './pages/FeedPage/FeedPage';
import LoginPage from './pages/LoginPage/LoginPage';
import RegisterPage from './pages/RegisterPage/RegisterPage';
import './App.css';

function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });

  const handleLogout = () => {
    localStorage.removeItem('user');
    setCurrentUser(null);
  };

  return (
    <Router>
      <div className="app-container">
        <nav className="navbar">
          <h2>Трекер для книголюбов</h2>
          <div className="nav-links">
            {currentUser ? (
              <>
                <Link to="/">Каталог</Link>
                <Link to="/profile">Профиль ({currentUser.name})</Link>
                <Link to="/feed">Лента</Link>
                <button onClick={handleLogout} className="logout-btn">Выйти</button>
              </>
            ) : (
              <>
                <Link to="/login">Вход</Link>
                <Link to="/register">Регистрация</Link>
              </>
            )}
          </div>
        </nav>

        <main className="content">
          <Routes>
            <Route
              path="/"
              element={currentUser ? <CatalogPage currentUser={currentUser} /> : <Navigate to="/login" />}
            />
            <Route
              path="/book/:id"
              element={currentUser ? <BookDetailPage currentUser={currentUser} /> : <Navigate to="/login" />}
            />
            <Route
              path="/profile"
              element={currentUser ? <ProfilePage currentUser={currentUser} /> : <Navigate to="/login" />}
            />
            <Route
              path="/feed"
              element={currentUser ? <FeedPage currentUser={currentUser} /> : <Navigate to="/login" />}
            />

            <Route
              path="/login"
              element={!currentUser ? <LoginPage setCurrentUser={setCurrentUser} /> : <Navigate to="/" />}
            />
            <Route
              path="/register"
              element={!currentUser ? <RegisterPage setCurrentUser={setCurrentUser} /> : <Navigate to="/" />}
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;