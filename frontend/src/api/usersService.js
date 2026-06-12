import axiosInstance from './axiosConfig';

export const getUsers = () => axiosInstance.get('/api/auth/users/');

export const createUser = (data) => axiosInstance.post('/api/auth/users/', data);

export const updateUser = (id, data) => axiosInstance.patch(`/api/auth/users/${id}/`, data);
