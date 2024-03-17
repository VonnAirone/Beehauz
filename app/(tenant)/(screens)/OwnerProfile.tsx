import { Pressable, Text, View, ScrollView, ActivityIndicator, TouchableOpacity, Image } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import BackButton from '@/components/back-button'
import { Ionicons } from '@expo/vector-icons'
import { fetchPropertyData, getProfile } from '@/api/DataFetching'
import { SingleImageDisplay } from '../(aux)/homecomponents'
import { supabase } from '@/utils/supabase'
import StarRatingComponent from '../(aux)/starrating'
import { useLocalSearchParams } from 'expo-router'
import AvatarImage from '../(aux)/avatar'
import { OwnerData, PropertyData, ReviewData } from '@/api/Properties'


export default function OwnerProfile() {
    const [propertyList, setPropertyList] = useState<PropertyData[] | null>(null);
    const [ownerData, setOwnerData] = useState<OwnerData | null>(null);
    const [ownerReviews, setOwnerReviews] = useState<ReviewData[] | null>(null);
    const [reviewUsernames, setReviewUsernames] = useState([])
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState<'Details' | 'Reviews'>('Details');
    let { owner_id } = useLocalSearchParams();
    const hasFetched = useRef(null)

    //working on realtime changes in review table
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

  return (
    <SafeAreaView className='flex-1'>
        
      {loading ? (
        <View className='flex-1 justify-center items-center'>
            <Text>Loading...</Text>
        </View>
      ) : (
        <ScrollView>
        <BackButton/>
        <View>
            <View className='items-center '>
                <View className='rounded-full border  border-white bg-white h-40 w-40'>
                    <AvatarImage username={ownerData?.first_name}/>
                </View>
            </View>

            <View>
                <View className='items-center mt-5'>
                    <Text className='text-2xl font-semibold'>{ownerData?.first_name}</Text>
                    <Text className='text-lg'>Owner of {propertyList[0]?.name}</Text>
                    <View className='flex-row items-center gap-x-1 mt-1'>
                        <Text className='text-blue-700'>Verified</Text>
                        <Ionicons name='shield-checkmark-outline' color={"#1d4ed8"}/>
                    </View>
                </View>

                <View className='items-center mt-10'>
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
                </View>

                <View>
                {activeTab === 'Details' && (
                    <View className='p-5 gap-y-3'>
                        <View className='gap-y-2'>
                            <Text className='text-xl font-medium'>Bio</Text>

                            <Text>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</Text>
                        </View>

                        <View className='gap-y-3'>
                            <Text className='text-xl font-medium'>Contact Details</Text>
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
                                <Text className='text-base'>{ownerData?.first_name}</Text>
                            </View>
                        </View>

                        <View className='gap-y-3'>
                            <Text className='text-xl font-medium'>Owned Properties</Text>

                            {propertyList.map((item, index) => (
                                <View key={index} className='overflow-hidden'>
                                    <Pressable onPress={() => {}}>
                                        <View className='p-2'>
                                            <View style={{ width: 160, height: 144 }}>
                                                {!hasFetched.current && (
                                                    <SingleImageDisplay propertyID={item.property_id} />
                                                )} 
                                            </View>

                                            <View className='mt-2'>
                                                <Text className='font-semibold text-xl'>{item.name}</Text>
                                                <Text>{item.price}</Text>
                                            </View>
                                        </View>
                                    </Pressable>
                                </View>
                            ))}
                        </View>
                    </View>
                )}
                    {activeTab === 'Reviews' && (
                    <View className='p-5'>
                        <View className='mb-5'>
                            <Text className='w-80 mx-auto text-center italic'>Note: Only previous tenants and currently boarding are allowed to leave reviews for the owner.</Text>
                        </View>
                        <Text className='text-xl font-medium'>({ownerReviews ? ownerReviews.length : 0}) Reviews</Text>

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
                    )}


                    
                </View>
            </View>
        </View>
        </ScrollView>
      )}
    </SafeAreaView>
  )
}