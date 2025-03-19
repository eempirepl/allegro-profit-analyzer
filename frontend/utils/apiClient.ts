import axios from 'axios';

// Tworzymy instancję axios z konfiguracją
const apiClient = axios.create({
  baseURL: 'http://localhost:3001', // Port z konfiguracji backendu
  timeout: 10000, // 10 sekund timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

export default apiClient; 