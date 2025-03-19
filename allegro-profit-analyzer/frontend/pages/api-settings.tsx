import React, { useState } from 'react';
import Layout from '../components/Layout';
import { NextPage } from 'next';

const ApiSettings: NextPage = () => {
  const [baselinkerToken, setBaselinkerToken] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleSaveToken = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Symulacja zapisywania tokenu
    setTimeout(() => {
      setIsSaved(true);
      setIsLoading(false);
      setTestResult(null);
    }, 1000);
  };

  const handleTestConnection = () => {
    if (!baselinkerToken) {
      setTestResult({ success: false, message: 'Token API jest wymagany' });
      return;
    }

    setIsLoading(true);
    // Symulacja testu połączenia
    setTimeout(() => {
      if (baselinkerToken.length > 10) {
        setTestResult({ success: true, message: 'Połączenie z API BaseLinker ustanowione pomyślnie' });
      } else {
        setTestResult({ success: false, message: 'Nieprawidłowy token API lub błąd połączenia' });
      }
      setIsLoading(false);
    }, 1500);
  };

  return (
    <Layout title="Ustawienia API - Allegro Profit Analyzer">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Ustawienia API</h1>
        <p className="text-gray-600">Konfiguracja połączeń z zewnętrznymi API</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <div className="card">
            <h2 className="text-xl font-bold mb-4">BaseLinker API</h2>
            <form onSubmit={handleSaveToken}>
              <div className="mb-4">
                <label htmlFor="baselinker_token" className="block text-sm font-medium text-gray-700 mb-1">
                  Token API BaseLinker
                </label>
                <input
                  type="text"
                  id="baselinker_token"
                  className="input"
                  placeholder="Wprowadź token API BaseLinker"
                  value={baselinkerToken}
                  onChange={(e) => {
                    setBaselinkerToken(e.target.value);
                    setIsSaved(false);
                    setTestResult(null);
                  }}
                  required
                />
                <p className="mt-1 text-sm text-gray-500">
                  Token można wygenerować w panelu BaseLinker: Ustawienia &gt; API.
                </p>
              </div>

              <div className="mb-4">
                <label htmlFor="baselinker_url" className="block text-sm font-medium text-gray-700 mb-1">
                  URL API BaseLinker
                </label>
                <input
                  type="text"
                  id="baselinker_url"
                  className="input"
                  value="https://api.baselinker.com/connector.php"
                  disabled
                />
                <p className="mt-1 text-sm text-gray-500">
                  URL API jest stały i nie wymaga zmiany.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isLoading}
                >
                  {isLoading ? 'Zapisywanie...' : 'Zapisz Token'}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleTestConnection}
                  disabled={isLoading || !baselinkerToken}
                >
                  {isLoading ? 'Testowanie...' : 'Testuj Połączenie'}
                </button>
              </div>

              {isSaved && (
                <div className="mt-3 p-2 bg-green-50 text-green-800 rounded-md">
                  Token API został zapisany pomyślnie
                </div>
              )}

              {testResult && (
                <div className={`mt-3 p-2 rounded-md ${
                  testResult.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
                }`}>
                  {testResult.message}
                </div>
              )}
            </form>
          </div>
        </div>

        <div className="md:col-span-1">
          <div className="card">
            <h2 className="text-xl font-bold mb-4">Limity API</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">BaseLinker API</p>
                <p className="font-medium">100 zapytań / minutę</p>
                <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                  <div className="bg-primary h-2.5 rounded-full" style={{ width: '15%' }}></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">Aktualnie: 15/100 zapytań</p>
              </div>

              <div>
                <p className="text-sm text-gray-600">Ostatnia synchronizacja</p>
                <p className="font-medium">15 minut temu</p>
              </div>

              <div>
                <p className="text-sm text-gray-600">Status</p>
                <span className="px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
                  Aktywny
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <div className="card">
          <h2 className="text-xl font-bold mb-4">Import danych CSV</h2>
          <p className="text-gray-600 mb-4">
            Zaimportuj dane z plików CSV Allegro Billing, aby powiązać je z zamówieniami
          </p>

          <div className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center">
            <div className="mb-3">
              <i className="fas fa-file-upload text-4xl text-gray-400"></i>
            </div>
            <p className="text-gray-600 mb-2">Przeciągnij i upuść plik CSV lub</p>
            <button className="btn btn-primary">Wybierz plik</button>
            <p className="mt-2 text-xs text-gray-500">
              Obsługiwane formaty: CSV z Allegro Billing
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ApiSettings; 