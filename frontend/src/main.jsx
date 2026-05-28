import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { Provider } from 'react-redux';
import { store } from './store/store.js';

// App riêng
import App from './App.jsx';          // Người dùng
import AdminApp from './admin/AdminApp.jsx'; // Admin

const root = ReactDOM.createRoot(document.getElementById('root'));

// Kiểm tra URL để render đúng App
const isAdminRoute = window.location.pathname.startsWith('/admin');

if (isAdminRoute) {
  root.render(
    <React.StrictMode>
      <AdminApp />
    </React.StrictMode>
  );
} else {
  root.render(
    <React.StrictMode>
      <Provider store={store}>
        <App />
      </Provider>
    </React.StrictMode>
  );
}