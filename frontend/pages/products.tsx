import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from '../components/Layout';

interface Product {
  id: number;
  sku: string;
  ean: string;
  name: string;
  average_cost: number | null;
  stock: number;
}

const ProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [syncLoading, setSyncLoading] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState(false);
  const [syncError, setSyncError] = useState('');

  // Pobieranie produktów przy ładowaniu strony
  useEffect(() => {
    fetchProducts();
  }, []);

  // Funkcja pobierająca produkty
  const fetchProducts = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await axios.get('/api/products');
      setProducts(response.data.products || []);
    } catch (err: any) {
      setError(`Błąd podczas pobierania produktów: ${err.response?.data?.error || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Funkcja synchronizująca produkty
  const syncProducts = async () => {
    setSyncLoading(true);
    setSyncSuccess(false);
    setSyncError('');
    
    try {
      const response = await axios.post('/api/products/sync');
      setProducts(response.data.products || []);
      setSyncSuccess(true);
      setTimeout(() => setSyncSuccess(false), 3000); // Ukryj komunikat o sukcesie po 3 sekundach
    } catch (err: any) {
      setSyncError(`Błąd podczas synchronizacji produktów: ${err.response?.data?.error || err.message}`);
    } finally {
      setSyncLoading(false);
    }
  };

  return (
    <Layout title="Produkty | Allegro Profit Analyzer">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Produkty Magazynowe</h1>
          <button
            onClick={syncProducts}
            disabled={syncLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {syncLoading ? 'Synchronizacja...' : 'Synchronizuj Dane'}
          </button>
        </div>
        
        {/* Komunikaty */}
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}
        
        {syncError && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
            {syncError}
          </div>
        )}
        
        {syncSuccess && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md">
            Produkty zostały pomyślnie zsynchronizowane.
          </div>
        )}
        
        {/* Tabela produktów */}
        {loading ? (
          <div className="text-center py-8">
            <p className="text-gray-500">Ładowanie produktów...</p>
          </div>
        ) : products.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-lg overflow-hidden shadow-md">
              <thead className="bg-gray-200">
                <tr>
                  <th className="py-3 px-4 text-left">ID</th>
                  <th className="py-3 px-4 text-left">SKU</th>
                  <th className="py-3 px-4 text-left">EAN</th>
                  <th className="py-3 px-4 text-left">Nazwa produktu</th>
                  <th className="py-3 px-4 text-right">Średni koszt (PLN)</th>
                  <th className="py-3 px-4 text-right">Ilość w magazynie</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="py-3 px-4">{product.id}</td>
                    <td className="py-3 px-4">{product.sku}</td>
                    <td className="py-3 px-4">{product.ean}</td>
                    <td className="py-3 px-4">{product.name}</td>
                    <td className="py-3 px-4 text-right">
                      {product.average_cost !== null
                        ? `${parseFloat(product.average_cost.toString()).toFixed(2)} zł`
                        : '-'}
                    </td>
                    <td className="py-3 px-4 text-right">{product.stock}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">Brak produktów do wyświetlenia.</p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ProductsPage; 