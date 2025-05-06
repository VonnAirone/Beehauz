import { Pressable, Text, View, Modal } from 'react-native'
import React, { useEffect, useState } from 'react'
import { supabase } from '@/utils/supabase'
import { router } from 'expo-router'


//   async function insertAmenity() {
//     try {
//     const { data, error } = await supabase
//       .from('property_amenities')
//       .insert([
//           { property_id: propertyID, amenity_name: 'WiFi', availability: true, description: 'High-speed Internet' },
//           { property_id: propertyID, amenity_name: 'Common CR', availability: true, description: 'The comfort room is accessible for everyone.' }
//       ]);

//     if (error) {
//       console.error('Error:', error);
//     } else {
//       console.log('Amenity added successfully:', data);
//       alert('Amenity added successfully!');
//     }
//     } catch (error) {
//       console.error('Error:', error.message);
//     }
//   }

export async function fetchAmenities(propertyID, setAmenities) {
  try {
    const {data, error} = await supabase
    .from('amenities')
    .select('*')
    .eq('property_id', propertyID)
    if (error) {
        console.log('Error message', error.message)
    } else {
    setAmenities(data)
    }
  } catch (error) {
    console.log("Error fetching amenities: ", error.message)
  }
}

export async function hasExistingCommitment(userId) {
  const { data: appointments, error: appointmentError } = await supabase
    .from('appointments')
    .select('*')
    .eq('tenant_id', userId)
    .in('status', ['Pending', 'Approved']);
  const { data: rentals, error: rentalError } = await supabase
    .from('rentals')
    .select('*')
    .eq('tenant_id', userId)
    .in('status', ['Pending', 'Pending Payment', 'Payment Successful',]);

  if (appointmentError || rentalError) {
    console.error('Error checking existing commitments:', appointmentError || rentalError);
    return true;
  }
  return appointments.length > 0 || rentals.length > 0;
}


export function BottomBar({ userID, price, propertyID, propertyName, tenantStatus, ownerID, ownerPushToken }) {
  const [showModal, setShowModal] = useState(false);

  
  async function handleVisit() {
    if (tenantStatus?.property_id) {
      setShowModal(true);
    } else {
      const hasCommitment = await hasExistingCommitment(userID);
      if (hasCommitment) {
        setShowModal(true);
      } else {
        router.push({ pathname: "/(tenant)/(screens)/VisitScreen", params: { propertyID, propertyName, ownerID, ownerPushToken } });
      }
    }
  }

  async function handleReserve() {
    if (tenantStatus?.property_id) {
      setShowModal(true);
    } else {
      const hasCommitment = await hasExistingCommitment(userID);
      if (hasCommitment) {
        setShowModal(true);
      } else {
        router.push({ pathname: "/(tenant)/(screens)/ReservationScreen", params: { propertyID, propertyName, ownerID } });
      }
    }
  }

  return (
    <View style={{ backgroundColor: "#ff8b00" }} className="absolute bottom-0 left-0 z-50 w-full h-16 py-2 px-6 flex-row items-center justify-between">
      <Modal
      className="flex-1 items-center justify-center"
      transparent={true}
      visible={showModal}
      onRequestClose={() => setShowModal(false)}>
        <Pressable
            onPress={() => setShowModal(false)}
            className="bg-white border border-red-500 w-80 self-center rounded-md p-5">
          <Text className="text-center">
              {tenantStatus?.property_id
                  ? 'You are currently boarding. Only non-boarders can request a visit appointment or create a reservation.'
                  : 'You have ongoing appointments. Please complete them before making a new one.'}
          </Text>
        </Pressable>
      </Modal>


      <View>
        <Text className="text-white">Rental Price</Text>
        <Text className="text-base font-semibold text-white">{price} / month</Text>
      </View>

      <View className="flex-row items-center gap-x-2">
        <View className="overflow-hidden rounded-md">
          <Pressable
            onPress={handleVisit}
            android_ripple={{ color: "#FDFDD9" }}
            className="border border-white p-3 rounded-md"
          >
            <Text className="text-white">Pay a Visit</Text>
          </Pressable>
        </View>

        <View className="overflow-hidden rounded-md">
          <Pressable
            onPress={handleReserve}
            android_ripple={{ color: "#444" }}
            className="bg-white p-3 rounded-md"
          >
            <Text>Reserve Now</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
