

// export type PropertyData = {
//     property_id: string;
//     name: string;
//     price: string;
//     view_count: number;
//     address: string;
// }

export interface OwnerData {
  id: string;
  first_name: string;
  last_name: string;
  address: string;
  email: string;
  gender: string;
  phone_number: string;
  age: string;
  created_at: string;
  expo_push_token: string;
  status: string;
  properties: [
    id: string,
    property_name: string
  ]
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
  status: "Boarding" | "Request To Leave" | "Left"
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