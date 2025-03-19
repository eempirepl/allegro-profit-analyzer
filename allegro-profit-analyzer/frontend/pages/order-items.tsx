import React from 'react';
import Layout from '../components/Layout';
import { NextPage } from 'next';

const OrderItems: NextPage = () => {
  // Symulacja danych pozycji zamówień
  const orderItems = [
    { 
      id: 1001, 
      orderId: 12345, 
      product: 'Słuchawki bezprzewodowe', 
      sku: 'SLU-BEZ-001',
      quantity: 1,
      price: 199.99,
      purchasePrice: 120.00,
      profit: 79.99
    },
    { 
      id: 1002, 
      orderId: 12345, 
      product: 'Kabel USB-C 2m', 
      sku: 'USB-C-2M',
      quantity: 2,
      price: 29.99,
      purchasePrice: 10.50,
      profit: 38.98
    },
    { 
      id: 1003, 
      orderId: 12344, 
      product: 'Etui ochronne do telefonu', 
      sku: 'ET-OCH-XYZ',
      quantity: 1,
      price: 49.99,
      purchasePrice: 15.60,
      profit: 34.39
    },
    { 
      id: 1004, 
      orderId: 12343, 
      product: 'Smartwatch Pro', 
      sku: 'SW-PRO-101',
      quantity: 1,
      price: 599.99,
      purchasePrice: 450.00,
      profit: 149.99
    },
    { 
      id: 1005, 
      orderId: 12343, 
      product: 'Power Bank 10000mAh', 
      sku: 'PB-10K',
      quantity: 1,
      price: 119.99,
      purchasePrice: 65.00,
      profit: 54.99
    },
  ];

  return (
    <Layout title="Pozycje zamówień - Allegro Profit Analyzer">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Pozycje zamówień</h1>
        <p className="text-gray-600">Analizuj szczegóły pozycji zamówień</p>
      </div>

      <div className="mb-6 flex flex-wrap gap-4">
        <div className="flex gap-2">
          <input 
            type="text" 
            placeholder="Szukaj pozycji..."
            className="input"
          />
          <button className="btn btn-primary">Szukaj</button>
        </div>
        
        <div className="flex gap-2">
          <select className="input">
            <option>Wszystkie zamówienia</option>
            <option>Zamówienie #12345</option>
            <option>Zamówienie #12344</option>
            <option>Zamówienie #12343</option>
          </select>
          
          <button className="btn btn-secondary">
            <i className="fas fa-filter mr-2"></i> Filtruj
          </button>
        </div>
      </div>

      <div className="card">
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Zamówienie</th>
                <th>Produkt</th>
                <th>SKU</th>
                <th>Ilość</th>
                <th>Cena (PLN)</th>
                <th>Cena zakupu (PLN)</th>
                <th>Zysk (PLN)</th>
                <th>Akcje</th>
              </tr>
            </thead>
            <tbody>
              {orderItems.map((item) => (
                <tr key={item.id}>
                  <td>{item.id}</td>
                  <td>
                    <a href={`/orders?id=${item.orderId}`} className="text-blue-600 hover:text-blue-800">
                      #{item.orderId}
                    </a>
                  </td>
                  <td>{item.product}</td>
                  <td>{item.sku}</td>
                  <td>{item.quantity}</td>
                  <td>{item.price.toFixed(2)} zł</td>
                  <td>{item.purchasePrice.toFixed(2)} zł</td>
                  <td>
                    <span className={item.profit >= 0 ? 'text-success' : 'text-danger'}>
                      {item.profit > 0 ? '+' : ''}{item.profit.toFixed(2)} zł
                    </span>
                  </td>
                  <td>
                    <button className="text-blue-600 hover:text-blue-800 mr-2">
                      <i className="fas fa-eye"></i>
                    </button>
                    <button className="text-blue-600 hover:text-blue-800">
                      <i className="fas fa-edit"></i>
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
          <span className="text-gray-600">Pokazuje 1-5 z 5 pozycji</span>
        </div>
        <div className="flex gap-2">
          <button className="btn" disabled>Poprzednia</button>
          <button className="btn btn-primary">Następna</button>
        </div>
      </div>
      
      <div className="mt-6 card p-4">
        <h2 className="text-xl font-bold mb-4">Podsumowanie rentowności</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-green-50 rounded-md">
            <p className="text-sm text-gray-600">Całkowita wartość sprzedaży</p>
            <p className="text-2xl font-bold text-success">1 029,94 zł</p>
          </div>
          <div className="p-4 bg-blue-50 rounded-md">
            <p className="text-sm text-gray-600">Całkowity koszt zakupu</p>
            <p className="text-2xl font-bold text-blue-600">661,60 zł</p>
          </div>
          <div className="p-4 bg-purple-50 rounded-md">
            <p className="text-sm text-gray-600">Całkowity zysk</p>
            <p className="text-2xl font-bold text-purple-600">358,34 zł</p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default OrderItems; 