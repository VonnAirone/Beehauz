import React, { useEffect, useState, memo, useRef } from 'react';
import { Text, View, Image, FlatList, Dimensions, ActivityIndicator, ScrollView, Pressable } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { fetchPropertyDetailsData } from '@/api/DataFetching';
import { downloadImage, loadImages } from '@/api/ImageFetching';
import BackButton from '@/components/back-button';
import { Ionicons } from '@expo/vector-icons';
import { Amenities, AmenitiesModal, BottomBar, Reviews } from '../(aux)/detailscomponent';

const screenWidth = Dimensions.get('window').width;

interface DataItem {
  property_id: string;
  property_name: string;
  price: string;
  view_count: number;
}

// Memoized Image Component
const Images = memo(({ item } : {item : any}) => {
  const [image, setImage] = useState<string | null>(null);

  useEffect(() => {
    downloadImage(item.propertyID, item.name, setImage);
  }, [item.propertyID, item.name]);

  if (!image) {
    return (
      <View 
      className='w-screen h-72'>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <Image
      className='w-screen h-72'
      source={{ uri: image }}
      resizeMode="cover"
    />
  );
});

export default function BHDetails() {
  let { propertyID } = useLocalSearchParams();
  const [data, setData] = useState<DataItem | null>(null);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAmenitiesModal, setShowAmenitiesModal] = useState(true);
  const hasFetched = useRef(false);


  useEffect(() => {
    if (!hasFetched.current) {
    async function fetchData() {
      setLoading(true);
      try {
        const fetchedData = await fetchPropertyDetailsData(propertyID.toString());
        setData(fetchedData);
        await loadImages(propertyID, setImages);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }}, [propertyID]);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      {/* {loading ? (
        <Text>Loading...</Text>
      ) : ( */}
      
            {showAmenitiesModal && (
            <View className='absolute z-10 h-full w-full items-center justify-center'>
              <AmenitiesModal hideModal={() => setShowAmenitiesModal(false)}/>
            </View>
           )}
        
                
        <View className={`${showAmenitiesModal ? 'opacity-20' : ''}`}>
          <BackButton/>
          {images.length > 0 ? (
            <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
              data={images}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => <Images item={{...item, propertyID}} />}
              initialNumToRender={4}
              maxToRenderPerBatch={5}
              windowSize={7}
            />
          ) : (
            <View style={{ width: screenWidth, height: 200, alignItems: 'center', justifyContent: 'center' }}>
              <Image
                style={{ width: screenWidth, height: 200 }}
                source={require("@/assets/images/no-image-placeholder.png")}
                resizeMode="cover"
              />
            </View>
          )}
          <View className='mx-5 mt-5'>

            <View>
              <Text className='text-4xl font-semibold'>{data?.property_name}</Text>
            </View>
            
              {/* LOCATION IS MISSING */}
            <View className='flex-row items-center'>
              <Ionicons name='location-outline' size={15} color={'#FF8B00'}/>
              <Text className='text-base'>Catungan 1, Sibalom, Antique</Text>
            </View>

            <View className='mt-1'>
              <Reviews/>
            </View>
            
            {/* DESCRIPTION SECTION */}
            <View className='mt-5'>
              <View className='flex-row items-center gap-x-1'>
                <Text className='text-xl font-semibold'>Description</Text>
                <Pressable 
                  onPress={() => setShowAmenitiesModal(true)}
                  className='mt-1'>
                  <Ionicons name='help-circle-outline'/>
                </Pressable >
                
              </View>
              <View className='mt-2'>
                <Text>Discover the perfect blend of comfort and community at Sunset Haven Boarding House. Nestled in a quiet neighborhood, our cozy boarding house offers a home-away-from-home experience for individuals seeking a convenient and communal living space.</Text>
              </View>
            </View>

            {/* AENITIES SECTION*/}
            <View className='mt-5'>
              <Amenities propertyID={propertyID}/>
            </View>

            <View className='bg-white rounded-md p-5'>
              <View>
                <Text className='text-lg'>Owned by <Text className='font-semibold'>Airone Vonn</Text></Text>
                <Text className='text-gray-500'>Joined last February 2024</Text>
              </View>
            </View>

            {/* <View className='border-t border-gray-300 my-5'></View> */}
            
          </View>
        </View>

        <BottomBar price={data?.price}/>
      {/* )}  */}
    </SafeAreaView>
  );
}
