import React from 'react';
import Layout from '../components/Layout';

const ApiSettingsPage: React.FC = () => {
  return (
    <Layout title="Ustawienia API | Allegro Profit Analyzer">
      <div className="container mx-auto px-4">
        <h1 className="text-2xl font-bold mb-6">Ustawienia API</h1>
        <div className="bg-white rounded-lg shadow p-6">
          <form className="space-y-4">
            <div>
              <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700">
                Klucz API BaseLinker
              </label>
              <input
                type="password"
                id="apiKey"
                name="apiKey"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                placeholder="Wprowadź klucz API"
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary"
            >
              Zapisz ustawienia
            </button>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default ApiSettingsPage; 