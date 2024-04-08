import { View, Text, TextInput, Pressable, Image } from 'react-native';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Location from "expo-location";
import MapView, { Callout, MarkerAnimated } from 'react-native-maps';
import { fetchPropertyListData } from '@/api/DataFetching';
import { SingleImageDisplay } from '../(aux)/homecomponents';
import { ZoomIn } from 'react-native-reanimated';
import LoadingComponent from '@/components/LoadingComponent';
import BottomSheet, { BottomSheetModalProvider, BottomSheetView } from '@gorhom/bottom-sheet';
import { Ionicons } from '@expo/vector-icons';
import { FlatList } from 'react-native-gesture-handler';

type LocationData = {
  latitude: number;
  longitude: number
}

type PropertyData = {
  property_id: string;
  name: string;
  price: string;
  description: string;
  available_beds: number;
  latitude: number;
  longitude: number;
  
}

const PropertyCallout = ({ property } : {property : PropertyData}) => {
  return (
    <Callout>
      <View className='w-80 rounded-full p-5'>
        <View className='flex-row items-center justify-between mb-2'>

          <Text style={{ fontWeight: 'bold', fontSize: 16 }}>{property.name}</Text>

          <Pressable 
          onPress={() => console.log("Pressed!")}
          // onPress={() => router.push({pathname: "/(tenant)/(screens)/BHDetails", params: {propertyID:  property.property_id}})}
          className='flex-row items-center'>
            <Text>View Property</Text>
            <Ionicons name='chevron-forward-outline'/>
          </Pressable>
        </View>
        
        <Text>{property.description}</Text>
        <View className='flex-row justify-between items-center mt-5'>
          <Text className='text-base'>Price: <Text className='font-semibold'>{property.price}</Text></Text>
          <Text>Available Beds: {property.available_beds}</Text>
        </View>
      </View>
    </Callout>
  );
};

export default function map() {
  const [properties, setProperties] = useState([])
  const [location, setLocation] = useState<LocationData | null>(null);
  const [loading, setLoading] = useState(true)
  const bottomSheetRef = useRef<BottomSheet>(null);

  const snapPoints = useMemo(() => ['25%', '50%'], []);

  const handleSheetChanges = useCallback((index: number) => {
    console.log('handleSheetChanges', index);
  }, []);

  const mapRef = useRef(null);

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
    async function fetchData() {
      try {
        setLoading(true)
        fetchUserLocation();
        fetchProperties();
      } catch (error) {
        console.log("Error fetching location data: ", error.message)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
    console.log(location)
  }, []);


  async function fetchUserLocation () {
    let currentLocation = (await Location.getCurrentPositionAsync({})).coords;
    setLocation(currentLocation)
  }

  const goToProperty = (property) => {
    if (mapRef.current && property) {
      const { latitude, longitude } = property;
      mapRef.current.animateToRegion({
        latitude,
        longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      });
    }
  };
  

  return (
    <BottomSheetModalProvider>
      <SafeAreaView className='flex-1'>
        {loading ? (
          <LoadingComponent/>
        ) : (
          <View>
            <MapView
            ref={mapRef}
            showsMyLocationButton
            showsBuildings={false}
            showsUserLocation
              className='w-full h-full'
              initialRegion={{
                latitude: 10.790317,
                longitude: 122.007448,
                latitudeDelta: 0.001,
                longitudeDelta: 0.001,
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
          </MapView>

          <BottomSheet
          ref={bottomSheetRef}
          backgroundStyle={{backgroundColor:"#444"}}
          index={0}
          snapPoints={snapPoints}
          onChange={handleSheetChanges}
          >
            <BottomSheetView>
              <View className='p-5'>
                <View>
                  <Text className='font-medium text-white'>List of Properties</Text>
                </View>

                <View className='mt-4'>
                  <FlatList
                  showsHorizontalScrollIndicator={false}
                  horizontal
                  data={properties}
                  renderItem={({item, index}) => (
                    <Pressable 
                    onPress={() => goToProperty(item)}
                    className='mr-4'>
                      <View className='h-32 w-32'>
                        <SingleImageDisplay propertyID={item.property_id}/>
                      </View>

                      <View className='mt-2'>
                        <Text className='font-semibold text-white'>{item.name}</Text>
                        <Text className='text-xs text-white'>Available Beds: {item.available_beds}</Text>
                        <Text className='mt-1 font-medium text-white'>{item.price} per month</Text>
                      </View>
                    </Pressable>
                  )}/>
                </View>
                
                
              </View>
            </BottomSheetView>

          </BottomSheet>
            
          

          </View>
        )}
      </SafeAreaView>
    </BottomSheetModalProvider>
  );
}

