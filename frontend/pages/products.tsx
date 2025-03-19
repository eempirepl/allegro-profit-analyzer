import React from 'react';
import Layout from '../components/Layout';

const ProductsPage: React.FC = () => {
  return (
    <Layout title="Produkty | Allegro Profit Analyzer">
      <div className="container mx-auto px-4">
        <h1 className="text-2xl font-bold mb-6">Lista Produktów</h1>
        <div className="bg-white rounded-lg shadow p-6">
          {/* Tutaj będzie tabela z produktami */}
          <p className="text-gray-500">Lista produktów zostanie wkrótce dodana...</p>
        </div>
      </div>
    </Layout>
  );
};

export default ProductsPage; 