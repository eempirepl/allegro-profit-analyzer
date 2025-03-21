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

// Typ dla szczegółowych danych produktu
export interface BaseLinkerProductDetail {
  is_bundle: boolean;
  ean: string;
  ean_additional?: {
    ean: string;
    quantity: number;
  }[];
  sku: string;
  tags: string[];
  tax_rate: number;
  weight: number;
  height: number;
  width: number;
  length: number;
  star: number;
  category_id: string;
  manufacturer_id: string;
  prices: Record<string, number>;
  stock: Record<string, number>;
  locations: Record<string, string>;
  text_fields: Record<string, any>;
  average_cost?: number;
  average_landed_cost?: number;
  bundle_products?: Record<string, number>;
  images: Record<string, string>;
  links: Record<string, {
    product_id: string;
    variant_id: string;
  }>;
  variants: Record<string, {
    name: string;
    sku: string;
    ean: string;
    prices: Record<string, number>;
    stock: Record<string, number>;
    locations: Record<string, string>;
  }>;
  stock_erp_units?: Record<string, {
    quantity: number;
    purchase_cost: number;
    expiry_date: string;
  }[]>;
  stock_wms_units?: Record<string, {
    quantity: number;
    location: string;
    expiry_date: string;
    batch: string;
    serial_no: string;
  }[]>;
}

// Typ dla podstawowych danych produktu z listy
export interface BaseLinkerProductBasic {
  product_id: string;
  sku: string;
  ean: string;
  name: string;
  quantity: number;
  price: number;
  prices: Record<string, number>;
  stock: Record<string, number>;
  category_id: string;
  manufacturer_id: string;
  variants: Record<string, {
    variant_id: string;
    name: string;
    sku: string;
    ean: string;
    quantity: number;
    price: number;
    prices: Record<string, number>;
    stock: Record<string, number>;
  }>;
}

// Odpowiedź z listy produktów
export interface ProductsListResponse {
  status: string;
  products: Record<string, BaseLinkerProductBasic>;
}

// Odpowiedź ze szczegółami produktów
export interface ProductsDataResponse {
  status: string;
  products: Record<string, BaseLinkerProductDetail>;
} 