import React, { useEffect, useState, useRef } from 'react';
import { Text, View, Image, FlatList, Dimensions, ScrollView, Pressable, Modal, TouchableOpacity } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { fetchPropertyDetailsData, fetchPropertyTerms, fetchTenantStatus, getOwnerData, getPropertyReviews } from '@/api/DataFetching';
import { loadImages } from '@/api/ImageFetching';
import BackButton from '@/components/back-button';
import { Ionicons } from '@expo/vector-icons';
import { BottomBar } from '../(aux)/detailscomponent';
import { Images, SingleImageDisplay } from '../(aux)/homecomponents';
import { PropertyData, ReviewData, OwnerData, PropertyTerms } from '@/api/Properties';
import { PropertyReviews } from '@/app/(owner)/(aux)/propertycomponents';
import LoadingComponent from '@/components/LoadingComponent';
import { checkBookmarkStatus, toggleBookmark } from '@/components/bookmarks-button';
import { useAuth } from '@/utils/AuthProvider';
import moment from 'moment';

const screenWidth = Dimensions.get('window').width;

export default function BHDetails() {
  const user = useAuth()?.session?.user;
  const [bookmarkStatus, setBookmarkStatus] = useState()
  let { propertyID } = useLocalSearchParams();
  const [data, setData] = useState<PropertyData | null>(null);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAmenitiesModal, setShowAmenitiesModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false)
  const [selectedImage, setSelectedImage] = useState(null)
  const [ratings, setRatings] = useState(0)
  const [propertyReviews, setPropertyReviews] = useState<ReviewData[] | null>(null);
  const [ownerData, setOwnerData] = useState<OwnerData | null>(null);
  const [terms, setTerms] = useState<PropertyTerms | null>(null)
  const [tenantStatus, setTenantStatus] = useState([])

  const formatDate = (date) => {
    return moment(date).format('MMMM YYYY');
  };
  
  const openImage = (image) => {
    setSelectedImage(image);
    setShowImageModal(true)
  }

  useEffect(() => {
    fetchData();
  }, []); 

  async function fetchData() {
    setLoading(true);
    try {
      const tenantStatus = await fetchTenantStatus(user?.id)
      setTenantStatus(tenantStatus[0])
      const fetchedData = await fetchPropertyDetailsData(propertyID?.toString());
      setData(fetchedData);
      await checkBookmarkStatus(propertyID, user?.id, setBookmarkStatus);
      await loadImages(propertyID, setImages);
      await fetchPropertyReviews();
      await getOwnerData(fetchedData?.owner_id, setOwnerData);
      await fetchPropertyTerms(propertyID, setTerms);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false)
    }
  }
  

  const fetchPropertyReviews = async () => {
    try {
      const reviews = await getPropertyReviews(propertyID);
      setPropertyReviews(reviews);
      const allRatings = reviews.map((review) => review.rating);
      const totalRating = allRatings.reduce((acc, rating) => acc + rating, 0);
      const averageRating = totalRating / allRatings.length;
      setRatings(averageRating);
    } catch (error) {
      console.error('Error fetching property reviews:', error);
      setPropertyReviews(null);
    }
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
           <Modal 
           transparent={true}
           animationType='slide'
           className='transparent w-96 rounded-md flex-1 z-10'>
             <View className="flex-1 justify-center items-center bg-opacity-50 p-5 ">
               <View className='bg-white items-center justify-center w-full shadow shadow-black rounded-md'>
                  <View className='absolute right-3 top-3'>
                    <Pressable onPress={() => setShowAmenitiesModal(false)}>
                      <Ionicons name='close' size={20} color={'#444'}/>
                    </Pressable>
                  </View>
                 <View className='p-5'>
                   <View>
                     <Text className='text-2xl'>What is an <Text className='font-semibold uppercase'>Amenity</Text></Text>
                   </View>
       
                   <View className='mt-2'>
                     <Text className='text-base'>
                     An amenity is a feature or service that enhances the comfort, convenience, or enjoyment of a particular place.
                     </Text>
                   </View>
       
                   <View className='mt-8'>
                     <Text className='font-semibold text-lg'>Examples of Amenities</Text>
                   </View>
       
                   <View className='flex-row flex-wrap gap-x-2 gap-y-2 mt-1'>
                       <View className='relative grid select-none items-center whitespace-nowrap rounded-lg border border-gray-500 py-1.5 px-3 text-xs font-bold uppercase text-white'>
                           <Text className='text-center'>Wifi</Text>
                       </View>
       
                       <View className='relative grid select-none items-center whitespace-nowrap rounded-lg border border-gray-500 py-1.5 px-3 text-xs font-bold uppercase text-white'>
                           <Text className='text-center'>Common CR</Text>
                       </View>
       
                       
                       <View className='relative grid select-none items-center whitespace-nowrap rounded-lg border border-gray-500 py-1.5 px-3 text-xs font-bold uppercase text-white'>
                           <Text className='text-center'>Laundry Area</Text>
                       </View>
       
                                   
                       <View className='relative grid select-none items-center whitespace-nowrap rounded-lg border border-gray-500 py-1.5 px-3 text-xs font-bold uppercase text-white'>
                           <Text className='text-center'>Kitchen Area</Text>
                       </View>
       
                                               
                       <View className='relative grid select-none items-center whitespace-nowrap rounded-lg border border-gray-500 py-1.5 px-3 text-xs font-bold uppercase text-white'>
                           <Text className='text-center'>Rooms</Text>
                       </View>
                   </View>
                 </View>
               </View>
             </View>
           </Modal>
           )}
          </View>
                
        <View className={`${showAmenitiesModal ? 'opacity-20 z-0' : ''}`}>
          <View className='flex-row items-center justify-between p-5'>
            <BackButton/>
            <Pressable onPress={() => toggleBookmark(propertyID, user?.id, bookmarkStatus, setBookmarkStatus)}>
              <View className='flex-row items-center'>
                <Ionicons name={bookmarkStatus ? 'bookmark' : 'bookmark-outline'} size={26} color={"#444"} />
              </View>
            </Pressable>
          </View>

          <View>
            {images.length > 0 ? (
              <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
                data={images}
                keyExtractor={(item, index) => index?.toString()}
                renderItem={({ item }) => 
                <View className='w-screen h-60'> 
                  <Pressable onPress={() => openImage(item)}>
                  <View>
                    <SingleImageDisplay propertyID={propertyID}/>
                  </View>

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
          </View>

          
          <View className='p-5'>
            <View className='mt-2'>
              <Text className='text-xl font-semibold'>{data?.name}</Text>
            </View>
            
            
            <View>
              <TouchableOpacity 
              onPress={() => router.push({pathname: "/(tenant)/(screens)/MapView", params: {latitude: data.latitude, longitude: data.longitude}})}
              className='flex-row items-center gap-x-1'>
                <Ionicons name='location' size={15} color={"#444"}/>
                <Text className='text-base'>Catungan 1, Sibalom, Antique</Text>
              </TouchableOpacity>
            </View>

            <View className='flex-row items-center gap-x-1'>
              <Ionicons name='star' size={15} color={"#444"}/>
              <Text> <Text className='font-semibold'>{ratings ? ratings : '0'}</Text> stars / <Text className='font-semibold'>{propertyReviews?.length}</Text> {propertyReviews?.length > 0 ? 'review' : 'reviews'}</Text>
            </View>

            <View className='flex-row items-center gap-x-1'>
              <Ionicons name='bed' color={"#444"} size={15}/>
              <Text><Text className='font-medium'>{data?.available_beds} </Text>beds available</Text>
            </View>

            <View className='mt-5 flex-row items-center'>
              <Text className='font-medium'>Reservation Fee:</Text>
              <Text> {data?.reservation_fee}</Text>
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
              <Text className='font-semibold'>Payment Terms</Text>
              
              <View className='flex-row items-end mt-1'>
                <Text className='text-xs'>Advance Payment: </Text>
                <Text className='font-semibold text-xs'>{terms ? terms?.advance_payment : 'Not specified'}</Text>
              </View>

              <View className='flex-row items-end mt-1'>
                <Text className='text-xs'>Security Deposit: </Text>
                <Text className='font-semibold text-xs'>{terms ? terms?.security_deposit : 'Not specified'}</Text>
              </View>

              <View className='flex-row items-end mt-1'>
                <Text className='text-xs'>Electricity Bill: </Text>
                <Text className='font-semibold text-xs'>{terms ? terms?.electricity_bill : 'Not specified'}</Text>
              </View>

              <View className='flex-row items-end mt-1'>
                <Text className='text-xs'>Water Bill: </Text>
                <Text className='font-semibold text-xs'>{terms ? terms?.water_bills : 'Not specified'}</Text>
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

              <FlatList 
              data={data?.amenities} 
              renderItem={({item,index}) =>
              <View className='mr-2 mt-2'>
              <View key={index} className='relative grid select-none items-center whitespace-nowrap rounded-lg border border-gray-500 py-1.5 px-3 text-xs font-bold uppercase text-white'>
                  <Text className='text-center text-xs'>{item}</Text>
              </View>
              </View>} showsHorizontalScrollIndicator={false} horizontal={true} />
            </View>

            <View className='mt-5'>
              <Pressable onPress={() => router.push({pathname: "/OwnerProfile", params: {owner_id : data?.owner_id}})}>
              <View className='mt-3 bg-gray-50 p-3 rounded-md'>
                  <View className='flex-row items-center gap-x-3 justify-between'>
                    <View className='gap-y-1'>

                      <Text>Name of Owner: <Text className='font-semibold'>{ownerData?.first_name} {ownerData?.last_name}</Text></Text>

                      <Text>Joined last {formatDate(ownerData?.created_at)}</Text>

                      <Text className='text-gray-500 text-xs'>Response time: within an hour</Text>
                    </View>
                  </View>


                  <View className='w-40 self-end mt-4 overflow-hidden rounded-md'>
                    <Pressable 
                    style={{backgroundColor: "#444"}}
                    className='p-2 rounded-md flex-row items-center'
                    android_ripple={{color: "white"}}
                    onPress={() => router.push({pathname: "/(tenant)/(screens)/OwnerProfile", params: {owner_id : data?.owner_id}})}>
                      <Text className='text-white'>View Owner details</Text>
                      <Ionicons name='chevron-forward-outline' size={20} color={"white"}/>
                    </Pressable>
                  </View>
                </View>
              </Pressable>
            </View>

            <View className='mt-5'>
              <Text className='font-semibold'>Reviews ({propertyReviews?.length})</Text>
              <Text className='italic text-xs mt-1'>Note: Only previous tenants and currently boarding are allowed to leave reviews for the property.</Text>

              <View className='mt-2'>
                <PropertyReviews reviews={propertyReviews}/>
              </View>
              
            </View>

            <View className='h-16'/>

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
      <BottomBar 
      ownerPushToken={ownerData?.expo_push_token}
      userID={user?.id}
      ownerID={ownerData?.id}
      tenantStatus={tenantStatus}
      price={data?.price} 
      propertyID={propertyID} 
      propertyName={data?.name}/>
      </View>
      )}

     
    </SafeAreaView>
  );
}
