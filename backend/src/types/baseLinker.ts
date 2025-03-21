// Typy błędów
export interface BaseLinkerError {
  error_code: string;
  error_message?: string;
}

// Typy produktów
export interface BaseLinkerProduct {
  id: string;
  sku: string;
  name: string;
  quantity: number;
  price: number;
  ean: string;
  purchase_price: string;
  prices: {
    [key: string]: number;
  };
  locations: {
    [key: string]: number;
  };
  tax_rate: number;
  weight: number;
  description: string;
  description_extra1: string;
  description_extra2: string;
  images: string[];
  categories: string[];
  features: {
    name: string;
    value: string;
  }[];
  variants: {
    variant_id: string;
    name: string;
    sku: string;
    quantity: number;
    price: number;
  }[];
}

// Typy zamówień
export interface BaseLinkerOrder {
  order_id: string;
  date_add: number;
  date_confirmed: number;
  date_in_status: number;
  user_login: string;
  email: string;
  phone: string;
  status_id: number;
  currency: string;
  payment_method: string;
  payment_method_cod: boolean;
  payment_done: number;
  delivery_method: string;
  delivery_price: number;
  delivery_fullname: string;
  delivery_company: string;
  delivery_address: string;
  delivery_city: string;
  delivery_postcode: string;
  delivery_country: string;
  delivery_point_id: string;
  delivery_point_name: string;
  delivery_point_address: string;
  delivery_point_postcode: string;
  delivery_point_city: string;
  invoice_fullname: string;
  invoice_company: string;
  invoice_nip: string;
  invoice_address: string;
  invoice_city: string;
  invoice_postcode: string;
  invoice_country: string;
  want_invoice: boolean;
  extra_field_1: string;
  extra_field_2: string;
  order_page: string;
  pick_state: number;
  pack_state: number;
  source_id: number;
}

// Typy pozycji zamówienia
export interface BaseLinkerOrderItem {
  order_id: string;
  product_id: string;
  variant_id: string;
  name: string;
  sku: string;
  price_brutto: number;
  tax_rate: number;
  quantity: number;
  weight: number;
}

// Typy dla parametrów zapytań
export interface GetProductsParams {
  page?: number;
  limit?: number;
  inventoryId?: string;
}

export interface GetOrdersParams {
  dateFrom?: number;
  dateTo?: number;
  statusId?: number;
  page?: number;
  limit?: number;
}

// Typy dla odpowiedzi API
export interface BaseLinkerResponse<T> {
  status: 'SUCCESS' | 'ERROR';
  error_code?: string;
  error_message?: string;
  data: T;
}

// Odpowiedź dla listy produktów
export interface ProductsResponseData {
  products: BaseLinkerProduct[];
  total: number;
}

// Odpowiedź dla listy zamówień
export interface OrdersResponseData {
  orders: BaseLinkerOrder[];
  total: number;
}

// Odpowiedź dla szczegółów zamówienia
export interface OrderDetailsResponseData {
  order: BaseLinkerOrder;
  items: BaseLinkerOrderItem[];
}

export type ProductsResponse = BaseLinkerResponse<ProductsResponseData>;
export type OrdersResponse = BaseLinkerResponse<OrdersResponseData>;
export type OrderDetailsResponse = BaseLinkerResponse<OrderDetailsResponseData>; 