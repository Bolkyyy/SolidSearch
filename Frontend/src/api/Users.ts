import axios from 'axios';

export interface User {
  id: number;
  full_name: string;
  email: string;
  status: string;
  created_at: Date;
  role: Roles;
}

export interface CreateUser {
  full_name: string;
  email: string;
  password: string;
  status: string;
  role: string; // код роли, например "admin" или "user"
}

export interface Roles {
  id: number;
  name: string;
  code: string;
}


export const usersApi = {
  getUsers: async (): Promise<User[]> => {
    const response = await axios.get(`http://localhost:3001/users`);
    return response.data;
  },
  createUser: async (userData: CreateUser): Promise<User> => {
    const response = await axios.post(`http://localhost:3001/users`, userData);
    return response.data;
  },
  deleteUser: async (userId: number) => {
    const response = await axios.delete(`http://localhost:3001/users/${userId}`);
    return response.data;
  },

};

