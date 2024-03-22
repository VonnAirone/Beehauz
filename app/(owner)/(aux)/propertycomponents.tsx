import { getProfile } from '@/api/DataFetching';
import StarRatingComponent from '@/app/(tenant)/(aux)/starrating';
import { supabase } from '@/utils/supabase';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Text, View, Pressable, TouchableOpacity } from 'react-native';

export const AmenitiesSelection = () => {
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [showSaveButton, setShowSaveButton] = useState(false);

  const toggleAmenity = (amenity: string) => {
    if (selectedAmenities.includes(amenity)) {
      setSelectedAmenities(selectedAmenities.filter(item => item !== amenity));
    } else {
      setSelectedAmenities([...selectedAmenities, amenity]);
    }
    setShowSaveButton(true);
  };

  const saveAmenities = () => {
    console.log('Selected amenities:', selectedAmenities);
    setShowSaveButton(false);
  };

  return (
    <View>
      <View>
        <Text className='text-xl font-semibold'>Amenities</Text>
        <Text className='text-xs mt-1'>Select all that is present in your property.</Text>
      </View>
      
      <View className='flex-row flex-wrap gap-x-2 gap-y-2 mt-1'>
        {["Wifi", "Common CR", "Laundry Area", "Kitchen Area", "Rooms"].map((roomType, index) => (
          <Pressable
            key={index}
            className={`${selectedAmenities.includes(roomType) ? 'bg-yellow ' : 'border border-gray-300'} p-2 rounded-md`}
            onPress={() => toggleAmenity(roomType)}
          >
            <Text>{roomType}</Text>
          </Pressable>
        ))}
      </View>
      {showSaveButton && (
        <TouchableOpacity
          onPress={saveAmenities}
          style={{
            backgroundColor: 'blue',
            padding: 10,
            borderRadius: 8,
            marginTop: 10,
            alignSelf: 'flex-start',
          }}
        >
          <Text style={{ color: 'white' }}>Save</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

export const DashboardComponents = ({id, properties, tenants, bookings}) => {
  const propertyID = properties && properties.length > 0 ? properties[0]?.property_id : null;
  return (
  <View>
    <View className='flex-row items-center justify-around mt-10'>

      <View className='overflow-hidden rounded-md'>
        <Pressable 
         onPress={() => router.push({pathname: "/Properties", params: {property: properties}})} 
        android_ripple={{color: "#ffa233"}}
        className='w-36 p-4 h-32 bg-gray-50 rounded-md'>
          <View className='flex-row items-center gap-x-2'>
            <Ionicons name='storefront' size={18} color={"#ffa233"}/>
            <Text className='font-semibold text-xs'>Properties</Text>
          </View>
          
          <View className='items-center flex-1 justify-center mt-4'>
            {properties ? (
              <Text className='text-5xl text-yellow'>{properties ? properties.length : 0}</Text>   
            ) : (
              <TouchableOpacity 
              onPress={() => router.push("/PropertyCreation")}
              className='items-center flex-1 '>
                <Ionicons name='add-circle-outline' size={32}/>
                <Text>Add a Property</Text>
              </TouchableOpacity>
            )}
          </View>
        </Pressable>
      </View>

      <View className='overflow-hidden rounded-md'>
        <Pressable
        onPress={() => router.push({pathname: "/Tenants", params: {property_id: propertyID}})}
        android_ripple={{color: "#ffa233"}}
        className='w-36 p-4 h-32 bg-gray-50 rounded-md'>
          <View className='flex-row items-center gap-x-2'>
            <Ionicons name='people' size={18} color={"#ffa233"}/>
            <Text className='font-semibold text-xs'>Tenants</Text>
          </View>
          <View className='items-center justify-center flex-1 mt-4'>
            <Text className='text-5xl text-yellow'>{tenants ? tenants.length : 0}</Text>
          </View>
        </Pressable>
      </View>
     
  </View>

  <View className='flex-row items-center justify-around mt-5'>
    <View className='overflow-hidden rounded-md'>
      <Pressable
      onPress={() => router.push({pathname: "/Appointments", params: {property_id: propertyID}})}
      android_ripple={{color: "#ffa233"}}
      className='w-36 p-4 h-32 bg-gray-50 rounded-md'>
        <View className='flex-row items-center gap-x-2'>
          <Ionicons name='calendar' size={18} color={"#ffa233"}/>
          <Text className='font-semibold text-xs'>Bookings</Text>
        </View>
        
        <View className='items-center flex-1 justify-center mt-4'>
          <Text className='text-5xl text-yellow'>{bookings ? bookings.length : 0}</Text>
        </View>
      </Pressable>
    </View>
    
    <View className='w-36 p-4 h-32 bg-gray-50 rounded-md'>
      <View className='flex-row items-center gap-x-2'>
        <Ionicons name='eye' size={18} color={"#ffa233"}/>
        <Text className='font-semibold text-xs'>Views</Text>
      </View>
      <View className='items-center justify-center flex-1 mt-4'>
        <Text className='text-5xl text-yellow'>1</Text>
      </View>
    </View>
  </View>
  </View>
  )
}

export const PropertyReviews = ({reviews}) => {
  const [tenantNames, setTenantNames] = useState({});

  useEffect(() => {
    async function fetchTenantNames() {
      const tenantIds = reviews.map(review => review.tenant_id);
      const names = {};
      for (const id of tenantIds) {
        const userProfile = await getProfile(id);
        names[id] = userProfile?.first_name || 'Unknown';
      }
      setTenantNames(names);
    }

    if (reviews && reviews.length > 0) {
      fetchTenantNames();
    }
  }, [reviews]);
  
  return (
  <View>

    {reviews && reviews.length > 0 ? ( 
      reviews.map((review, index) => (
    <View key={index} className='mt-3 bg-gray-50 rounded-md shadow-lg p-5'>
      <View className='flex-row items-center'>
        <View>
          <View>
            <Text>{tenantNames[review.tenant_id]}</Text>
          </View>
          <View>
            <StarRatingComponent rating={1}/>
          </View>
        </View>
      </View>

      <View className='mt-1'>
        <Text>{review?.review_content}</Text>
      </View>
    </View>
    )) 
    ) : (
      <View className='mt-2 h-40 rounded-md items-center justify-center bg-gray-100'>
        <Text>No Reviews</Text>
      </View>
    )}

  </View>
  )
}


export const AmenityItem = ({ amenity, isChecked, onPress, showChanges }) => {
  return (
    <Pressable onPress={onPress}>
      <View className='flex-row items-center mb-2 gap-x-2'>
        <Ionicons name={isChecked ? 'checkbox-outline' : 'square-outline'} size={20} color="black" />
        <Text className={`${showChanges && !isChecked ? 'line-through' : 'none'}`}>{amenity}</Text>
      </View>
    </Pressable>
  );
};

