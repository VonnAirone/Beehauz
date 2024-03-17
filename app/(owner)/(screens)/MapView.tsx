import { StyleSheet, View, Text, Image } from 'react-native';
import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Location from "expo-location";
import MapView, { Callout, Marker, MarkerAnimated } from 'react-native-maps';
import { fetchPropertyListData } from '@/api/DataFetching';
import { ZoomIn } from 'react-native-reanimated';
import BackButton from '@/components/back-button';
import { useLocalSearchParams } from 'expo-router';

type LocationData = {
  latitude: number;
  longitude: number
}

type PropertyData = {
  property_id: string;
  name: string;
  price: string;
  description: string;
  available_rooms: number;
  latitude: number;
  longitude: number;
  
}

// const PropertyCallout = ({ property } : {property : PropertyData}) => {
//   return (
//     <Callout>
//       <View className='w-80 rounded-full p-5'>
//         <Text style={{ fontWeight: 'bold', fontSize: 16 }}>{property.name}</Text>
//         <Text>{property.description}</Text>
//         <View className='flex-row justify-between items-center mt-5'>
//           <Text className='text-base'>Price: <Text className='font-semibold'>{property.price}</Text></Text>
//           <Text>Available Rooms: {property.available_rooms}</Text>
//         </View>

//       </View>
//     </Callout>
//   );
// };

export default function PropertyLocationView() {
  const [properties, setProperties] = useState<PropertyData[]>([])
  const [location, setLocation] = useState<LocationData | null>(null);
  const [address, setAddress] = useState('');
  const [markerPosition, setMarkerPosition] = useState({ latitude: 10.7198499, longitude: 122.5616936 });
  // const { latitude , longitude } = useLocalSearchParams()

  // const latitudeFloat = parseFloat(latitude.toString());
  // const longitudeFloat = parseFloat(longitude.toString());

  async function fetchProperties() {
    try {
      const data = await fetchPropertyListData() 
      if (data) {
        setProperties(data)
      }
    } catch (error) {
      console.log("Error messages", error.message)
    }
  }

  useEffect(() => {
    getPermissions();
    fetchProperties();
  }, []);

  const getPermissions = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      console.log("Please grant location permissions");
      return;
    }

    let currentLocation = (await Location.getCurrentPositionAsync({})).coords;
    setLocation(currentLocation);
  };

  const handleMarkerDrag = (e) => {
    setMarkerPosition(e.nativeEvent.coordinate);
    console.log(markerPosition)
  };

  return (
    <SafeAreaView className='flex-1'>
      {location ? (
        <View>
          <View className='absolute z-10'>
            <BackButton/>
          </View>
          
          <MapView
          showsMyLocationButton
          showsBuildings={false}
          // showsUserLocation
            className='w-full h-full'
            initialRegion={{
              latitude: location.latitude,
              longitude: location.longitude,
              latitudeDelta: 0.005,
              longitudeDelta: 0.005,
            }}
          >
              <Marker
                coordinate={markerPosition}
                draggable
                onDragEnd={handleMarkerDrag}
              />
          </MapView>


          </View>
      ) : (
        <Text>Loading...</Text>
      )}
    </SafeAreaView>
  );
}

