import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import axios from 'axios';

const Settings: React.FC = () => {
  const router = useRouter();
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [testResult, setTestResult] = useState<null | { success: boolean; message: string }>(null);

  // Pobranie tokenu przy ładowaniu strony
  useEffect(() => {
    const fetchToken = async () => {
      try {
        const response = await axios.get('/api/settings/token');
        if (response.data.token) {
          setToken(response.data.token);
        }
      } catch (error) {
        console.error('Błąd podczas pobierania tokenu API', error);
      }
    };

    fetchToken();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    setError('');
    setTestResult(null);

    try {
      const response = await axios.post('/api/settings/token', { token });
      if (response.data.success) {
        setSuccess(true);
        setTimeout(() => router.push('/'), 2000); // Przekierowanie na stronę główną po 2 sekundach
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Wystąpił błąd podczas zapisywania tokenu API');
    } finally {
      setLoading(false);
    }
  };

  const testConnection = async () => {
    setLoading(true);
    setTestResult(null);

    try {
      const response = await axios.post('/api/settings/test-connection', { token });
      setTestResult({ 
        success: response.data.success, 
        message: response.data.success 
          ? 'Połączenie z BaseLinker API działa poprawnie!' 
          : 'Błąd połączenia z BaseLinker API' 
      });
    } catch (err: any) {
      setTestResult({ 
        success: false, 
        message: err.response?.data?.message || 'Wystąpił błąd podczas testowania połączenia' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title="Ustawienia API | Allegro Profit Analyzer">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Ustawienia API</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">BaseLinker API</h2>
          <p className="mb-4 text-gray-600">
            Wprowadź token API BaseLinker, aby umożliwić aplikacji pobieranie danych o produktach, zamówieniach i pozycjach zamówień.
            Token API można wygenerować w panelu BaseLinker w sekcji "Konto &gt; Moje konto &gt; API".
          </p>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="apiToken" className="block text-sm font-medium text-gray-700 mb-1">
                Token API BaseLinker
              </label>
              <input
                type="password"
                id="apiToken"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Wprowadź token API"
                required
              />
            </div>
            
            <div className="flex space-x-4">
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
              >
                {loading ? 'Zapisywanie...' : 'Zapisz ustawienia'}
              </button>
              
              <button
                type="button"
                onClick={testConnection}
                disabled={loading || !token}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50"
              >
                Testuj połączenie
              </button>
            </div>
          </form>
          
          {success && (
            <div className="mt-4 p-2 bg-green-100 text-green-700 rounded-md">
              Token API został zapisany pomyślnie! Za chwilę nastąpi przekierowanie...
            </div>
          )}
          
          {error && (
            <div className="mt-4 p-2 bg-red-100 text-red-700 rounded-md">
              {error}
            </div>
          )}
          
          {testResult && (
            <div className={`mt-4 p-2 rounded-md ${testResult.success ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {testResult.message}
            </div>
          )}
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Informacje o API</h2>
          <div className="space-y-2 text-gray-600">
            <p>• BaseLinker API pozwala na pobieranie danych o produktach, zamówieniach i pozycjach zamówień.</p>
            <p>• Limit zapytań do API wynosi 100 zapytań na minutę.</p>
            <p>• Token API jest przechowywany bezpiecznie w zmiennych środowiskowych serwera.</p>
            <p>• Więcej informacji o BaseLinker API można znaleźć w <a href="https://api.baselinker.com/" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">dokumentacji API</a>.</p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Settings; 