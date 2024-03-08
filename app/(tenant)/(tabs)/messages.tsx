import React, { useEffect, useState, memo, useRef } from 'react';
import { Text, View, Image, FlatList, Dimensions, ActivityIndicator, ScrollView, Pressable, Modal } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { fetchPropertyDetailsData } from '@/api/DataFetching';
import { downloadImage, loadImages } from '@/api/ImageFetching';
import BackButton from '@/components/back-button';
import { Ionicons } from '@expo/vector-icons';
import { Amenities, AmenitiesModal, BottomBar, OwnerInformation, Reviews } from '../(aux)/detailscomponent';
import Bookmark from '@/components/bookmarks-button';
import { handlePropertyClick } from '@/api/ViewCount';

const screenWidth = Dimensions.get('window').width;

interface DataItem {
  property_id: string;
  property_name: string;
  price: string;
  view_count: number;
  description: string;
}

const Images = memo(({ item } : {item : any}) => {
  const [image, setImage] = useState<string | null>(null);

  useEffect(() => {
    downloadImage(item.propertyID, item.name, setImage);
  }, [item.propertyID, item.name]);

  if (!image) {
    return (
      <View 
      className='flex-1'>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <Image
      className='w-full h-full'
      source={{ uri: image }}
      resizeMode="cover"
    />
  );
});

const handleCardPress = async (propertyID: string) => {
  try {
    await handlePropertyClick(propertyID);
  } catch (error) {
    console.error('Error handling property click:', error);
  } 
 router.push({pathname: "/(tenant)/(screens)/BHDetails", params: {propertyID: propertyID}})
};


export default function BHDetails() {
  let propertyID  = "31b5dc93-c6ae-4cde-9490-dd017cca5a92"
  const [data, setData] = useState<DataItem | null>(null);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const hasFetched = useRef(false);

  useEffect(() => {
    if (!hasFetched.current) {
    async function fetchData() {
      setLoading(true);
      try {
        const fetchedData = await fetchPropertyDetailsData("31b5dc93-c6ae-4cde-9490-dd017cca5a92");
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
    <SafeAreaView className='flex-1 bg-white'>
      {loading ? (
        <Text>Loading...</Text>
      ) : (
        <View>
          {images.length > 0 ? (
            <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
              data={images}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => 
              <View className='w-screen h-72'> 
                  <Images item={{...item, propertyID}} />
              </View>}
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
         </View>
      )}
    </SafeAreaView>
  );
}
