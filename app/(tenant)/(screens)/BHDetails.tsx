import React, { useEffect, useState, useRef } from 'react';
import { Text, View, Image, FlatList, Dimensions, ScrollView, Pressable, Modal, TouchableOpacity } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { fetchPropertyDetailsData, getPropertyReviews } from '@/api/DataFetching';
import { loadImages } from '@/api/ImageFetching';
import BackButton from '@/components/back-button';
import { Ionicons } from '@expo/vector-icons';
import { Amenities, AmenitiesModal, BottomBar, OwnerInformation } from '../(aux)/detailscomponent';
import Bookmark from '@/components/bookmarks-button';
import { useAuth } from '@/utils/AuthProvider';
import { Cover, Images } from '../(aux)/homecomponents';
import { PropertyData, ReviewData } from '@/api/Properties';
import { PropertyReviews } from '@/app/(owner)/(aux)/propertycomponents';
import LoadingComponent from '@/components/LoadingComponent';

const screenWidth = Dimensions.get('window').width;

export default function BHDetails() {
  const user = useAuth()?.session.user;
  let { propertyID } = useLocalSearchParams();
  const [data, setData] = useState<PropertyData | null>(null);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAmenitiesModal, setShowAmenitiesModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false)
  const [selectedImage, setSelectedImage] = useState(null)
  const hasFetched = useRef(false);
  const [ratings, setRatings] = useState(0)
  const [propertyReviews, setPropertyReviews] = useState<ReviewData[] | null>(null);

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
        await fetchPropertyReviews();
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }}, [propertyID]);

  const fetchPropertyReviews = async () => {
    try {
      const reviews = await getPropertyReviews(propertyID);
      setPropertyReviews(reviews);
      const allRatings = reviews.map((review) => review.rating);
      const totalRating = allRatings.reduce((acc, rating) => acc + rating, 0);
      setRatings(totalRating);
    } catch (error) {
      console.error('Error fetching property reviews:', error);
      setPropertyReviews(null);
    }

    setLoading(false)
  };


  return (
    <SafeAreaView className='flex-1 bg-white'>
      {loading ? (
        <LoadingComponent/>
      ) : (
        <View>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View>
            {showAmenitiesModal && (
            <View className='z-20'>
              <AmenitiesModal hideModal={() => setShowAmenitiesModal(false)}/>
            </View>
           )}
          </View>
                
        <View className={`${showAmenitiesModal ? 'opacity-20 z-0' : ''}`}>
          <View className='flex-row items-center justify-between p-5'>
            <BackButton/>
            <Bookmark propertyID={propertyID} tenantID={user?.id}/>
          </View>

          {images.length > 0 ? (
            <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
              data={images}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => 
              <View className='w-screen h-60'> 
                <Pressable onPress={() => openImage(item)}>
                  <Cover item={{...item, propertyID}} />
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
              <Text className='text-xl font-semibold'>{data?.name}</Text>
            
            <View>
              <TouchableOpacity 
              onPress={() => router.push({pathname: "/MapView", params: {latitude: data.latitude, longitude: data.longitude}})}
              className='flex-row items-center gap-x-1'>
                <Ionicons name='location-outline' size={15} color={'#FF8B00'}/>
                <Text className='text-base'>Catungan 1, Sibalom, Antique</Text>
              </TouchableOpacity>
            </View>

            <View className='flex-row items-center gap-x-1'>
              <Ionicons name='star' size={15} color={'#FF8B00'}/>
              <Text> <Text className='font-semibold'>{ratings}</Text> stars / <Text className='font-semibold'>{propertyReviews?.length}</Text> {propertyReviews?.length > 0 ? 'review' : 'reviews'}</Text>
            </View>
 
            <View className='mt-5'>
              <View className='flex-row items-center gap-x-1'>
                <Text className='font-semibold'>Description</Text>
              </View>
              <View className='mt-2'>
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

            <View className='mt-5'>
              <View className='flex-row items-center'>
                <Text className='font-semibold mr-1'>Amenities</Text>
                <Pressable 
                  onPress={() => setShowAmenitiesModal(true)}
                  className='mt-1'>
                  <Ionicons name='help-circle-outline' size={15}/>
                </Pressable >  
              </View>

              <Amenities propertyID={propertyID}/>
            </View>


            <View className='mt-5'>
              <Text className='font-semibold'>More Photos</Text>

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

            <View className='mt-5'>
              <Text className='font-semibold'>Reviews ({propertyReviews?.length})</Text>

              <PropertyReviews reviews={propertyReviews}/>
            </View>

            <View className='mt-5'>
              <Text className='font-semibold'>More Details:</Text>
              <Pressable onPress={() => router.push({pathname: "/OwnerProfile", params: {owner_id : data?.owner_id}})}>
                <OwnerInformation owner_id={data?.owner_id}/>
              </Pressable>
            </View>

            <View className='h-20'/>

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
      <BottomBar price={data?.price} propertyID={propertyID}/>
      </View>
      )}

     
    </SafeAreaView>
  );
}
