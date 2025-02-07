import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../home/home.css';
import { useTranslation } from 'react-i18next';

function FavouriteList() {
    const [favourites, setFavourites] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();
    const { t } = useTranslation();

    useEffect(() => {
        const fetchFavourites = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get('/api/favourites', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                const sortedSongs = response.data.sort((a, b) => a.rating - b.rating);
                setFavourites(sortedSongs);
            } catch (error) {
                console.error(t('favourites.errorFetching'), error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchFavourites();
    }, [t]);

    const getThumbnailUrl = (url) => {
        if (!url) return 'https://via.placeholder.com/320x180?text=No+Thumbnail';

        let videoId;
        try {
            if (url.includes('youtu.be/')) {
                videoId = url.split('youtu.be/')[1];
            } else if (url.includes('youtube.com/watch?v=')) {
                videoId = url.split('v=')[1]?.split('&')[0];
            } else {
                return 'https://via.placeholder.com/320x180?text=No+Thumbnail';
            }
            return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
        } catch {
            return 'https://via.placeholder.com/320x180?text=Invalid+URL';
        }
    };

    if (isLoading) {
        return <p>{t('favourites.loading')}</p>;
    }

    return (
        <div className="home-main">
            <div className="back-button" onClick={() => navigate('/')}>
                &#8592; {t('general.back')}
            </div>
            <h1>{t('favourites.title')}</h1>
            {favourites.length === 0 ? (
                <p>{t('favourites.noFavourites')}</p>
            ) : (
                <div className="songs-grid">
                    {favourites.map((song) => (
                        <div className="song-card" key={`favourite-${song.id}`}>
                            <img
                                className="song-thumbnail"
                                src={getThumbnailUrl(song.videoUrl)}
                                alt={`${song.title} thumbnail`}
                            />
                            <h3>{song.title}</h3>
                            <p>{song.artist}</p>
                            <p>
                                <strong>{t('favourites.rating')}:</strong> {song.rating}
                            </p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default FavouriteList;
