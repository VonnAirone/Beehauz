import { View, Text, Pressable, KeyboardAvoidingView, ScrollView, Alert, Modal } from 'react-native';
import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import { fetchPropertyDetailsData, getProfile, getPropertyReviews } from '@/api/DataFetching';
import { OwnerData, PropertyData, ReviewData, UserData } from '@/api/Properties';
import { Ionicons } from '@expo/vector-icons';
import { SingleImageDisplay } from '../(aux)/homecomponents';
import moment from 'moment';
import { TextInput, TouchableWithoutFeedback } from 'react-native-gesture-handler';
import BackButton from '@/components/back-button';
import { useAuth } from '@/utils/AuthProvider';
import { supabase } from '@/utils/supabase';
import { sendPushNotification } from '@/api/usePushNotification';
import LoadingComponent from '@/components/LoadingComponent';
import { PropertyReviews } from '@/app/(owner)/(aux)/propertycomponents';

export default function TenantProperty() {
  const userID = useAuth()?.session.user.id;
  const [showModal, setShowModal] = useState(false)
  const params = useLocalSearchParams()
  const [propertyData, setPropertyData] = useState<PropertyData | null>(null);
  const id = params?.propertyID.toString();
  const [reviewContent, setReviewContent] = useState('')
  const [rating, setRating] = useState(0);
  const [loading, setLoading] = useState(true)
  const [showLeaveModal, setShowLeaveModal] = useState(false)
  const [showLeaveNotif, setShowLeaveNotif] = useState(false)
  const [tenantStatus, setTenantStatus] = useState('')
  const [reviewContentIsEmpty, setReviewContentIsEmpty] = useState(false)
  const [owner, setOwner] = useState<OwnerData | null>(null)
  const [user, setUser] = useState<UserData | null>(null)
  const [propertyReviews, setPropertyReviews] = useState<ReviewData[] | null>(null);
  const [ratings, setRatings] = useState(0)
  const handleRating = (value) => {
    setRating(value);
  };
  const [hasReviewed, setHasReviewed] = useState(false);

  const handleReviewText = (text) => { setReviewContent(text), setReviewContentIsEmpty(false)}

  async function getTenantStatus() {
    const {data} = await supabase.from('tenants').select('status').eq('tenant_id', userID)

    setTenantStatus(data[0].status)
  }
  async function fetchPropertyData () {
    try {
      const data = await fetchPropertyDetailsData(id)
      if (data) {
        const owner = await getProfile(data.owner_id)
        setOwner(owner)
        setPropertyData(data)
        await fetchPropertyReviews(data.property_id)
      }

      
    } catch (error) {
      console.log("Error fetching property data: ", error.message)
    }
  }

  const fetchPropertyReviews = async (propertyID) => {
    try {
      const reviews = await getPropertyReviews(propertyID);
      setPropertyReviews(reviews);
      setHasReviewed(reviews.some(review => review.tenant_id === userID));
      const allRatings = reviews?.map((review) => review?.rating);
      const totalRating = allRatings?.reduce((acc, rating) => acc + rating, 0);
      const averageRating = totalRating / allRatings?.length;
      setRatings(averageRating);
    } catch (error) {
      console.error('Error fetching property reviews:', error);
      setPropertyReviews(null);
    }
  };

  async function submitReview() {
    // const oneWeekInMilliseconds = 7 * 24 * 60 * 60 * 1000;
    // const currentDate = new Date().getTime();
    // const dateJoined = new Date(params?.date_joined.toString()).getTime();

    // if (!isNaN(dateJoined)) {
    //   if (currentDate - dateJoined < oneWeekInMilliseconds) {
    //     Alert.alert("You can only leave a review after a week of stay.");
    //     return;
    //   }
    // } else {
    //   console.log("Invalid date format for dateJoined.");
    // }

  
    // If it has been a week, proceed with submitting the review

    if (hasReviewed) {
      Alert.alert("You have already submitted a review for this property.");
      return;
    }

    if (reviewContent.trim() === '') {
      setReviewContentIsEmpty(true)
    } else {
      const ReviewData = {
        created_at: new Date(),
        property_id: propertyData?.property_id,
        tenant_id: userID,
        review_content: reviewContent
      };
    
      try {
        const { error } = await supabase.from('property_reviews').insert(ReviewData);
    
        if (error) {
          console.log("Error inserting review: ", error.message);
        }
      } catch (error) {
        console.log("Error inserting review: ", error.message);
      } finally {
        setRating(0)
        setReviewContent('')
        Alert.alert("You have submitted a review. Thank you!")
      }
    } 
  }
  
  async function onPress () {
    setRating(0)
    setReviewContent('')
  }


  async function requestToLeave() {
    try {
      const {error} = await supabase
      .from('tenants')
      .update({status: 'Request To Leave'})
      .eq('tenant_id', userID)

      if (error) {
        console.log("Error sending leave request: ", error.message)
      }
    } catch (error) {
      console.log("Error updating tenants table: ", error.message)
    } finally {
      await sendPushNotification(owner?.expo_push_token, `Tenant ${user?.first_name} requested to leave the property. See more details.`)
      setShowLeaveModal(false)
      setShowLeaveNotif(true)
    }
  }

  
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        const userData = await getProfile(userID)
        setUser(userData)
        await fetchPropertyData() 
        await getTenantStatus()
      } catch (error) {
        console.log("Error fetching data: ", error.message)
      } finally {
        setLoading(false)
      }
      
    }
    async function subscribeToChanges() {
      const channels = supabase
        .channel('tenant-status-update')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'tenants' },
          (payload) => {
            console.log('Change received!', payload);
            fetchData()
          }
        )
        .subscribe();
    
      return () => {
        channels.unsubscribe();
      };
    }

    async function subscribeToRentalChanges() {
      const channels = supabase
        .channel('tenant-status-update')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'rentals' },
          (payload) => {
            console.log('Change received!', payload);
            getTenantStatus()
          }
        )
        .subscribe();
    
      return () => {
        channels.unsubscribe();
      };
    }


    fetchData()
    subscribeToChanges()
  }, [])

  const formatDate = (date) => {
    return moment(date).format('MMMM YYYY');
  };
  
  return (
    <KeyboardAvoidingView>
      <TouchableWithoutFeedback>
        <SafeAreaView>
          {loading ? (
            <View className='h-full'>
              <LoadingComponent/>
            </View>
            
          ): (
          <ScrollView 
            showsVerticalScrollIndicator={false}
            className={`p-5 ${showLeaveModal && 'opacity-5'}`}>
              <BackButton/>
              <View className='mt-4'>
                <Text className='font-medium'>You are currently boarding at:</Text>
              </View>

              <View className='w-full h-40 mt-4'>
                <SingleImageDisplay propertyID={propertyData?.property_id}/>
              </View>
              
              <View className='mt-3'>
                <Text className='text-lg font-medium'>{propertyData?.name}</Text>
              </View>

              <View className='flex-row items-center gap-x-1'>
                <Ionicons name='location' size={15} color={"#444"}/>
                <Text>{propertyData?.address}</Text>
              </View>

              <View className='mt-3'>
                <View className='flex-row items-center gap-x-1'>
                  <Text className='font-semibold'>Description</Text>
                </View>
                <View>
                  {propertyData?.description ? (
                    <Text className='text-xs'>
                      {propertyData?.description}
                    </Text>
                  ): (
                    <Text>
                      No description
                    </Text>
                  )}
                </View>
              </View>

              <View className='mt-2'>
                <Text>Date Joined: 
                  <Text className='font-semibold'> {formatDate(params?.date_joined?.toString())}</Text>
                </Text>
              </View>

              <View className='mt-2'>
                  <Text className='font-semibold'>Reviews</Text>
              </View>

              <PropertyReviews reviews={propertyReviews}/>

            


                {hasReviewed === true && (
                  <View className='p-5 bg-gray-200 rounded-md mt-5'>

                  {showModal && (
                    <View className='absolute z-20 top-10 self-center bg-white p-3 rounded-md border border-gray-300'>
                      <Text>Beehauz provides tenants with the opportunity to share their stay experiences, thereby aiding property owners in identifying areas for improvement. Additionally, this feature assists potential tenants in making well-informed decisions.</Text>
                    </View>
                  )}
    
                    <View className='flex-row items-center gap-x-2'>
                      <Text>How's your experience so far?</Text>
                      <Pressable onPress={() => setShowModal(!showModal)}>
                        <Ionicons name='help-circle-outline' size={15}/>
                      </Pressable>
                    </View>
                  <View className='mt-4'>
                    <Text className='font-medium'>Leave a Review</Text>
                    
                    <View className='mt-2'>
                      <TextInput
                      value={reviewContent}
                      onChangeText={(text) => handleReviewText(text)}
                      placeholder='Share your experience'
                      className={`bg-white rounded-md p-3 text-xs ${reviewContentIsEmpty ? 'border border-red-300' : ''}`}/>
                    </View>

                    {reviewContentIsEmpty && (
                      <Text className='text-xs text-gray-700 mt-1'>Do not leave the field empty.</Text>
                    )}

                    <View className='flex-row items-center justify-evenly my-4'>
                      {[1, 2, 3, 4, 5].map((index) => (
                        <Pressable
                          key={index}
                          onPress={() => handleRating(index)}
                        >
                          <Ionicons
                            name={index <= rating ? 'star' : 'star-outline'}
                            size={30}
                            color={index <= rating ? '#444' : 'gray'}
                          />
                        </Pressable>
                      ))}
                    </View>

                    <View className='flex-row items-center gap-x-2 self-end'>
                    <View className='overflow-hidden rounded-sm'>
                      <Pressable
                      onPress={onPress}
                      android_ripple={{color: 'white'}} 
                      className='p-2 rounded-sm border border-gray-300 bg-white'>
                        <Text>Clear Reviews</Text>
                      </Pressable>
                    </View>

                    <View className='overflow-hidden rounded-sm'>
                      <Pressable
                      onPress={submitReview}
                      android_ripple={{color: 'white'}} 
                      style={{backgroundColor: "#444"}}
                      className='p-2 rounded-sm'>
                        <Text className='text-white'>Submit</Text>
                      </Pressable>
                    </View>
                    </View>
                  </View>
                </View>
                )}
                  
              

                <View className='mt-4'>
                  <Pressable
                  onPress={tenantStatus === 'Boarding' ? () => setShowLeaveModal(true) : () => {}} 
                  android_ripple={{color: "white"}}
                  style={{backgroundColor: "#444"}}
                  className='p-3 rounded-md'>
                    <Text className='text-center font-medium text-white'>{tenantStatus === 'Request To Leave' ? 'Waiting for Confirmation' : 'Request to Leave'}</Text>
                  </Pressable>
                </View>

                <Modal 
                  animationType='fade'
                  className='flex-1 items-center justify-center'
                  transparent={true}
                  visible={showLeaveNotif}
                  onRequestClose={() => {
                    setShowLeaveNotif(!showLeaveNotif);
                  }}>
                  <Pressable 
                  onPress={() => setShowLeaveNotif(!showLeaveNotif)}
                  className='bg-white border border-gray-700 w-80 self-center rounded-md p-5'>
                    <Text>Your request to leave the property has been sent for approval.</Text>
                  </Pressable>
                </Modal>
              <View className='h-20'></View>
          </ScrollView>
          )}
          

            {showLeaveModal && (
            <View className='bg-white rounded-md p-5 absolute self-center top-80'>
              <Text className='text-center'>Do you wish to leave the property?</Text>

              <View className='flex-row items-center justify-center gap-x-4 mt-4'>
                <View className='w-32 overflow-hidden rounded-md'>
                  <Pressable
                  onPress={() => setShowLeaveModal(false)}
                  android_ripple={{color: "#444"}}
                  className='border border-gray-200 rounded-md p-3'>
                    <Text className='font-medium text-center'>Cancel</Text>
                  </Pressable>
                </View>

                <View className='w-32 overflow-hidden rounded-md'>
                  <Pressable
                  onPress={requestToLeave}
                  android_ripple={{color: "white"}} 
                  style={{backgroundColor: "#444"}}
                  className='p-3 rounded-md'>
                    <Text className='text-white font-medium text-center'>Yes</Text>
                  </Pressable>
                </View>
              </View>
            </View>
            )}

            
      </SafeAreaView>
    </TouchableWithoutFeedback>
  </KeyboardAvoidingView>
  )
}