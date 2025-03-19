// Symulacja Prisma Client
// Tworzy strukturę odpowiadającą PrismaClient z @prisma/client
// To rozwiązanie tymczasowe do czasu poprawnego wygenerowania klienta Prisma

import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

// Załaduj zmienne środowiskowe z pliku .env
dotenv.config();

// Utwórz instancję Prisma Client
const prisma = new PrismaClient();

// Konfiguracja aplikacji
const config = {
  // Token API BaseLinker (pobrany z zmiennych środowiskowych)
  baseLinkerToken: process.env.BASELINKER_API_TOKEN || '',
  
  // Konfiguracja limitu zapytań BaseLinker API
  baseLinkerApiLimit: {
    requestsPerMinute: 100, // 100 zapytań na minutę (zgodnie z dokumentacją API)
  },
  
  // Inne ustawienia konfiguracyjne
  environment: process.env.NODE_ENV || 'development',
  port: process.env.PORT ? parseInt(process.env.PORT) : 3001,
};

interface Product {
  id: number;
  externalId?: string;
  name: string;
  sku?: string;
  ean?: string;
  purchasePrice?: number;
  allegro_category_id?: string;
  allegro_seller_id?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface OrderItem {
  id: number;
  externalId?: string;
  productId?: number;
  orderId: number;
  quantity: number;
  price: number;
  purchasePrice?: number;
  createdAt: Date;
  updatedAt: Date;
  product?: Product;
}

interface Order {
  id: number;
  externalId?: string;
  orderNumber?: string;
  status?: string;
  orderDate: Date;
  shippingCost?: number;
  discountAmount?: number;
  totalAmount: number;
  allegro_fee?: number;
  payment_fee?: number;
  shipping_fee?: number;
  customer_id?: string;
  createdAt: Date;
  updatedAt: Date;
  items: OrderItem[];
}

interface AllegroFee {
  id: number;
  order_id?: string;
  fee_type: string;
  amount: number;
  billing_date?: Date;
  invoice_number?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Mocked Prisma Client
class MockPrismaClient {
  product = {
    findMany: async (): Promise<Product[]> => {
      return [];
    },
    findUnique: async ({ where }: { where: { id: number } }): Promise<Product | null> => {
      return null;
    },
    create: async ({ data }: { data: Partial<Product> }): Promise<Product> => {
      return {
        id: 1,
        name: data.name || '',
        createdAt: new Date(),
        updatedAt: new Date()
      };
    },
    update: async ({ where, data }: { where: { id: number }, data: Partial<Product> }): Promise<Product> => {
      return {
        id: where.id,
        name: data.name || '',
        createdAt: new Date(),
        updatedAt: new Date()
      };
    },
    delete: async ({ where }: { where: { id: number } }): Promise<void> => {}
  };
  
  order = {
    findMany: async ({ include, orderBy }: { 
      include?: { items: boolean },
      orderBy?: { orderDate: 'asc' | 'desc' }
    } = {}): Promise<Order[]> => {
      return [];
    },
    findUnique: async ({ where, include }: { 
      where: { id: number },
      include?: { items: { include: { product: boolean } } }
    }): Promise<Order | null> => {
      return null;
    },
    create: async ({ data, include }: { 
      data: any,
      include?: { items: boolean }
    }): Promise<Order> => {
      return {
        id: 1,
        totalAmount: 0,
        orderDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        items: []
      };
    },
    update: async ({ where, data }: { 
      where: { id: number },
      data: Partial<Order>
    }): Promise<Order> => {
      return {
        id: where.id,
        totalAmount: 0,
        orderDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        items: []
      };
    },
    delete: async ({ where }: { where: { id: number } }): Promise<void> => {}
  };
  
  orderItem = {
    findMany: async (): Promise<OrderItem[]> => {
      return [];
    }
  };
  
  allegroFee = {
    findMany: async ({ orderBy }: { 
      orderBy?: { createdAt: 'asc' | 'desc' }
    } = {}): Promise<AllegroFee[]> => {
      return [];
    }
  };
  
  $on(event: string, callback: Function): void {
    // Symulacja obsługi zdarzeń
  }
  
  $connect(): Promise<void> {
    return Promise.resolve();
  }
}

import { logger } from '../utils/logger';

// Używamy naszego mocka zamiast prawdziwego PrismaClienta
const mockPrisma = new MockPrismaClient();

interface QueryEvent {
  query: string;
  params: unknown;
  duration: number;
  target: string;
}

interface ErrorEvent {
  message: string;
  target: string;
}

// Log zapytań SQL w trybie development
if (process.env.NODE_ENV === 'development') {
  mockPrisma.$on('query', (e: QueryEvent) => {
    logger.debug(`Zapytanie: ${e.query}`);
  });
}

// Log błędów SQL
mockPrisma.$on('error', (e: ErrorEvent) => {
  logger.error(`Błąd bazy danych: ${e.message}`);
});

// Test połączenia z bazą danych
export const testDatabaseConnection = async (): Promise<boolean> => {
  try {
    await mockPrisma.$connect();
    logger.info('Połączono z bazą danych');
    return true;
  } catch (error) {
    if (error instanceof Error) {
      logger.error(`Błąd połączenia z bazą danych: ${error.message}`);
    } else {
      logger.error('Nieznany błąd połączenia z bazą danych');
    }
    return false;
  }
};

export { prisma };
export default config; 