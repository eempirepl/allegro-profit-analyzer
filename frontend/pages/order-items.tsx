import React from 'react';
import Layout from '../components/Layout';

const OrderItemsPage: React.FC = () => {
  return (
    <Layout title="Pozycje Zamówień | Allegro Profit Analyzer">
      <div className="container mx-auto px-4">
        <h1 className="text-2xl font-bold mb-6">Pozycje Zamówień</h1>
        <div className="bg-white rounded-lg shadow p-6">
          {/* Tutaj będzie tabela z pozycjami zamówień */}
          <p className="text-gray-500">Lista pozycji zamówień zostanie wkrótce dodana...</p>
        </div>
      </div>
    </Layout>
  );
};

export default OrderItemsPage; 