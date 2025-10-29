import axios from 'axios';

export const checkAuth = async () => {
  try {
    const response = await axios.get('http://localhost:5000/auth/user', {
      withCredentials: true
    });
    return response.data.success;
  } catch (error) {
    return false;
  }
};

