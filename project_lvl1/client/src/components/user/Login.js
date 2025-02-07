import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './form.css';
import {jwtDecode} from "jwt-decode";

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('/api/users/login', { email, password });
            const { token } = response.data;

            localStorage.setItem('token', token);
            const user = jwtDecode(token);
            localStorage.setItem('user', JSON.stringify(user))
            alert('Login successful!');
            navigate('/'); // redirect to home
        } catch (error) {
            console.error('Login failed:', error);
            setError(error.response?.data?.error || 'Login failed');
        }
    };

    return (
        <div className="form-body">
            <form onSubmit={handleSubmit} className="form-container">
                <h1 className="form-header">Login</h1>
                {error && <p className="form-error">{error}</p>}
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="form-input"
                    required
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="form-input"
                    required
                />
                <button type="submit" className="form-button">Login</button>
            </form>
        </div>
    );
}

export default Login;
