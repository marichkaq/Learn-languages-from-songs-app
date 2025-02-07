import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import UserList from './components/user/UserList';
import UserForm from './components/user/UserForm';
import UserDetail from './components/user/UserDetail';
import SongDetail from "./components/song/SongDetail";
import SongList from "./components/song/SongList";
import SongForm from "./components/song/SongForm";
import FavouriteList from "./components/favourites/FavouriteList";
import FavouriteForm from "./components/favourites/FavouriteForm";
import Login from "./components/user/Login";
import Home from "./components/home/Home";

function App() {
    return (
        <Router>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/users" element={<UserList/>}/>

                    <Route path="/profile/:id" element={<UserDetail />} />
                    <Route path="/edit-profile/:id" element={<UserForm />} />

                    <Route path="/songs" element={<SongList/>}/>
                    <Route path="/songs/new" element={<SongForm/>}/>
                    <Route path="/songs/:id" element={<SongDetail/>}/>
                    <Route path="/songs/:id/edit" element={<SongForm/>}/>

                    <Route path="/favourites" element={<FavouriteList />} />
                    <Route path="/favourites/new" element={<FavouriteForm />} />

                    <Route path="/register" element={<UserForm />} />
                    <Route path="/login" element={<Login />} />

                    <Route path="/admin/songs/new" element={<SongForm />} />
                    <Route path="/admin/songs/:id" element={<SongForm />} />
                </Routes>
        </Router>
    );
}

export default App;
