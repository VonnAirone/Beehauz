export interface OwnerData {
    first_name: string;
    last_name: string;
    address: string;
    email: string;
    gender: string;
    phone_number: string;
    age: string;
}

export type PropertyData = {
    property_id: string;
    name: string;
    price: string;
    view_count: number;
    address: string;
}

export type ReviewData = {
    property_id: string;
    tenant_id: string;
    review_content: string;
    rating: string;
}

export interface DataItem {
  property_id: string;
  name: string;
  price: string;
  view_count: number;
  description: string;
  owner_id: string;
  latitude: number,
  longitude: number,
  address: string,
}
