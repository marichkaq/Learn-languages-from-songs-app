import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import './index.css';
import axios from "axios";
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n';

const token = localStorage.getItem('token');
if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

ReactDOM.render(
    <React.StrictMode>
        <I18nextProvider i18n={i18n}>
            <App />
        </I18nextProvider>
    </React.StrictMode>,
    document.getElementById('root')
);
