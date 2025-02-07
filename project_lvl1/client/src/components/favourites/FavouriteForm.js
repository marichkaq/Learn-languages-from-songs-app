import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

function FavouritesForm({ song, userId, onClose, onSubmit }) {
    const [rating, setRating] = useState('');
    const { t } = useTranslation();

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(rating); // pass the rating back to the parent component
    };

    return (
        <div className="favourites-form-overlay">
            <div className="favourites-form-container">
                <h2>{t('favourites.addToFavourites')}</h2>
                <p>{t('favourites.song')}: {song.title}</p>
                <form onSubmit={handleSubmit}>
                    <label>
                        {t('favourites.rating')} (1-100):
                        <input
                            type="number"
                            min="1"
                            max="100"
                            value={rating}
                            onChange={(e) => setRating(e.target.value)}
                            required
                        />
                    </label>
                    <div className="form-actions">
                        <button type="submit">{t('general.save')}</button>
                        <button type="button" onClick={onClose}>
                            {t('general.cancel')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default FavouritesForm;
