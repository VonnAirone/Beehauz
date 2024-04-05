import { getProfile } from '@/api/DataFetching';
import StarRatingComponent from '@/app/(tenant)/(aux)/starrating';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Text, View, Pressable, TouchableOpacity, FlatList } from 'react-native';

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

    <View className='overflow-hidden rounded-md mt-3'>
      <Pressable 
        onPress={() => router.push({pathname: "/two", params: {property: properties}})} 
      android_ripple={{color: "#444"}}
      className='p-4 h-32 bg-gray-50 rounded-md'>
        <View className='flex-row items-center gap-x-2'>
          <Ionicons name='storefront' size={18} color={"#444"}/>
          <Text className='font-semibold text-xs'>Property</Text>
        </View>
        
        <View className='items-center flex-1 justify-center'>
          {properties ? (
            <Text>{properties[0].name}</Text>   
          ) : (
            <TouchableOpacity 
            onPress={() => router.push("/PropertyCreation")}
            className='items-center flex-1 '>
              <Ionicons name='add-circle-outline' size={32}/>
              <Text className='mt-3'>Add a Property</Text>
            </TouchableOpacity>
          )}
        </View>
      </Pressable>
    </View>

    <View className='flex-row items-center justify-between mt-5'>
      <View className='overflow-hidden rounded-md w-36'>
        <Pressable
        onPress={() => router.push({pathname: "/Appointments", params: {property_id: propertyID}})}
        android_ripple={{color: "#444"}}
        className='p-4 h-32 bg-gray-50 rounded-md'>
          <View className='flex-row items-center gap-x-2'>
            <Ionicons name='calendar' size={18} color={"#444"}/>
            <Text className='font-semibold text-xs'>Appointments</Text>
          </View>
          
          <View className='items-center flex-1 justify-center mt-4'>
            <Text className='text-5xl text-yellow'>{bookings ? bookings.length : 0}</Text>
          </View>
        </Pressable>
      </View>
      
      <View className='overflow-hidden rounded-md w-36'>
        <Pressable
        onPress={() => router.push("/(owner)/(tabs)/Tenants")}
        android_ripple={{color: "#444"}}
        className='grow p-4 h-32 bg-gray-50 rounded-md'>
          <View className='flex-row items-center gap-x-2'>
            <Ionicons name='people' size={18} color={"#444"}/>
            <Text className='font-semibold text-xs'>Tenants</Text>
          </View>
          <View className='items-center justify-center flex-1 mt-4'>
            <Text className='text-5xl text-yellow'>{tenants ? tenants.length : 0}</Text>
          </View>
        </Pressable>
      </View>
    </View>
  </View>
  )
}

export const PropertyReviews = ({ reviews }) => {
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
  
  if (!reviews || reviews.length === 0) {
    return <Text>No reviews found</Text>;
  }

  return (
    <View>
      <FlatList
      horizontal
      data={reviews}
      renderItem={({ item, index }) => (
      <View key={index} className='mt-3 bg-gray-50 rounded-md shadow-lg p-5 w-80'>
        <View className='flex-row items-center'>
          <View>
            <View>
              <Text className='font-semibold'>{tenantNames[item.tenant_id]}</Text>
            </View>
            <View>
              <StarRatingComponent rating={1} />
            </View>
          </View>
        </View>

        <View className='mt-1'>
          <Text>{item?.review_content}</Text>
        </View>
      </View>
      )}
      />
    </View>
  );
};



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

