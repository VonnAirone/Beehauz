import { StyleSheet, View, Text, Image } from 'react-native';
import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Location from "expo-location";
import MapView, { Callout, Marker, MarkerAnimated } from 'react-native-maps';
import { fetchPropertyListData } from '@/app/api/DataFetching';
import { Images, SingleImageDisplay } from '../(aux)/homecomponents';
import { ZoomIn } from 'react-native-reanimated';
import BackButton from '@/app/components/back-button';
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

const PropertyCallout = ({ property } : {property : PropertyData}) => {
  return (
    <Callout>
      <View className='w-80 rounded-full p-5'>
        <Text style={{ fontWeight: 'bold', fontSize: 16 }}>{property.name}</Text>
        <Text>{property.description}</Text>
        <View className='flex-row justify-between items-center mt-5'>
          <Text className='text-base'>Price: <Text className='font-semibold'>{property.price}</Text></Text>
          <Text>Available Rooms: {property.available_rooms}</Text>
        </View>

      </View>
    </Callout>
  );
};

export default function PropertyLocationView() {
  const [properties, setProperties] = useState<PropertyData[]>([])
  const [location, setLocation] = useState<LocationData | null>(null);
  const [address, setAddress] = useState('');
  const [markerPosition, setMarkerPosition] = useState({ latitude: 10.7198499, longitude: 122.5616936 });
  const params = useLocalSearchParams()

  const latitudeFloat = parseFloat(params.latitude.toString());
  const longitudeFloat = parseFloat(params.longitude.toString());

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
    console.log(params)
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

  const handleAddressChange = (text) => {
    setAddress(text);
  }

  const handleMarkerDrag = (e) => {
    setMarkerPosition(e.nativeEvent.coordinate);
  };

  return (
    <SafeAreaView className='flex-1'>
      {location ? (
        <View>
          <View className='absolute z-10 left-5 top-5'>
            <BackButton/>
          </View>
          
          <MapView
          showsMyLocationButton
          showsBuildings={false}
          // showsUserLocation
            className='w-full h-full'
            initialRegion={{
              latitude: latitudeFloat,
              longitude: longitudeFloat,
              latitudeDelta: 0.005,
              longitudeDelta: 0.005,
            }}
          >

            {properties.map(property => (
              <MarkerAnimated 
              onPress={() => ZoomIn}
              key={property?.property_id} coordinate={{latitude: property?.latitude, longitude: property?.longitude}}>
                <View className='justify-center items-center'>
                    <View 
                    style={{backgroundColor: "#444"}}
                    className='rounded-md p-2'>
                      <Text className='text-center text-white text-xs'>{property.name}</Text>
                    </View>
                   
                    <View className='h-12 w-12'>
                      <Image 
                      style={{width: '100%', height: "100%"}}
                      source={require("@/assets/custom-pin.png")}/>
                    </View>
                  </View>

                <PropertyCallout property={property} />
              </MarkerAnimated>
            ))}

              {/* <Marker
                coordinate={markerPosition}
                draggable
                onDragEnd={handleMarkerDrag}
              /> */}
          </MapView>


          </View>
      ) : (
        <View className='flex-1 items-center justify-center'>
          <Text>Loading...</Text>
        </View>
        
      )}
    </SafeAreaView>
  );
}

