export interface BaseLinkerError {
  error_code: string;
  error_message?: string;
}

export interface ProductsResponseData {
  status: string;
  data: {
    products: Array<{
      id: string;
      name: string;
      sku?: string;
      ean?: string;
      purchase_price?: number;
      [key: string]: any;
    }>;
  };
}

export interface OrdersResponseData {
  status: string;
  orders: Array<{
    order_id: string;
    date_add: number;
    [key: string]: any;
  }>;
}

export interface OrderDetailsResponseData {
  order: {
    order_id: string;
    date_add: number;
    [key: string]: any;
  };
  items: Array<{
    id: string;
    product_id: string;
    name: string;
    quantity: number;
    price: number;
    [key: string]: any;
  }>;
}

export interface InventoriesResponseData {
  status: string;
  inventories: Array<{
    inventory_id: number;
    name: string;
    description: string;
    languages: string[];
    default_language: string;
    price_groups: number[];
    default_price_group: number;
    warehouses: string[];
    default_warehouse: string;
    reservations: boolean;
    is_default: boolean;
  }>;
} 