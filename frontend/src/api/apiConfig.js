// src/config/api.js

export const API_BASE_URL = 'http://localhost:8080/api/v1';

export const API_ENDPOINTS = {

  // Sản phẩm
  HOME_GROUPED_PRODUCTS:
    `${API_BASE_URL}/products/home-grouped`,

  ALL_PRODUCTS:
    `${API_BASE_URL}/products`,

  GET_ALL_PRODUCTS:
    `${API_BASE_URL}/products/all`,

  // Người dùng
  LOGIN:
    `${API_BASE_URL}/users/login`,

  REGISTER:
    `${API_BASE_URL}/users/register`,
};