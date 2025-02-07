import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './SongForm.css';
import axios from 'axios';

function SongForm() {
    const { id } = useParams(); // `id` is present if updating a song
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        title: '',
        artist: '',
        lyrics: '',
        translation: '',
        videoUrl: '',
        languageId: '',
    });
    const [languages, setLanguages] = useState([]);
    const [errors, setErrors] = useState([]);

    useEffect(() => {
        if (id) {
            axios.get(`/api/songs/${id}`)
                .then(response => setFormData(response.data))
                .catch(error => console.error('Error fetching song:', error));
        }

        axios.get('/api/languages')
            .then(response => setLanguages(response.data))
            .catch(error => console.error('Error fetching languages:', error));
    }, [id]);

    const validate = () => {
        const validationErrors = [];
        if (!formData.title.trim()) validationErrors.push('Title is required.');
        if (!formData.artist.trim()) validationErrors.push('Artist is required.');
        if (!formData.lyrics.trim()) validationErrors.push('Lyrics are required.');
        if (!formData.translation.trim()) validationErrors.push('Translation is required.');
        if (!formData.videoUrl.trim()) validationErrors.push('Video URL is required.');
        if (!formData.languageId) validationErrors.push('Language is required.');

        const youtubeUrlRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)[a-zA-Z0-9_-]{11}$/;
        if (formData.videoUrl && !youtubeUrlRegex.test(formData.videoUrl)) {
            validationErrors.push('Video URL is not valid. Video must be from Youtube.');
        }

        return validationErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const validationErrors = validate();
        if (validationErrors.length > 0) {
            setErrors(validationErrors);
            return;
        }
        const token = localStorage.getItem('token');
        try {
            if (id) {
                await axios.put(`/api/songs/${id}`, formData,
                    { headers: { Authorization: `Bearer ${token}` }});
                alert('Song updated successfully!');
                navigate(`/songs/${id}`);
            } else {
                const response = await axios.post('/api/songs', formData,
                    { headers: { Authorization: `Bearer ${token}` }});
                alert('Song added successfully!');
                navigate(`/songs/${response.data.id}`);
            }
        } catch (error) {
            console.error('Error submitting form:', error);
        }
    };

    return (
        <div className="song-form-container">
            <button className="song-form-back-button" onClick={() => navigate(-1)}>← Back</button>
            <form onSubmit={handleSubmit} className="song-form">
                <h2>{id ? 'Update Song' : 'Add Song'}</h2>
                {errors.map((error, index) => (
                    <p key={index} className="song-form-error">{error}</p>
                ))}

                <input
                    type="text"
                    placeholder="Title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                />
                <input
                    type="text"
                    placeholder="Artist"
                    value={formData.artist}
                    onChange={(e) => setFormData({ ...formData, artist: e.target.value })}
                    required
                />
                <textarea
                    placeholder="Lyrics"
                    value={formData.lyrics}
                    onChange={(e) => setFormData({ ...formData, lyrics: e.target.value })}
                    required
                />
                <textarea
                    placeholder="Translation"
                    value={formData.translation}
                    onChange={(e) => setFormData({ ...formData, translation: e.target.value })}
                    required
                />
                <input
                    type="text"
                    placeholder="Video URL (Youtube)"
                    value={formData.videoUrl}
                    onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                    required
                />
                <select
                    value={formData.languageId}
                    onChange={(e) => setFormData({ ...formData, languageId: e.target.value })}
                    required
                >
                    <option value="">Select Language</option>
                    {languages.map(language => (
                        <option key={language.id} value={language.id}>{language.name}</option>
                    ))}
                </select>
                <button type="submit" className="song-form-submit">{id ? 'Update Song' : 'Add Song'}</button>
            </form>
        </div>
    );
}

export default SongForm;
