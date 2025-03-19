import React from 'react';
import Layout from '../components/Layout';
import { NextPage } from 'next';

const Orders: NextPage = () => {
  // Symulacja danych zamówień
  const orders = [
    { 
      id: 12345, 
      date: '2023-10-15', 
      customer: 'Jan Kowalski', 
      status: 'Zrealizowane', 
      total: 149.99,
      source: 'Allegro',
      profit: 35.20 
    },
    { 
      id: 12344, 
      date: '2023-10-14', 
      customer: 'Anna Nowak', 
      status: 'Zrealizowane', 
      total: 89.90,
      source: 'Allegro',
      profit: 19.45 
    },
    { 
      id: 12343, 
      date: '2023-10-13', 
      customer: 'Piotr Wiśniewski', 
      status: 'W trakcie realizacji', 
      total: 299.00,
      source: 'Allegro',
      profit: null 
    },
    { 
      id: 12342, 
      date: '2023-10-12', 
      customer: 'Magdalena Zielińska', 
      status: 'Anulowane', 
      total: 59.99,
      source: 'Allegro',
      profit: -15.00 
    },
    { 
      id: 12341, 
      date: '2023-10-10', 
      customer: 'Krzysztof Dąbrowski', 
      status: 'Zrealizowane', 
      total: 199.50,
      source: 'Allegro',
      profit: 45.30 
    },
  ];

  return (
    <Layout title="Zamówienia - Allegro Profit Analyzer">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Zamówienia</h1>
        <p className="text-gray-600">Zarządzaj i analizuj zamówienia</p>
      </div>

      <div className="mb-6 flex flex-wrap gap-4">
        <div className="flex gap-2">
          <input 
            type="text" 
            placeholder="Szukaj zamówień..."
            className="input"
          />
          <button className="btn btn-primary">Szukaj</button>
        </div>
        
        <div className="flex gap-2">
          <select className="input">
            <option>Wszystkie statusy</option>
            <option>Zrealizowane</option>
            <option>W trakcie realizacji</option>
            <option>Anulowane</option>
          </select>
          
          <select className="input">
            <option>Wszystkie źródła</option>
            <option>Allegro</option>
            <option>Sklep własny</option>
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
                <th>Data</th>
                <th>Klient</th>
                <th>Status</th>
                <th>Źródło</th>
                <th>Wartość</th>
                <th>Zysk</th>
                <th>Akcje</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td>#{order.id}</td>
                  <td>{order.date}</td>
                  <td>{order.customer}</td>
                  <td>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      order.status === 'Zrealizowane' ? 'bg-green-100 text-green-800' : 
                      order.status === 'W trakcie realizacji' ? 'bg-blue-100 text-blue-800' : 
                      'bg-red-100 text-red-800'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td>{order.source}</td>
                  <td>{order.total.toFixed(2)} zł</td>
                  <td>
                    {order.profit === null ? (
                      <span className="text-gray-500">Oczekuje</span>
                    ) : (
                      <span className={order.profit >= 0 ? 'text-success' : 'text-danger'}>
                        {order.profit > 0 ? '+' : ''}{order.profit?.toFixed(2)} zł
                      </span>
                    )}
                  </td>
                  <td>
                    <button className="text-blue-600 hover:text-blue-800 mr-2">
                      <i className="fas fa-eye"></i>
                    </button>
                    <button className="text-blue-600 hover:text-blue-800 mr-2">
                      <i className="fas fa-chart-line"></i>
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
          <span className="text-gray-600">Pokazuje 1-5 z 5 zamówień</span>
        </div>
        <div className="flex gap-2">
          <button className="btn" disabled>Poprzednia</button>
          <button className="btn btn-primary">Następna</button>
        </div>
      </div>
    </Layout>
  );
};

export default Orders; 