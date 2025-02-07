import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './form.css';

function UserForm() {
    const { id } = useParams(); // `id` is present if updating a user
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        birthDate: '',
        languageId: '',
        // statusId: '',
    });
    const [errors, setErrors] = useState([]);
    const [languages, setLanguages] = useState([]); // for fetching language names

    // fetch existing user data for update
    useEffect(() => {
        if (id) {
            axios.get(`/api/users/${id}`)
                .then(response => {
                    setFormData(response.data);
                })
                .catch(error => {
                    console.error('Error fetching user:', error);
                });
        }
    }, [id]);

    useEffect(() => {
        axios.get('/api/languages')
            .then(response => setLanguages(response.data))
            .catch(error => console.error('Error fetching languages:', error));
    }, []);

    const validate = () => {
        const errors = [];
        if (formData.username.length < 3 || formData.username.length > 30) {
            errors.push('Username must be between 3 and 30 characters.');
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            errors.push('Invalid email format.');
        }
        if (!id && !/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(formData.password)) {
            errors.push('Password must be at least 8 characters long, include lower and upper case letter, a number, and a special character.');
        }

        const birthDate = new Date(formData.birthDate);
        const age = new Date().getFullYear() - birthDate.getFullYear();
        if (isNaN(birthDate.getTime()) || age < 3) {
            errors.push('Invalid birth date or user must be at least 3 years old.');
        }

        if (!languages.some(language => language.id === parseInt(formData.languageId))) {
            errors.push('Selected language does not exist.');
        }

        return errors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const validationErrors = validate();
        if (validationErrors.length > 0) {
            setErrors(validationErrors);
            return;
        }

        try {
            if (id) {
                // update user
                await axios.put(`/api/users/${id}`, formData);
                alert('User updated successfully!');
                navigate(`/profile/${id}`); // redirect to UserDetail
            } else {
                // register user
                const response = await axios.post('/api/users/register', formData);
                alert('User registered successfully!');
                navigate(`/login`); // redirect to Login
            }
        } catch (error) {
            if (error.response && error.response.data && error.response.data.error === 'Email is already registered.') {
                setErrors(['The email address is already registered. Please use a different email.']);
            } else {
                console.error('Error submitting form:', error);
                setErrors(['An unexpected error occurred. Please try again later.']);
            }
        }
    };

    return (
        <div className="form-body">
            <div className="back-button" onClick={() => navigate(-1)}>
                &#8592; Back
            </div>
            <form onSubmit={handleSubmit} className="form-container">
                <h1 className="form-header">{id ? 'Update User' : 'Register'}</h1>
                {errors.map((error, index) => (
                    <p key={index} className="form-error">{error}</p>
                ))}
                <input
                    type="text"
                    placeholder="Username"
                    value={formData.username}
                    onChange={(e) => setFormData({...formData, username: e.target.value})}
                    className="form-input"
                    required
                />
                <input
                    type="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="form-input"
                    required
                />
                {!id && (
                    <input
                        type="password"
                        placeholder="Password"
                        value={formData.password}
                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                        className="form-input"
                        required
                    />
                )}
                <input
                    type="date"
                    placeholder="Birth Date"
                    value={formData.birthDate}
                    onChange={(e) => setFormData({...formData, birthDate: e.target.value})}
                    className="form-input"
                />
                <select
                    value={formData.languageId}
                    onChange={(e) => setFormData({...formData, languageId: e.target.value})}
                    className="form-select"
                    required
                >
                    <option value="">Language You're Learning</option>
                    {languages.map(language => (
                        <option key={language.id} value={language.id}>{language.name}</option>
                    ))}
                </select>
                <button type="submit" className="form-button">{id ? 'Update' : 'Register'}</button>
            </form>
        </div>
    );
}

export default UserForm;
