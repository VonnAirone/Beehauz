import React, { useEffect, useState, memo, useRef } from 'react';
import { Text, View, Image, FlatList, Dimensions, ActivityIndicator, Pressable } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { fetchPropertyDetailsData } from '@/api/DataFetching';
import { useAuth } from '@/utils/AuthProvider';
import { downloadImage, loadImages } from '@/api/ImageFetching';
import BackButton from '@/components/back-button';
import { Ionicons } from '@expo/vector-icons';
import Reviews from '@/components/reviews';

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
      {/* // style={{ width: screenWidth, height: 200, alignItems: 'center', justifyContent: 'center' }}> */}
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
        <View>
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
          <View className='p-5'>
            <View className='flex-row justify-between'>
              <View>
                <Text className='text-4xl font-semibold'>{data?.property_name}</Text>
                
                {/* LOCATION IS MISSING */}
                <View className='flex-row items-center'>
                  <Ionicons name='location-outline' size={20} color={'#FF8B00'}/>
                  <Text className='text-base'>Catungan 1, Sibalom, Antique</Text>
                </View>
              </View>

              <View className='w-24'>
                <Pressable className='border border-yellow p-3 rounded-md'>
                  <Text className='text-center text-lg'>{data?.price}</Text>
                </Pressable>
              </View>
              
            </View>

            <View>
              <Reviews/>
            </View>
          </View>
        </View>
      {/* )} */}
    </SafeAreaView>
  );
}
