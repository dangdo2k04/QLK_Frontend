import axios from 'axios';

// Lấy URL từ biến môi trường, xóa bỏ mọi dấu ngoặc hoặc khoảng trắng thừa nếu có
//const rawURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';
//const BASE_URL = rawURL.replace(/[\[\]]/g, "").trim(); 

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

// // Kiểm tra URL thực tế trong Console để debug
// console.log("Dự án đang gọi API tại:", BASE_URL);

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;