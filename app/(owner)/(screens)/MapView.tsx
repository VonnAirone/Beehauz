import { View, Text, Pressable } from 'react-native';
import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Location from "expo-location";
import MapView, { Marker } from 'react-native-maps';
import { fetchPropertyListData } from '@/api/DataFetching';
import BackButton from '@/components/back-button';
import LoadingComponent from '@/components/LoadingComponent';
import { LocationData, PropertyData } from '@/api/Properties';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function PropertyLocationView() {
  const [properties, setProperties] = useState<PropertyData[]>([])
  const [location, setLocation] = useState<LocationData | null>(null);
  const [address, setAddress] = useState('');
  const [markerPosition, setMarkerPosition] = useState<{ latitude: number, longitude: number } | null>(null);
  const [loading, setLoading] = useState(true)
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
    fetchLocation()
  }, []);

  async function fetchLocation () {
    try {
      setLoading(true)
      await fetchUserLocation();
      await fetchProperties();
    } catch (error) {
      console.log("Error fetching user location: ", error.message)
    } finally {
      setLoading(false)
    }
  }

  async function fetchUserLocation () {
    let { coords } = await Location.getCurrentPositionAsync({});
    setLocation(coords);
    setMarkerPosition(coords);
}


  const handleMarkerDrag = (e) => {
    setMarkerPosition(e.nativeEvent.coordinate);
    console.log(markerPosition)
  };

  return (
    <SafeAreaView className='flex-1'>
      {loading ? (
          <View>
            <LoadingComponent/>
          </View>
      ) : (
        <View>
          <View 
          style={{backgroundColor: "#444"}}
          className='absolute z-10 p-3 top-5 left-5 rounded-md'>
            <Pressable 
              className='w-14'
              onPress={() => router.back()}>
              <View className='flex-row items-center '>
                  <Ionicons name='chevron-back-outline' color={'white'} size={20}/>
                  <Text className='text-white'>Back</Text>
              </View>
            </Pressable>
          </View>
        
          <MapView
          showsMyLocationButton
          showsBuildings={false}
            className='w-full h-full'
            initialRegion={{
              latitude: location.latitude,
              longitude: location.longitude,
              latitudeDelta: 0.005,
              longitudeDelta: 0.005,
            }}
          >
              {location && (
                <Marker
                  coordinate={markerPosition}
                  draggable
                  onDragEnd={handleMarkerDrag}
                />
              )}

          </MapView>
        </View>
      )}
    </SafeAreaView>
  );
}

