import React, { ReactNode } from 'react';
import Head from 'next/head';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

interface LayoutProps {
  children: ReactNode;
  title?: string;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  title = 'Allegro Profit Analyzer'
}) => {
  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content="Aplikacja do analizy zysków ze sprzedaży na Allegro" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <div className="min-h-screen flex flex-col">
        <Navbar />
        
        <div className="flex flex-1">
          <Sidebar />
          
          <main className="flex-1 p-6 bg-gray-50">
            {children}
          </main>
        </div>
      </div>
    </>
  );
};

export default Layout; 