import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from '../components/Layout';
import Link from 'next/link';

interface Order {
  order_id: string;
  order_status_id: string;
  order_source: string;
  delivery_fullname: string;
  user_login: string;
  order_value: string;
  delivery_price: string;
  date_add: string;
  currency: string;
  value_in_pln: string;
  external_order_id: string;
}

const OrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [syncLoading, setSyncLoading] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState(false);
  const [syncError, setSyncError] = useState('');

  // Pobieranie zamówień przy ładowaniu strony
  useEffect(() => {
    fetchOrders();
  }, []);

  // Funkcja pobierająca zamówienia
  const fetchOrders = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await axios.get('/api/orders');
      setOrders(response.data.orders || []);
    } catch (err: any) {
      setError(`Błąd podczas pobierania zamówień: ${err.response?.data?.error || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Funkcja synchronizująca zamówienia
  const syncOrders = async () => {
    setSyncLoading(true);
    setSyncSuccess(false);
    setSyncError('');
    
    try {
      const response = await axios.post('/api/orders/sync');
      setOrders(response.data.orders || []);
      setSyncSuccess(true);
      setTimeout(() => setSyncSuccess(false), 3000); // Ukryj komunikat o sukcesie po 3 sekundach
    } catch (err: any) {
      setSyncError(`Błąd podczas synchronizacji zamówień: ${err.response?.data?.error || err.message}`);
    } finally {
      setSyncLoading(false);
    }
  };

  // Formatowanie daty
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pl-PL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Layout title="Zamówienia | Allegro Profit Analyzer">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Zamówienia</h1>
          <button
            onClick={syncOrders}
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
            Zamówienia zostały pomyślnie zsynchronizowane.
          </div>
        )}
        
        {/* Tabela zamówień */}
        {loading ? (
          <div className="text-center py-8">
            <p className="text-gray-500">Ładowanie zamówień...</p>
          </div>
        ) : orders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-lg overflow-hidden shadow-md">
              <thead className="bg-gray-200">
                <tr>
                  <th className="py-3 px-4 text-left">Order ID</th>
                  <th className="py-3 px-4 text-left">Status</th>
                  <th className="py-3 px-4 text-left">Źródło Zamówienia</th>
                  <th className="py-3 px-4 text-left">Imię i nazwisko</th>
                  <th className="py-3 px-4 text-left">Login zamawiającego</th>
                  <th className="py-3 px-4 text-right">Wartość zamówienia</th>
                  <th className="py-3 px-4 text-right">Dostawa cena</th>
                  <th className="py-3 px-4 text-center">Data zamówienia</th>
                  <th className="py-3 px-4 text-center">Waluta</th>
                  <th className="py-3 px-4 text-right">Wartość w PLN</th>
                  <th className="py-3 px-4 text-left">Numer zewnętrzny</th>
                  <th className="py-3 px-4 text-center">Akcje</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orders.map((order) => (
                  <tr key={order.order_id} className="hover:bg-gray-50">
                    <td className="py-3 px-4">{order.order_id}</td>
                    <td className="py-3 px-4">{order.order_status_id}</td>
                    <td className="py-3 px-4">{order.order_source}</td>
                    <td className="py-3 px-4">{order.delivery_fullname}</td>
                    <td className="py-3 px-4">{order.user_login}</td>
                    <td className="py-3 px-4 text-right">{order.order_value} {order.currency}</td>
                    <td className="py-3 px-4 text-right">{order.delivery_price} {order.currency}</td>
                    <td className="py-3 px-4 text-center">{formatDate(order.date_add)}</td>
                    <td className="py-3 px-4 text-center">{order.currency}</td>
                    <td className="py-3 px-4 text-right">{order.value_in_pln} PLN</td>
                    <td className="py-3 px-4">{order.external_order_id}</td>
                    <td className="py-3 px-4 text-center">
                      <Link 
                        href={`/order-items/${order.order_id}`}
                        className="text-blue-600 hover:text-blue-800 underline"
                      >
                        Pozycje
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">Brak zamówień do wyświetlenia.</p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default OrdersPage; 