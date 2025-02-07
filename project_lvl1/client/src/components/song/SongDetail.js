import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './songDetail.css';
import { useTranslation } from 'react-i18next';

function SongDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [song, setSong] = useState(null);

    const { t } = useTranslation();

    useEffect(() => {
        axios.get(`/api/songs/${id}`)
            .then(response => setSong(response.data))
            .catch(error => console.error(t('messages.errorOccurred'), error));
    }, [id]);

    if (!song) return <p className="song-detail-text">{t('songDetails.loading')}</p>;

    const videoId = song.videoUrl.split('v=')[1]?.split('&')[0] || song.videoUrl.split('/').pop();

    return (
        <div className="song-detail-container">
            <button className="song-detail-back-button" onClick={() => navigate(-1)}>
                {t('songDetails.goBack')}
            </button>
            <h1 className="song-detail-title">{t('songDetails.title')}</h1>
            <p className="song-detail-text">
                <strong>{t('songDetails.songTitle')}:</strong> {song.title}
            </p>
            <p className="song-detail-text">
                <strong>{t('songDetails.artist')}:</strong> {song.artist}
            </p>

            <div className="song-detail-row">
                <div className="song-detail-column">
                    <h3>{song.languageName}</h3>
                    {song.lyrics}
                </div>
                <div className="song-detail-column">
                    <h3>{t('songDetails.translation')}</h3>
                    {song.translation}
                </div>
            </div>

            {videoId ? (
                <iframe
                    className="song-detail-video"
                    width="560"
                    height="315"
                    src={`https://www.youtube.com/embed/${videoId}`}
                    title={t('songDetails.videoPlayer')}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                ></iframe>
            ) : (
                <p className="song-detail-no-video">{t('songDetails.noVideo')}</p>
            )}
        </div>
    );
}

export default SongDetail;
