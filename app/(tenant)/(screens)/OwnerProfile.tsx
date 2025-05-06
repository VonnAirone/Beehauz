import { Pressable, Text, View, ScrollView, ActivityIndicator, TouchableOpacity, Image } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import BackButton from '@/app/components/back-button'
import { Ionicons } from '@expo/vector-icons'
import { fetchPropertyData, getProfile } from '@/app/api/DataFetching'
import { SingleImageDisplay } from '../(aux)/homecomponents'
import { supabase } from '@/utils/supabase'
import StarRatingComponent from '../(aux)/starrating'
import { Link, router, useLocalSearchParams } from 'expo-router'
import AvatarImage from '../(aux)/avatar'
import { ReviewData } from '@/app/api/Properties'
import LoadingComponent from '@/app/components/LoadingComponent'
import { useAuth } from '@/utils/AuthProvider'
import { PropertyData } from '@/models/IProperty'
import { UserData } from '@/models/IUsers'


export default function OwnerProfile() {
    const user = useAuth()?.session.user;
    const [propertyList, setPropertyList] = useState<PropertyData[] | null>(null);
    const [ownerData, setOwnerData] = useState<UserData | null>(null);
    const [ownerReviews, setOwnerReviews] = useState<ReviewData[] | null>(null);
    const [reviewUsernames, setReviewUsernames] = useState([])
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState<'Details' | 'Reviews'>('Details');
    let { owner_id } = useLocalSearchParams();
    const hasFetched = useRef(null)


    useEffect(() => {
        fetchData();     
        const unsubscribe = listenToRealTimeChanges();
        return () => {
            if (unsubscribe) {
                unsubscribe();
            }
        }
    }, []);

    function listenToRealTimeChanges() {
        const reviews = supabase.channel('custom-all-channel')
        .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'owner_reviews' },
        (payload) => {
            fetchData()
            console.log("Updated reviews!", payload)
        }
        )
        return () => {
            reviews.unsubscribe();
        };
    }

    async function fetchData() {
      if(!hasFetched.current) {
        try {
          const [profileData, propertyData, ownerReviews] = await Promise.all([
              getUserProfile(owner_id.toString()),
              fetchOwnerProperties(),
              getReviews(),
          ]);
          setOwnerData(profileData);
          setPropertyList(propertyData);
          setOwnerReviews(ownerReviews);

          const tenant_id = ownerReviews.map(review => review.tenant_id);
          const tenantData = await Promise.all(tenant_id.map(id => getProfile(id)));
          const usernames = tenantData.map(tenant => tenant.name);
          setReviewUsernames(usernames);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);  
        }
      }
    }

    async function getUserProfile(id: string) {
        try {
            const data = await getProfile(id);
            return data;
        } catch (error) {
            console.log("Error fetching owner", error.message);
            throw error;
        }
    }

    async function getReviews() {
        try {
            const { data, error } = await supabase
                .from("owner_reviews")
                .select("*")
                .eq('owner_id', owner_id);

            if (error) {
                console.log("Error fetching owner reviews: ", error.message);
                return null;
            } else {
                return data;
            }
        } catch (error) {
            console.log("Error fetching owner reviews: ", error.message);
            return null;
        }
    }

    async function fetchOwnerProperties() {
        try {
            const data = await fetchPropertyData(owner_id.toString());
            return data;
        } catch (error) {
            console.log("Error fetching property", error.message);
            throw error;
        }
    }

    async function ContactOwner() {
      try {
        const { data, error } = await supabase
        .from('chat_rooms')
        .select('*')
        .contains('users', [user?.id, owner_id]);

        if (data[0]?.room_id) {
          router.push({
            pathname: "/Chatbox", 
            params: { room_id: data[0]?.room_id, sender_id: user?.id, receiver_id: owner_id }
          });
        } else {
          const { data, error} = await supabase
          .from("chat_rooms")
          .insert([ {'users': [user?.id, owner_id]}])

          if (data) {
            router.push({
              pathname: "/Chatbox", 
              params: { sender_id: user?.id, receiver_id: owner_id }
            });
          }
        }
      } catch(error) {
          console.log("Error fetching room ID: ", error.message)
      }
    }


  return (
    <SafeAreaView className='flex-1'>
        
      {loading ? (
        <LoadingComponent/>
      ) : (
        <View>
        <ScrollView 
        showsVerticalScrollIndicator={false}
        className='p-5'>
        
        <BackButton/>
        <View>
          <View 
          style={{backgroundColor: "#444"}}
          className='items-center rounded-md mt-2 h-32 mb-6'>
            <View 
            className='absolute -bottom-10 rounded-full border-2 border-gray-200 bg-white h-28 w-28'>
                <AvatarImage userID={ownerData?.id}/>
            </View>
          </View>

          <View>
            <View className='items-center mt-5'>
              <Text className='text-2xl font-semibold'>{ownerData?.first_name} {ownerData?.last_name}</Text>
              <Text>Owner of {propertyList[0]?.Name}</Text>
            </View>

            {/* <View className='items-center mt-10'>
              <View className='flex-row gap-x-20'>
                <Pressable
                onPress={() => setActiveTab('Details')}>
                    <Text className={`text-base ${activeTab === 'Details' ? 'text-yellow' : 'text-gray-500'}`}>Details</Text>
                </Pressable>
                <View className='border-left border border-gray-500'/>
                <Pressable onPress={() => setActiveTab('Reviews')}>
                    <Text className={`text-base ${activeTab === 'Reviews' ? 'text-yellow' : 'text-gray-500'}`}>Reviews</Text>
                </Pressable>
              </View>
            </View> */}

              <View>
                {activeTab === 'Details' && (
                <View className='gap-y-3'>
                  <View className='gap-y-2'>
                      <Text className='font-semibold text-base'>Bio</Text>

                      <Text>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</Text>
                  </View>

                  <View className='gap-y-3'>
                    <Text className='font-semibold'>Contact Details</Text>
                    <View className='flex-row items-center gap-x-4'>
                        <Ionicons name='call' size={18}/>
                        <Text className='text-base'>{ownerData?.phone_number}</Text>
                    </View>

                    <View className='flex-row items-center gap-x-4'>
                      <Ionicons name='mail' size={18}/>
                      <Text className='text-base'>{ownerData?.email}</Text>
                    </View>

                    <View className='flex-row items-center gap-x-4'>
                      <Ionicons name='logo-facebook' size={18}/>
                      <Text className='text-base'>{ownerData?.first_name} {ownerData.last_name}</Text>
                    </View>
                  </View>

                  <View className='gap-y-3'>
                    <Text className='font-semibold'>Owned Properties</Text>

                    {propertyList.map((item, index) => (
                      <View key={index} className='overflow-hidden'>
                        <Pressable 
                        onPress={() => {}}>
                          <View className='flex-row items-center'>
                            <View className='h-24 w-24'>
                              {!hasFetched.current && (
                                <SingleImageDisplay propertyID={item.Id} />
                              )} 
                            </View>

                            <View className='p-2 gap-y-1'>
                              <Text className='font-semibold'>{item.Name}</Text>
                              <View className="flex-row items-center gap-x-1">
                                <Ionicons name="bed-outline"/>
                                <Text className="text-xs">{item.available_beds} Beds</Text>
                              </View>
                              <Text className="font-semibold">{item.RentalFee} / month</Text>
                              <View className="flex-row items-center">
                                <Ionicons name="location" color={'#FFA233'}/>
                                <Text className='text-xs'>{item.Address}</Text>
                              </View>
                            </View>
                          </View>
                        </Pressable>
                      </View>
                    ))}
                  </View>
                </View>
                )}
                <View className='mt-5'>
                  <Text className='font-semibold'>Reviews ({ownerReviews ? ownerReviews.length : 0})</Text>

                  <View className='mb-5'>
                      <Text className='italic text-xs mt-1'>Note: Only previous tenants and currently boarding are allowed to leave reviews for the owner.</Text>
                  </View>

                  {ownerReviews ? (
                    <View className='h-20 justify-center items-center'>
                        <Text>No Reviews</Text>
                    </View>
                  ) : (
                    <View>
                      {ownerReviews.map((item, index) => (
                      <View key={index} className='flex-row items-center gap-x-2 justify-center py-4'>
                        <View className='bg-white h-16 w-16 rounded-full'>
                            <Image className='w-full h-full' source={require("@/assets/images/icon.png")} />
                        </View>
                        <View>
                          <View>
                              <Text className='font-semibold text-lg'>{reviewUsernames[index]}</Text>
                          </View>
                          <View>
                          <StarRatingComponent rating={item.rating} />
                          </View>
                          <View className='w-72 mt-3'>
                              <Text>{item.review_content}</Text>
                          </View>
                        </View>
                      </View>
                      ))}
                    </View>
                  )}
                </View>  
              </View>
            </View>
        </View>
        <View className='h-20'/>
        </ScrollView>

        <View className='bottom-5 right-5 absolute'>
          <View className='rounded-full overflow-hidden '>
            <Pressable 
            onPress={() => ContactOwner()}
            style={{backgroundColor: "#444"}}
            android_ripple={{color: "#fdfdd9"}}
            className='p-5 rounded-full'>
              <Ionicons name='chatbubble' size={32} color={"white"}/>
            </Pressable>
          </View>
        </View>
      </View>
      )}
    </SafeAreaView>
  )
}