import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

function TopFavouriteSongs() {
    const { userId } = useParams();
    const [topSongs, setTopSongs] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        axios.get(`/api/favourites/top-songs/${userId}`)
            .then(response => setTopSongs(response.data))
            .catch(err => setError('Error fetching top songs'));
    }, [userId]);

    if (error) return <p>{error}</p>;
    if (topSongs.length === 0) return <p>No favourite songs found.</p>;

    return (
        <div>
            <h1>Top 5 Favourite Songs</h1>
            <table>
                <thead>
                <tr>
                    <th>Title</th>
                    <th>Artist</th>
                </tr>
                </thead>
                <tbody>
                {topSongs.map(song => (
                    <tr key={song.songId}>
                        <td>{song.title}</td>
                        <td>{song.artist}</td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
}

export default TopFavouriteSongs;
