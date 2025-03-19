import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import Layout from '../../components/Layout';
import Link from 'next/link';

interface OrderItem {
  order_id: string;
  product_id: string;
  name: string;
  price_brutto: string;
  tax_rate: string;
  quantity: number;
  currency: string;
  value_in_pln: string;
  auction_id: string;
}

const OrderItemsDetailPage: React.FC = () => {
  const router = useRouter();
  const { orderId } = router.query;
  
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Pobieranie pozycji zamówienia przy zmianie orderId
  useEffect(() => {
    if (orderId) {
      fetchOrderItems();
    }
  }, [orderId]);

  // Funkcja pobierająca pozycje zamówień
  const fetchOrderItems = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await axios.get(`/api/order-items/${orderId}`);
      setOrderItems(response.data.order_items || []);
    } catch (err: any) {
      setError(`Błąd podczas pobierania pozycji zamówienia: ${err.response?.data?.error || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title={`Pozycje Zamówienia ${orderId} | Allegro Profit Analyzer`}>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <Link 
              href="/orders"
              className="text-blue-600 hover:text-blue-800 mb-2 inline-block"
            >
              &larr; Powrót do zamówień
            </Link>
            <h1 className="text-2xl font-bold">Pozycje Zamówienia {orderId}</h1>
          </div>
        </div>
        
        {/* Komunikaty */}
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}
        
        {/* Tabela pozycji zamówień */}
        {loading ? (
          <div className="text-center py-8">
            <p className="text-gray-500">Ładowanie pozycji zamówienia...</p>
          </div>
        ) : orderItems.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-lg overflow-hidden shadow-md">
              <thead className="bg-gray-200">
                <tr>
                  <th className="py-3 px-4 text-left">ID produktu</th>
                  <th className="py-3 px-4 text-left">Nazwa produktu</th>
                  <th className="py-3 px-4 text-right">Cena brutto</th>
                  <th className="py-3 px-4 text-center">Stawka VAT</th>
                  <th className="py-3 px-4 text-center">Ilość</th>
                  <th className="py-3 px-4 text-center">Waluta</th>
                  <th className="py-3 px-4 text-right">Wartość w PLN</th>
                  <th className="py-3 px-4 text-left">Identyfikator oferty</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orderItems.map((item, index) => (
                  <tr key={`${item.product_id}-${index}`} className="hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <Link 
                        href={`/products?id=${item.product_id}`}
                        className="text-blue-600 hover:text-blue-800 underline"
                      >
                        {item.product_id}
                      </Link>
                    </td>
                    <td className="py-3 px-4">{item.name}</td>
                    <td className="py-3 px-4 text-right">{item.price_brutto} {item.currency}</td>
                    <td className="py-3 px-4 text-center">{item.tax_rate}%</td>
                    <td className="py-3 px-4 text-center">{item.quantity}</td>
                    <td className="py-3 px-4 text-center">{item.currency}</td>
                    <td className="py-3 px-4 text-right">{item.value_in_pln} PLN</td>
                    <td className="py-3 px-4">{item.auction_id}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">Brak pozycji dla tego zamówienia.</p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default OrderItemsDetailPage; 