import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import FavouritesForm from "../favourites/FavouriteForm";
import { useTranslation } from 'react-i18next';

function SongList({ isAdmin, isLoggedIn, userId, languageFilter, searchTerm }) {
    const [songs, setSongs] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [songsPerPage] = useState(12);
    const [showFavouritesForm, setShowFavouritesForm] = useState(false);
    const [currentSong, setCurrentSong] = useState(null);
    const navigate = useNavigate();
    const { t } = useTranslation();

    useEffect(() => {
        const fetchSongs = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get('/api/songs', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    params: {
                        language: languageFilter,
                        search: searchTerm,
                    },
                });
                setSongs(response.data);
            } catch (error) {
                console.error(t('messages.errorOccurred'), error);
            }
        };

        fetchSongs();
    }, [languageFilter, searchTerm]);

    const extractYouTubeThumbnail = (url) => {
        if (!url) return t('song.noThumbnail');
        try {
            const videoId = url.includes('v=') ? url.split('v=')[1]?.split('&')[0] : url.split('/').pop();
            return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
        } catch (error) {
            console.error(t('messages.errorOccurred'), error);
            return t('song.invalidUrl');
        }
    };

    const handleAdminAction = (action, songId) => {
        if (action === 'delete') {
            const token = localStorage.getItem('token');
            axios
                .delete(`/api/songs/${songId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                })
                .then(() => {
                    alert(t('messages.songDeleted'));
                    setSongs(songs.filter((song) => song.id !== songId));
                })
                .catch((err) => {
                    console.error(t('messages.errorOccurred'), err);
                    alert(t('messages.errorOccurred'));
                });
        } else if (action === 'edit') {
            navigate(`/admin/songs/${songId}`);
        } else if (action === 'add') {
            navigate(`/admin/songs/new`);
        }
    };

    const handleToggleFavourite = async (song) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.put(`/api/favourites/${song.id}`, {}, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const updatedSongs = songs.map((s) =>
                s.id === song.id ? { ...s, isFavourite: response.data.isFavourite } : s
            );
            setSongs(updatedSongs);
        } catch (error) {
            console.error(t('messages.errorOccurred'), error);
            alert(t('messages.errorOccurred'));
        }
    };

    const handleFavouriteClick = (song) => {
        if (song.isFavourite) {
            handleToggleFavourite(song);
        } else {
            setCurrentSong(song);
            setShowFavouritesForm(true);
        }
    };

    const handleFavouriteSubmit = async (rating) => {
        try {
            await axios.post(
                '/api/favourites',
                { songId: currentSong.id, userId, rating },
                { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
            );

            alert(t('messages.songAdded'));
            setShowFavouritesForm(false);

            const updatedSongs = songs.map((song) =>
                song.id === currentSong.id ? { ...song, isFavourite: true } : song
            );
            setSongs(updatedSongs);
        } catch (error) {
            console.error(t('messages.errorOccurred'), error);
            alert(t('messages.errorOccurred'));
        }
    };

    const handleCardClick = (songId) => {
        navigate(`/songs/${songId}`);
    };

    const indexOfLastSong = currentPage * songsPerPage;
    const indexOfFirstSong = indexOfLastSong - songsPerPage;
    const currentSongs = songs.slice(indexOfFirstSong, indexOfLastSong);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    return (
        <div className="songs-list">
            {isAdmin && (
                <div className="admin-toolbar">
                    <button onClick={() => handleAdminAction('add')} className="admin-add-btn">
                        {t('song.addSong')}
                    </button>
                </div>
            )}
            <div className="songs-grid">
                {currentSongs.map((song) => (
                    <div
                        className="song-card"
                        key={song.id}
                        onClick={() => handleCardClick(song.id)}
                        style={{ cursor: 'pointer' }}
                    >
                        <img
                            className="song-thumbnail"
                            src={extractYouTubeThumbnail(song.videoUrl)}
                            alt={`${song.title} ${t('song.thumbnail')}`}
                        />
                        <h3>{song.title}</h3>
                        <p>{song.artist}</p>
                        {isLoggedIn && (
                            <button
                                className={`heart-button ${song.isFavourite ? "active" : ""}`}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleFavouriteClick(song);
                                }}
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill={song.isFavourite ? "#ff00ff" : "none"}
                                    stroke={song.isFavourite ? "#ff00ff" : "#000"}
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="heart-icon"
                                >
                                    <path d="M12 21C12 21 4 13.5 4 8.5C4 5.42 6.42 3 9.5 3C11.24 3 12.91 4.1 13.5 5.78C14.09 4.1 15.76 3 17.5 3C20.58 3 23 5.42 23 8.5C23 13.5 15 21 15 21H12Z"/>
                                </svg>
                            </button>
                        )}
                        {isAdmin && (
                            <div className="admin-actions">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleAdminAction('edit', song.id)
                                    }}
                                    className="admin-edit-btn"
                                >
                                    {t('general.edit')}
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleAdminAction('delete', song.id)
                                    }}
                                    className="admin-delete-btn"
                                >
                                    {t('general.delete')}
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>
            <div className="pagination">
                {Array.from({ length: Math.ceil(songs.length / songsPerPage) }, (_, index) => (
                    <button
                        key={index}
                        onClick={() => paginate(index + 1)}
                        className={currentPage === index + 1 ? 'active' : ''}
                    >
                        {index + 1}
                    </button>
                ))}
            </div>
            {showFavouritesForm && (
                <FavouritesForm
                    song={currentSong}
                    userId={userId}
                    onClose={() => setShowFavouritesForm(false)}
                    onSubmit={handleFavouriteSubmit}
                />
            )}
        </div>
    );
}

export default SongList;
