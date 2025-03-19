import React from 'react';
import Layout from '../components/Layout';
import { NextPage } from 'next';

const Home: NextPage = () => {
  return (
    <Layout title="Dashboard - Allegro Profit Analyzer">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="card">
          <h2>Podsumowanie sprzedaży</h2>
          <p className="text-gray-600">Przegląd rentowności i statystyk sprzedaży</p>
          <div className="mt-4">
            <button className="btn btn-primary">Szczegóły</button>
          </div>
        </div>
        
        <div className="card">
          <h2>Import danych</h2>
          <p className="text-gray-600">Importuj dane z Allegro Billing CSV</p>
          <div className="mt-4">
            <button className="btn btn-primary">Importuj</button>
          </div>
        </div>
        
        <div className="card">
          <h2>Statystyki produktów</h2>
          <p className="text-gray-600">Zobacz, które produkty przynoszą największy zysk</p>
          <div className="mt-4">
            <button className="btn btn-primary">Szczegóły</button>
          </div>
        </div>
      </div>
      
      <div className="mt-8">
        <div className="card">
          <h2>Ostatnie zamówienia</h2>
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Data</th>
                  <th>Wartość</th>
                  <th>Status</th>
                  <th>Zysk</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>#12345</td>
                  <td>2023-10-15</td>
                  <td>149,99 zł</td>
                  <td>Zrealizowane</td>
                  <td className="text-success">+35,20 zł</td>
                </tr>
                <tr>
                  <td>#12344</td>
                  <td>2023-10-14</td>
                  <td>89,90 zł</td>
                  <td>Zrealizowane</td>
                  <td className="text-success">+19,45 zł</td>
                </tr>
                <tr>
                  <td>#12343</td>
                  <td>2023-10-13</td>
                  <td>299,00 zł</td>
                  <td>W trakcie realizacji</td>
                  <td className="text-warning">Oczekuje</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Home; 