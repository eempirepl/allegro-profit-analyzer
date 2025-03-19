export interface Product {
  id: string;
  sku: string;
  ean: string;
  name: string;
  quantity: number;
  price: number;
  tax_rate: number;
  weight: number;
  description: string;
  description_extra1: string;
  description_extra2: string;
  description_extra3: string;
  description_extra4: string;
  man_name: string;
  man_image: string;
  category_id: string;
  images: string[];
  features: Record<string, string>;
  variants: Record<string, any>;
  options: Record<string, any>;
  text_fields: {
    name: string;
    description: string;
  };
  average_cost: number | null;
  stock: Record<string, number>;
}

export interface Order {
  order_id: string;
  external_order_id: string;
  order_source: string;
  order_source_id: string;
  order_status_id: string;
  date_add: number;
  date_confirmed: number;
  date_in_status: number;
  user_login: string;
  phone: string;
  email: string;
  user_comments: string;
  admin_comments: string;
  currency: string;
  payment_method: string;
  payment_method_cod: boolean;
  payment_done: number;
  delivery_method: string;
  delivery_price: string;
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
  custom_extra_fields: Record<string, string>;
  order_page: string;
  products: OrderProduct[];
}

export interface OrderProduct {
  storage: string;
  storage_id: string;
  order_product_id: string;
  product_id: string;
  variant_id: string;
  name: string;
  sku: string;
  ean: string;
  location: string;
  warehouse_id: string;
  attributes: string;
  price_brutto: string;
  tax_rate: string;
  quantity: number;
  weight: number;
  bundle_id: string;
}

export interface OrderItem {
  order_id: string;
  product_id: string;
  name: string;
  price_brutto: string;
  tax_rate: string;
  quantity: number;
  currency: string;
  value_in_pln: string;
  auction_id: string;
} 