export interface Promotion {
  highlighted: boolean;
  urgent: boolean;
  top_ad: boolean;
  options: any[];
  b2c_ad_page: boolean;
  premium_ad_page: boolean;
}

export interface Value {
  value: number;
  type: string;
  arranged: boolean;
  budget: boolean;
  currency: string;
  negotiable: boolean;
  converted_value?: any;
  previous_value?: any;
  converted_previous_value?: any;
  converted_currency?: any;
  label: string;
  key: string;
}

export interface Param {
  key: string;
  name: string;
  type: string;
  value: Value;
}

export interface User {
  id: number;
  created: Date;
  other_ads_enabled: boolean;
  name: string;
  logo?: any;
  logo_ad_page?: any;
  social_network_account_type?: any;
  photo?: any;
  banner_mobile: string;
  banner_desktop: string;
  company_name: string;
  about: string;
  b2c_business_page: boolean;
  is_online: boolean;
  last_seen: Date;
  seller_type?: any;
  uuid: string;
}

export interface Contact {
  name: string;
  phone: boolean;
  chat: boolean;
  negotiation: boolean;
  courier: boolean;
}

export interface Map {
  zoom: number;
  lat: number;
  lon: number;
  radius: number;
  show_detailed: boolean;
}

export interface City {
  id: number;
  name: string;
  normalized_name: string;
}

export interface Region {
  id: number;
  name: string;
  normalized_name: string;
}

export interface Location {
  city: City;
  region: Region;
}

export interface Photo {
  id: any;
  filename: string;
  rotation: number;
  width: number;
  height: number;
  link: string;
}

export interface Partner {
  code: string;
}

export interface Category {
  id: number;
  type: string;
}

export interface Rock {
  offer_id?: any;
  active: boolean;
  mode: string;
}

export interface Delivery {
  rock: Rock;
}

export interface Safedeal {
  weight: number;
  weight_grams: number;
  status: string;
  safedeal_blocked: boolean;
  allowed_quantity: any[];
}

export interface Shop {
  subdomain?: any;
}

export interface Offer {
  id: number;
  url: string;
  title: string;
  last_refresh_time: Date;
  created_time: Date;
  valid_to_time: Date;
  pushup_time?: any;
  description: string;
  promotion: Promotion;
  params: Param[];
  key_params: string[];
  business: boolean;
  user: User;
  status: string;
  contact: Contact;
  map: Map;
  location: Location;
  photos: Photo[];
  partner: Partner;
  external_url: string;
  category: Category;
  delivery: Delivery;
  safedeal: Safedeal;
  shop: Shop;
  offer_type: string;
}

export interface Targeting {
  env: string;
  lang: string;
  account: string;
  dfp_user_id: string;
  user_status: string;
  cat_l0_id: string;
  cat_l1_id: string;
  cat_l2_id: string;
  cat_l0: string;
  cat_l0_path: string;
  cat_l1: string;
  cat_l1_path: string;
  cat_l2: string;
  cat_l2_path: string;
  cat_l0_name: string;
  cat_l1_name: string;
  cat_l2_name: string;
  cat_id: string;
  private_business: string;
  offer_seek: string;
  view: string;
  search_engine_input: string;
  page: string;
  segment: any[];
  app_version: string;
  car_body: string[];
  condition: string[];
  model: string[];
  petrol: string[];
  transmission: string[];
  price: string[];
  year: string[];
}

export interface Config {
  targeting: Targeting;
}

export interface Adverts {
  places?: any;
  config: Config;
}

export interface Source {
  organic: number[];
}

export interface Metadata {
  total_elements: number;
  visible_total_count: number;
  promoted: any[];
  search_id: string;
  adverts: Adverts;
  source: Source;
}

export interface Link {
  href: string;
}

export interface Links {
  self: Link;
  previous?: Link;
  next?: Link;
  first: Link;
}

export interface OlxResponseData {
  data: Offer[];
  metadata: Metadata;
  links: Links;
}
