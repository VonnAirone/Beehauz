import React, { useEffect, useState, memo, useRef } from 'react';
import { Text, View, Image, FlatList, Dimensions, ActivityIndicator, ScrollView, Pressable, Modal } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { fetchPropertyDetailsData } from '@/api/DataFetching';
import { downloadImage, loadImages } from '@/api/ImageFetching';
import BackButton from '@/components/back-button';
import { Ionicons } from '@expo/vector-icons';
import { Amenities, AmenitiesModal, BottomBar, OwnerInformation, Reviews } from '../(aux)/detailscomponent';
import Bookmark from '@/components/bookmarks-button';

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

export default function BHDetails() {
  let { propertyID } = useLocalSearchParams();
  const [data, setData] = useState<DataItem | null>(null);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAmenitiesModal, setShowAmenitiesModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false)
  const [selectedImage, setSelectedImage] = useState(null)
  const hasFetched = useRef(false);

  const openImage = (image) => {
    setSelectedImage(image);
    setShowImageModal(true)
  }

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
    <SafeAreaView className='flex-1 bg-white'>
      {loading ? (
        <View className='flex-1 justify-center items-center'>
          <Text>Loading...</Text>
        </View>
      ) : (
        <ScrollView>
          <View>
            {showAmenitiesModal && (
            <View className='z-20'>
              <AmenitiesModal hideModal={() => setShowAmenitiesModal(false)}/>
            </View>
           )}
          </View>
                
        <View className={`${showAmenitiesModal ? 'opacity-20 z-0' : ''}`}>
          <View className='flex-row justify-between'>
            <BackButton/>
            <Bookmark/>
          </View>

          {images.length > 0 ? (
            <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
              data={images}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => 
              <View className='w-screen h-72'> 
                <Pressable onPress={() => openImage(item)}>
                  <Images item={{...item, propertyID}} />
                </Pressable>
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
                {/* <Pressable 
                  onPress={() => setShowAmenitiesModal(true)}
                  className='mt-1'>
                  <Ionicons name='help-circle-outline'/>
                </Pressable > */}
              </View>
              <View className='mt-2 h-16'>
                {data?.description ? (
                  <Text>
                    {data?.description}
                  </Text>
                ): (
                  <Text>
                    No description
                  </Text>
                )}
              </View>
            </View>

            {/* AMENITIES SECTION*/}
            <View className='mt-5'>
              <View className='flex-row items-center'>
                <Text className='text-xl font-semibold mr-1'>Amenities</Text>
                <Pressable 
                  onPress={() => setShowAmenitiesModal(true)}
                  className='mt-1'>
                  <Ionicons name='help-circle-outline' size={15}/>
                </Pressable >  
              </View>

              <Amenities propertyID={propertyID}/>
            </View>

            {/* MORE PHOTOS SECTION */}
            <View className='mt-5'>
              <Text className='text-xl font-semibold'>More Photos</Text>

              {images.length > 0 ? (
                <View className='h-20 mt-2'>
                <FlatList
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  data={images}
                  keyExtractor={(item, index) => index.toString()}
                  renderItem={({ item }) => 
                  <View className='h-20 w-32 mr-2 rounded-md'>
                    <Pressable onPress={() => openImage(item)}>
                      <Images item={{...item, propertyID}}/>
                    </Pressable>
                  </View>}
                  initialNumToRender={4}
                  maxToRenderPerBatch={5}
                  windowSize={7}
                />
                </View>
              ) : (
                <View style={{ width: screenWidth, height: 20, alignItems: 'center', justifyContent: 'center' }}>
                  <Image
                    style={{ width: screenWidth, height: 20 }}
                    source={require("@/assets/images/no-image-placeholder.png")}
                    resizeMode="cover"
                  />
                </View>
              )}
            </View>

            {/* REVIEWS SECTION */}
            <View className='mt-5'>
              <Text className='text-xl font-semibold'>Reviews</Text>

              <View className='p-5 items-center'>
                <Text>No reviews</Text>
              </View>
            </View>

            {/* OWNER SECTION */}
            <View>
              <OwnerInformation/>
            </View>

            <View className='h-20'>

            </View>

            {showImageModal && (
            <Modal
            animationType="fade"
            visible
            transparent={true}>
            <View className="flex-1 justify-center items-center bg-black bg-opacity-50">
              <View className="w-full h-72 bg-white rounded-lg">
                <Pressable
                  className="absolute top-4 right-4 z-10 bg-white rounded-full"
                  onPress={() => setShowImageModal(!showImageModal)}
                >
                  <Ionicons name='close-outline' size={20} />
                </Pressable>

                <View>
                  <Images
                    item={{...selectedImage, propertyID}}
                  />
                </View>
              </View>
            </View>
          </Modal>
            )}

            
          </View>
        </View>
        
        
      </ScrollView>
      )}

      <BottomBar price={data?.price} propertyID={propertyID}/>
    </SafeAreaView>
  );
}
