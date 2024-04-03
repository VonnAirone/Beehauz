export interface UserData {
    id: string;
    first_name: string;
    last_name: string;
    address: string;
    email: string;
    gender: string;
    phone_number: number;
    age: string;
    description: string;
    date_joined: string;
}

// export type PropertyData = {
//     property_id: string;
//     name: string;
//     price: string;
//     view_count: number;
//     address: string;
// }

export interface OwnerData {
  first_name: string;
  last_name: string;
  address: string;
  email: string;
  gender: string;
  phone_number: string;
  age: string;
  created_at: string;
}


export type AppointmentData = {
    appointment_id: string;
    tenant_id: string;
    property_id: string;
    appointment_date: string;
    appointment_time: string;
    status: "Pending" | "Approved" | "Rejected" | "Finished" | "Cancelled"
    type: "Visit" | "Book"
}

export type ReviewData = {
    property_id: string;
    tenant_id: string;
    review_content: string;
    rating: string;
}

export type TenantsData = {
  property_id: string;
  tenant_id: string;
  status: "Active" | "Left"
}

export type PropertyData = {
  property_id: string;
  name: string;
  price: number;
  view_count: number;
  description: string;
  owner_id: string;
  latitude: number,
  longitude: number,
  address: string,
  available_beds: number,
}

export type PropertyTerms = {
  property_id: string;
  advance_payment: string;
  security_deposit: string;
  minimum_stay: string;
  electricity_bill: string;
  water_bills: string;
}


export interface MessageInfoData {
  message_id: string;
  room_id: string;
  sender_id: string;
  receiver_id: string;
  message_content: string;
  time_sent: string;
  sender_info: {
    senderId: string;
    name: string;
    propertyName: string;
  };
}

export type LocationData = {
  latitude: number;
  longitude: number
}