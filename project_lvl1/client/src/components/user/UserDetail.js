import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './userDetail.css';
import { useTranslation } from 'react-i18next';

function UserDetail() {
    const { id } = useParams();
    const [user, setUser] = useState(null);
    const [topSongs, setTopSongs] = useState([]);
    const navigate = useNavigate();
    const { t } = useTranslation();

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get(`/api/users/${id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setUser(response.data);
            } catch (error) {
                console.error(t('profile.errorFetchingUser'), error);
            }
        };

        const fetchTopSongs = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get('/api/favourites/top-songs', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                const sortedSongs = response.data.sort((a, b) => a.rating - b.rating);
                setTopSongs(sortedSongs);
            } catch (error) {
                console.error(t('profile.errorFetchingSongs'), error);
            }
        };

        fetchUser();
        fetchTopSongs();
    }, [id, t]);

    const handleEdit = () => {
        navigate(`/edit-profile/${id}`);
    };

    const handleDelete = async () => {
        if (window.confirm(t('profile.confirmDelete'))) {
            try {
                const token = localStorage.getItem('token');
                await axios.delete(`/api/users/${id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                alert(t('profile.deleteSuccess'));
                localStorage.removeItem('token'); // clear token after deletion
                navigate('/register');
            } catch (error) {
                console.error(t('profile.deleteError'), error);
                alert(t('profile.deleteFailed'));
            }
        }
    };

    const extractYouTubeThumbnail = (url) => {
        if (!url) return 'https://via.placeholder.com/320x180?text=No+Thumbnail';
        try {
            const videoId = url.includes('v=') ? url.split('v=')[1]?.split('&')[0] : url.split('/').pop();
            return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
        } catch (error) {
            console.error(t('profile.invalidUrl'), error);
            return 'https://via.placeholder.com/320x180?text=Invalid+URL';
        }
    };

    if (!user) return <p>{t('profile.loading')}</p>;

    return (
        <div className="user-detail-container">
            <div className="profile-back-button" onClick={() => navigate(-1)}>
                &#8592; {t('general.back')}
            </div>

            <div className="user-info">
                <h1>{t('profile.title')}</h1>
                <p><strong>{t('profile.username')}:</strong> {user.username}</p>
                <p><strong>{t('profile.email')}:</strong> {user.email}</p>
                <p><strong>{t('profile.birthDate')}:</strong> {new Date(user.birthDate).toLocaleDateString()}</p>
                <p><strong>{t('profile.language')}:</strong> {user.language}</p>
                <div className="user-actions">
                    <button onClick={handleEdit} className="user-action-button edit-button">
                        {t('profile.editProfile')}
                    </button>
                    <button onClick={handleDelete} className="user-action-button delete-button">
                        {t('profile.deleteAccount')}
                    </button>
                </div>
            </div>

            <div className="top-songs">
                {topSongs.length > 0 && <h2>{t('profile.topSongs')}</h2>}
                <div className="songs-grid">
                    {topSongs.map((song) => (
                        <div className="song-card" key={song.songId}>
                            <img
                                className="song-thumbnail"
                                src={extractYouTubeThumbnail(song.videoUrl)}
                                alt={`${song.title} thumbnail`}
                            />
                            <h3>{song.title}</h3>
                            <p>{song.artist}</p>
                            <p><strong>{t('profile.rating')}:</strong> {song.rating}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default UserDetail;
