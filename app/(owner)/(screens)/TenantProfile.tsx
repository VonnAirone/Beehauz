import { View, Text, Pressable, ActivityIndicator, Alert, TextInput, FlatList, KeyboardAvoidingView, ScrollView } from 'react-native';
import React, { useEffect, useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import BackButton from '@/app/components/back-button';
import AvatarImage from '@/app/(tenant)/(aux)/avatar';
import { fetchPropertyDetailsData, getProfile } from '@/app/api/DataFetching';
import { PropertyData, UserData } from '@/app/api/Properties';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/utils/supabase';
import { useAuth } from '@/utils/AuthProvider';
import LoadingComponent from '@/app/components/LoadingComponent';
import { TenantReviews } from '../(aux)/propertycomponents';
import { sendPushNotification } from '@/app/api/usePushNotification';

export default function TenantProfile() {
  const ownerID = useAuth()?.session?.user?.id
  const params = useLocalSearchParams()
  const [tenantData, setTenantData] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [tenantStatus, setTenantStatus] = useState()
  const [propertyData, setPropertyData] = useState<PropertyData | null>(null) 
  const [propertyID, setPropertyID] = useState({})
  const [reviewContent, setReviewContent] = useState('')
  const [reviews, setReviews] = useState([])

  const handleReviewText = (text) => { setReviewContent(text)}

  async function getTenantReviews (id) {
    try {
      const {data, error} = await supabase
      .from('tenant_reviews')
      .select('*')
      .eq('tenant_id', id)

      if (error) {
        console.log("Error fetching tenant reviews: ", error.message)
      }
      if (data) {
        setReviews(data)
      }
    } catch (error) {
      console.log("Error fetching tenant reviews: ", error.message)
    }
  }

  async function subscribeToTenantReviewChanges() {
    const channels = supabase
      .channel('status-update')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tenant_reviews' },
        (payload) => {
          console.log('Change received!', payload);
          getTenantReviews(tenantData?.id)
        }
      )
      .subscribe();
  
    return () => {
      channels.unsubscribe();
    };
  }

  async function submitReview() {
    // const oneWeekInMilliseconds = 7 * 24 * 60 * 60 * 1000;
    // const currentDate = new Date().getTime();
    // const dateJoined = new Date(date_joined).getTime();

    // if (!isNaN(dateJoined)) {
    //   if (currentDate - dateJoined < oneWeekInMilliseconds) {
    //     Alert.alert("You can only leave a review after a week of stay.");
    //     return;
    //   }
    // } else {
    //   console.log("Invalid date format for dateJoined.");
    // }

    const ReviewData = {
      created_at: new Date(),
      owner_id: ownerID,
      tenant_id: tenantData?.id,
      review_content: reviewContent
    };
  
    try {
      const { error } = await supabase.from('tenant_reviews').insert(ReviewData);
  
      if (error) {
        console.log("Error inserting new review: ", error.message);
      } else {
        Alert.alert("You have submitted a review. Thank you!")
      }
    } catch (error) {
      console.log("Error inserting review: ", error.message);
    } finally {
      setReviewContent('')
      
    }
  }
  
  async function onPress () {
    setReviewContent('')
  }

  const getPropertyID = async () => {
    try {
      const { data, error } = await supabase.from('property')
      .select('property_id')
      .eq('owner_id', ownerID)

      if (data) {
        setPropertyID(data[0].property_id)
      }
      if (error) {
        console.log("Error fetching property id: ", error.message)
      }
    } catch (error) {
      console.log("Error fetching property id: ", error.message)
    }
  }

  async function getTenantStatus() {
    try {
      const {data, error} = await supabase.from("tenants").select().eq('tenant_id', params?.tenant_id)
      if (data) {
        setTenantStatus(data[0]?.status)
      }

      if (data[0]?.property_id) {
        const property = await fetchPropertyDetailsData(data[0]?.property_id)
        setPropertyData(property)
      } else {
        const property = await fetchPropertyDetailsData(params?.propertyID.toString())
        setPropertyData(property)
      }
    } catch (error) {
      console.log("Error fetching tenant status");
    }
  }

  async function getTenantProfile() {
    try {
      const data = await getProfile(params?.tenant_id.toString())
      if (data) {
        setTenantData(data) 
        await getTenantReviews(data?.id)
      }
    } catch (error) {
      console.log("Error fetching tenant's profile: ", error.message)
    }
  }

  async function fetchData() {
    try {
      setLoading(true)
      await getTenantProfile()
      await getTenantStatus()
      await getPropertyID()


    } catch (error) {
      console.log("Error fetching data: ", error.message)
    } finally {
      setLoading(false)
    }
  }

  async function subscribeToChanges() {
    const channels = supabase
      .channel('status-update')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tenants' },
        (payload) => {
          console.log('Change received!', payload);
          fetchData()
          getTenantStatus()
        }
      )
      .subscribe();
  
    return () => {
      channels.unsubscribe();
    };
  }

  useEffect(() => {
    fetchData()
    subscribeToChanges()
    subscribeToTenantReviewChanges()
  }, [])

  const dateJoined = new Date(tenantData?.date_joined);
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const month = monthNames[dateJoined.getMonth()];
  const year = dateJoined.getFullYear();

  const formattedDate = `${month} ${year}`;

  const addTenantToProperty = async () => {
    const TenantData = {
      status: 'Boarding',
      property_id: propertyID
    }
    try {
      const {data, error} = await supabase
      .from("tenants")
      .update(TenantData)
      .eq('tenant_id', params?.tenant_id)

      if (data) {

        console.log("Successfully updated tenant status")
      }

      if (error) {
        console.log("Error updating tenant status: ", error.message)
      }

    } catch (error) {
      console.log("Error updating tenant information: ", error.message)
    } finally {
      sendPushNotification(tenantData?.expo_push_token, `You have been added to the property ${propertyData?.name}. Please see more details.`)
      router.push("/(owner)/(tabs)/Tenants")
      Alert.alert("Successfully updated tenant status!")
    }
  }

  const removeTenantFromProperty = async () => {
    try {
      const {data, error} = await supabase
      .from("tenants")
      .update({property_id: null, status: 'Available'})
      .eq('tenant_id', tenantData?.id)

      router.push("/(owner)/(tabs)/Tenants")

      if (data) {
        console.log("Successfully updated tenant status")
      }

      if (error) {
        console.log("Error updating tenant status: ", error.message)
      }

    } catch (error) {
      console.log("Error updating tenant information: ", error.message)
    } finally {
      sendPushNotification(tenantData?.expo_push_token, `You have been removed from the property ${propertyData?.name}. Please see more details.`)
      Alert.alert("Successfully updated tenant status!")
    }
  }

  


  return (
      <SafeAreaView className='flex-1'>
        <View 

        className='flex-1 p-5'>
          <BackButton/>

          {loading ? (
            <LoadingComponent/>
          ) : (
            <ScrollView 
            showsVerticalScrollIndicator={false}
            className='flex-1'>
              <View 
              style={{backgroundColor: '#444'}}
              className='items-center rounded-md mt-4 h-32 mb-6'>
                <View className='absolute -bottom-10 rounded-full border-2 border-gray-200 bg-white h-28 w-28'>
                    <AvatarImage userID={tenantData?.id}/>
                </View>
              </View>
      
              <View>
                <View className='items-center mt-5'>
                  <Text className='text-2xl font-semibold'>{tenantData?.first_name} {tenantData?.last_name}</Text>
                  <Text>Joined last {formattedDate}</Text>
                  {tenantStatus && tenantStatus !== 'Available' && (
                    <Text>Boarding at {propertyData?.name}</Text>
                  )}
                </View>
      
                <View className='gap-y-1 mt-4'>
                  <Text className='font-semibold'>Contact Details</Text>
                  <View className='flex-row items-center gap-x-4'>
                      <Ionicons name='call' size={18}/>
                      <Text className='text-base'>{tenantData?.phone_number}</Text>
                  </View>
      
                  <View className='flex-row items-center gap-x-4'>
                      <Ionicons name='location' size={18}/>
                      <Text className='text-base'>{tenantData?.address}</Text>
                  </View>
      
                  <View className='flex-row items-center gap-x-4'>
                    <Ionicons name='mail' size={18}/>
                    <Text className='text-base'>{tenantData?.email}</Text>
                  </View>
      
                  <View className='flex-row items-center gap-x-4'>
                    <Ionicons name='logo-facebook' size={18}/>
                    <Text className='text-base'>{tenantData?.first_name} {tenantData?.last_name}</Text>
                  </View>
                </View>
      
                <View className='mt-4'>
                  <Text className='font-semibold'>Reviews</Text>
                  <Text className='text-xs italic'>Note: Only previous property owners from whom tenants came can leave reviews.</Text>
                </View>

                <View className='mt-2'>
                  <TenantReviews reviews={reviews}/>
                </View>
              </View>

              {tenantStatus && tenantStatus !== 'Available' && (
              <View className='mt-4 bg-gray-200 p-5 rounded-md'>
                <Text className='font-medium'>Leave a Review</Text>
                
                <View className='mt-2'>
                  <TextInput
                  value={reviewContent}
                  onChangeText={(text) => handleReviewText(text)}
                  placeholder='Share your experience'
                  className='bg-white rounded-md p-3 text-xs'/>
                </View>
              
                <View className='flex-row items-center gap-x-2 self-end mt-2'>
                  <View className='overflow-hidden rounded-sm'>
                    <Pressable
                    onPress={onPress}
                    android_ripple={{color: 'white'}} 
                    className='p-2 rounded-md border border-gray-300 bg-white'>
                      <Text>Clear Reviews</Text>
                    </Pressable>
                  </View>

                  <View className='overflow-hidden rounded-sm'>
                    <Pressable
                    onPress={submitReview}
                    android_ripple={{color: 'white'}} 
                    style={{backgroundColor: "#444"}}
                    className='p-2 rounded-md'>
                      <Text className='text-white'>Submit</Text>
                    </Pressable>
                  </View>
                </View>
              </View>
              )}

              {tenantStatus && tenantStatus !== 'Available' && (
                  <View className='rounded-md overflow-hidden w-80 bottom-0 self-center mt-5'>
                  <Pressable 
                  onPress={removeTenantFromProperty}
                  android_ripple={{color: 'white'}}
                  style={{backgroundColor: "#444"}}
                  className='flex-row items-center justify-center p-3 rounded-md'>
                    <Ionicons color={'white'} name='remove-outline'/>
                    <Text className='text-white'> Remove tenant from property</Text>
                  </Pressable>
                </View>
              )}

                
              {tenantStatus && tenantStatus === 'Available' && (
                <View className='rounded-md overflow-hidden w-80 bottom-0 self-center mt-5'>
                  <Pressable 
                  onPress={addTenantToProperty}
                  android_ripple={{color: 'white'}}
                  style={{backgroundColor: "#444"}}
                  className='flex-row items-center justify-center p-3 rounded-md'>
                    <Ionicons color={'white'} name='add-outline'/>
                    <Text className='text-white'>Add tenant to property</Text>
                  </Pressable>
                </View>
              )}

          </ScrollView>
          )}




        </View>
      </SafeAreaView>
  )
}