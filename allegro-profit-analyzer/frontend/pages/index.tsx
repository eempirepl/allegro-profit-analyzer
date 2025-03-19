import React from 'react';
import Layout from '../components/Layout';
import { NextPage } from 'next';
import Link from 'next/link';

const Home: NextPage = () => {
  // Symulacja danych dla dashboardu
  const stats = {
    totalProducts: 125,
    totalOrders: 87,
    totalSales: 15482.99,
    avgOrderValue: 177.96,
    totalProfit: 4290.45,
    profitMargin: 27.71,
  };

  // Symulacja najlepiej sprzedających się produktów
  const topProducts = [
    { id: 1, name: 'Słuchawki bezprzewodowe', sales: 42, profit: 1678.50 },
    { id: 2, name: 'Powerbank 10000mAh', sales: 35, profit: 924.65 },
    { id: 3, name: 'Etui ochronne do telefonu', sales: 28, profit: 392.72 },
    { id: 4, name: 'Kabel USB-C 2m', sales: 26, profit: 247.74 },
  ];

  // Symulacja ostatnich zamówień
  const recentOrders = [
    { id: 12345, date: '2023-10-15', customer: 'Jan Kowalski', total: 149.99, status: 'Zrealizowane' },
    { id: 12344, date: '2023-10-14', customer: 'Anna Nowak', total: 89.90, status: 'Zrealizowane' },
    { id: 12343, date: '2023-10-13', customer: 'Piotr Wiśniewski', total: 299.00, status: 'W trakcie realizacji' },
  ];

  return (
    <Layout title="Dashboard - Allegro Profit Analyzer">
      {/* Statystyki */}
      <div className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">Sprzedaż</h2>
            <div className="flex items-center">
              <div className="rounded-full p-3 bg-blue-100 mr-4">
                <i className="fas fa-shopping-cart text-blue-500"></i>
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-800">{stats.totalSales.toLocaleString('pl-PL', { style: 'currency', currency: 'PLN' })}</p>
                <p className="text-sm text-gray-500">{stats.totalOrders} zamówień</p>
              </div>
            </div>
          </div>
          
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">Zysk</h2>
            <div className="flex items-center">
              <div className="rounded-full p-3 bg-green-100 mr-4">
                <i className="fas fa-chart-line text-green-500"></i>
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-800">{stats.totalProfit.toLocaleString('pl-PL', { style: 'currency', currency: 'PLN' })}</p>
                <p className="text-sm text-gray-500">Marża: {stats.profitMargin}%</p>
              </div>
            </div>
          </div>
          
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">Produkty</h2>
            <div className="flex items-center">
              <div className="rounded-full p-3 bg-purple-100 mr-4">
                <i className="fas fa-box text-purple-500"></i>
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-800">{stats.totalProducts}</p>
                <p className="text-sm text-gray-500">Średnia wartość zamówienia: {stats.avgOrderValue.toLocaleString('pl-PL', { style: 'currency', currency: 'PLN' })}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Przyciski akcji */}
      <div className="flex flex-wrap gap-4 mb-8">
        <Link href="/api-settings" className="btn btn-primary">
          <i className="fas fa-sync-alt mr-2"></i> Synchronizuj dane
        </Link>
        <Link href="/api-settings" className="btn btn-secondary">
          <i className="fas fa-file-import mr-2"></i> Import CSV
        </Link>
        <Link href="/products" className="btn">
          <i className="fas fa-box mr-2"></i> Zarządzaj produktami
        </Link>
      </div>
      
      {/* Najlepiej sprzedające się produkty i ostatnie zamówienia */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Najlepiej sprzedające się produkty */}
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Najlepiej sprzedające się produkty</h2>
            <Link href="/products" className="text-primary hover:text-primary-dark">
              Pokaż wszystkie
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Nazwa produktu</th>
                  <th>Sprzedaż</th>
                  <th>Zysk</th>
                </tr>
              </thead>
              <tbody>
                {topProducts.map((product) => (
                  <tr key={product.id}>
                    <td>{product.name}</td>
                    <td>{product.sales} szt.</td>
                    <td className="text-success">{product.profit.toLocaleString('pl-PL', { style: 'currency', currency: 'PLN' })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Ostatnie zamówienia */}
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Ostatnie zamówienia</h2>
            <Link href="/orders" className="text-primary hover:text-primary-dark">
              Pokaż wszystkie
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Data</th>
                  <th>Klient</th>
                  <th>Status</th>
                  <th>Wartość</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
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
                    <td>{order.total.toLocaleString('pl-PL', { style: 'currency', currency: 'PLN' })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      {/* Miejsce na wykres */}
      <div className="card p-6">
        <h2 className="text-xl font-bold mb-4">Sprzedaż i zyski w czasie</h2>
        <div className="h-80 flex items-center justify-center bg-gray-100 rounded">
          <p className="text-gray-500">
            <i className="fas fa-chart-bar text-4xl mb-4 block"></i>
            <span>Tutaj będzie wykres sprzedaży i zysków w czasie</span>
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default Home; 