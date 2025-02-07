import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function UserList() {
    const [users, setUsers] = useState([]);
    const navigate = useNavigate();

    // fetch users from the backend
    useEffect(() => {
        axios.get('api/users')
            .then(response => {
                setUsers(response.data);
            })
            .catch(error => console.error('Error fetching users:', error));
    }, []);

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            axios.delete(`/api/users/${id}`)
                .then(() => {
                    setUsers(users.filter(user => user.id !== id));
                    alert('User deleted successfully!');
                })
                .catch(error => console.error('Error deleting user:', error));
        }
    };

    return (
        <div>
            <h1>User List</h1>
            <button onClick={() => navigate('/users/new')} style={{marginBottom: '10px'}}>Add User</button>
            <table>
                <thead>
                <tr>
                    <th>ID</th>
                    <th>Username</th>
                    <th>Email</th>
                    <th>Language</th>
                    <th>Actions</th>
                </tr>
                </thead>
                <tbody>
                {users.map(user => (
                    <tr key={user.id}>
                        <td>{user.id}</td>
                        <td>{user.username}</td>
                        <td>{user.email}</td>
                        <td>{user.language}</td>
                        <td>
                            <button onClick={() => navigate(`/users/${user.id}/edit`)}>Update</button>
                            <button onClick={() => handleDelete(user.id)} style={{marginLeft: '5px'}}>Delete</button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
}

export default UserList;
