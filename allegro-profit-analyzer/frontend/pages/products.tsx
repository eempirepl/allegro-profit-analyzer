import React from 'react';
import Layout from '../components/Layout';
import { NextPage } from 'next';

const Products: NextPage = () => {
  // Symulacja danych produktów
  const products = [
    { id: 1, name: 'Słuchawki bezprzewodowe', sku: 'SLU-BEZ-001', price: 199.99, stockQuantity: 25 },
    { id: 2, name: 'Smartwatch Pro', sku: 'SW-PRO-101', price: 599.99, stockQuantity: 10 },
    { id: 3, name: 'Kabel USB-C 2m', sku: 'USB-C-2M', price: 29.99, stockQuantity: 100 },
    { id: 4, name: 'Etui ochronne do telefonu', sku: 'ET-OCH-XYZ', price: 49.99, stockQuantity: 35 },
    { id: 5, name: 'Power Bank 10000mAh', sku: 'PB-10K', price: 119.99, stockQuantity: 15 },
  ];

  return (
    <Layout title="Produkty magazynowe - Allegro Profit Analyzer">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Produkty magazynowe</h1>
        <p className="text-gray-600">Przeglądaj i zarządzaj produktami w magazynie</p>
      </div>

      <div className="mb-6 flex justify-between">
        <div className="flex gap-2">
          <input 
            type="text" 
            placeholder="Szukaj produktów..."
            className="input"
          />
          <button className="btn btn-primary">Szukaj</button>
        </div>
        <button className="btn btn-secondary">
          <i className="fas fa-sync-alt mr-2"></i> Synchronizuj z BaseLinker
        </button>
      </div>

      <div className="card">
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nazwa produktu</th>
                <th>SKU</th>
                <th>Cena zakupu (PLN)</th>
                <th>Stan magazynowy</th>
                <th>Akcje</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <td>{product.id}</td>
                  <td>{product.name}</td>
                  <td>{product.sku}</td>
                  <td>{product.price.toFixed(2)} zł</td>
                  <td>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      product.stockQuantity > 20 ? 'bg-green-100 text-green-800' : 
                      product.stockQuantity > 5 ? 'bg-yellow-100 text-yellow-800' : 
                      'bg-red-100 text-red-800'
                    }`}>
                      {product.stockQuantity} szt.
                    </span>
                  </td>
                  <td>
                    <button className="text-blue-600 hover:text-blue-800 mr-2">
                      <i className="fas fa-edit"></i>
                    </button>
                    <button className="text-red-600 hover:text-red-800">
                      <i className="fas fa-trash"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-4 flex justify-between items-center">
        <div>
          <span className="text-gray-600">Pokazuje 1-5 z 5 produktów</span>
        </div>
        <div className="flex gap-2">
          <button className="btn" disabled>Poprzednia</button>
          <button className="btn btn-primary">Następna</button>
        </div>
      </div>
    </Layout>
  );
};

export default Products; 