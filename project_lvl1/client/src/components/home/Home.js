import React, { useEffect, useState } from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import './home.css';
import SongList from "../song/SongList";
import FavouriteList from '../favourites/FavouriteList';
import { useTranslation } from 'react-i18next';

function Home() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [id, setId] = useState('');
    const [username, setUsername] = useState('');
    const [language, setLanguage] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [filterParams, setFilterParams] = useState({ languageFilter: '', searchTerm: '' });
    const navigate = useNavigate();

    const { t, i18n } = useTranslation();

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
    };

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const user = jwtDecode(token);
                setIsLoggedIn(true);
                setUsername(user.username);
                setLanguage(user.languageId);
                setId(user.id);
                setIsAdmin(user.statusId === 1);
            } catch (err) {
                localStorage.removeItem('token');
            }
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        setIsLoggedIn(false);
        navigate('/');
    };

    const handleSearch = (e) => {
        if (e.key === 'Enter') {
            setFilterParams({ languageFilter: language, searchTerm });
        }
    };

    return (
        <div className="home-body">
            <header className="home-header">
                <div className="home-logo">{t('home.appName')}</div>
                <div className="home-search-bar">
                    <input
                        type="text"
                        placeholder={t('home.searchPlaceholder')}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyPress={handleSearch}
                    />
                </div>
                <div className="home-actions">
                    <select
                        className="home-language-select"
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                    >
                        <option value="">{t('home.allLanguages')}</option>
                        <option value="1">{t('home.languageSwitcher.italian')}</option>
                        <option value="2">{t('home.languageSwitcher.ukrainian')}</option>
                        <option value="3">{t('home.languageSwitcher.french')}</option>
                    </select>
                    {isLoggedIn ? (
                        <>
                            <button onClick={() => navigate('/favourites')}>{t('home.favourites')}</button>
                            <button onClick={() => navigate(`/profile/${id}`)}>{t('home.profile')}</button>
                            <button onClick={handleLogout}>{t('auth.logout')}</button>
                        </>
                    ) : (
                        <>
                            <button onClick={() => navigate('/register')}>{t('auth.register')}</button>
                            <button onClick={() => navigate('/login')}>{t('auth.login')}</button>
                        </>
                    )}
                </div>
            </header>

            <div className="language-switcher">
                <button onClick={() => changeLanguage('en')}>EN</button>
                <button onClick={() => changeLanguage('uk')}>UK</button>
                <button onClick={() => changeLanguage('pl')}>PL</button>
            </div>

            <Routes>
                <Route
                    path="/"
                    element={
                        <main className="home-main">
                            <h1>{t('home.welcome', { username: isLoggedIn ? username : t('home.guest') })}</h1>
                            <SongList
                                isAdmin={isAdmin}
                                isLoggedIn={isLoggedIn}
                                userId={id}
                                languageFilter={filterParams.languageFilter}
                                searchTerm={filterParams.searchTerm}
                            />
                        </main>
                    }
                />
                <Route path="/favourites" element={<FavouriteList />} />
            </Routes>

            <footer className="home-footer">
                <p>© 2025 {t('home.appName')}. {t('home.rightsReserved')}</p>
            </footer>
        </div>
    );
}

export default Home;
