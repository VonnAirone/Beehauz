import { FlatList, Pressable, StyleSheet, Text, View, ScrollView, ActivityIndicator } from 'react-native'
import React, { useEffect, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import BackButton from '@/components/back-button'
import { Ionicons } from '@expo/vector-icons'
import { fetchPropertyData, getProfile } from '@/api/DataFetching'
import { SingleImageDisplay } from '../(aux)/homecomponents'
import { useLocalSearchParams } from 'expo-router'
import RatingComponent from '../(aux)/rating'
import { supabase } from '@/utils/supabase'

interface OwnerData {
    name: string;
    address: string;
    email: string;
    gender: string;
    phone_number: string;
    age: string;
}

type PropertyData = {
    property_id: string;
    name: string;
    price: string;
    view_count: number;
    address: string;
}

export default function OwnerProfile() {
    const [propertyList, setPropertyList] = useState<PropertyData[] | null>(null);
    const [ownerData, setOwnerData] = useState<OwnerData | null>(null);
    const [ownerReviews, setOwnerReviews] = useState<any[]>([]);
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState<'Details' | 'Reviews'>('Details');
    let owner_id = "d9899903-c412-4d9f-bd71-23d4927773fd";

    useEffect(() => {
        setLoading(true);
        fetchData();
        console.log(ownerReviews)

        async function fetchData() {
            try {
                const [profileData, propertyData] = await Promise.all([
                    getOwnerProfile(),
                    fetchOwnerProperties()
                ]);
                setOwnerData(profileData);
                setPropertyList(propertyData);
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        }
    }, []);
    
    async function getOwnerProfile() {
        try {
            const data = await getProfile(owner_id.toString());
            return data;
        } catch (error) {
            console.log("Error fetching owner", error.message);
            throw error;
        }
    }
    
    async function getReviews() {
        try {
            const { data } = await supabase.from("owner_reviews").select("*").eq('owner_id)', owner_id)

            setOwnerReviews(data)
            
        } catch (error) {
            console.log("Error fetching owner reviews: ", error.message)
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
    <ScrollView className='flex-1'>
        <BackButton/>
      {loading ? (
        <View>
            <ActivityIndicator size="large" color="#FFA233"/>
        </View>
      ) : (
        <View>
            <View className='items-center '>
                <View className='rounded-full border  border-white bg-white h-40 w-40'>
                </View>
            </View>

            <View>
                <View className='items-center mt-5'>
                    <Text className='text-2xl font-semibold'>{ownerData?.name}</Text>
                    <Text className='text-lg'>Owner of {propertyList[0]?.name}</Text>
                    <View className='flex-row items-center gap-x-1 mt-1'>
                        <Text className='text-blue-700'>Verified</Text>
                        <Ionicons name='shield-checkmark-outline' color={"#1d4ed8"}/>
                    </View>
                </View>

                <View className='items-center mt-10'>
                    <View className='flex-row gap-x-20'>
                        <Pressable onPress={() => setActiveTab('Details')}>
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
                                <Text className='text-base'>{ownerData?.name}</Text>
                            </View>
                        </View>

                        <View className='gap-y-3'>
                            <Text className='text-xl font-medium'>Owned Properties</Text>

                            {propertyList.map((item, index) => (
                                <View key={index} className='overflow-hidden'>
                                    <Pressable onPress={() => {}}>
                                        <View className='p-2'>
                                            <View style={{ width: 160, height: 144 }}>
                                                <SingleImageDisplay propertyID={item.property_id} />
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
                            <Text className='text-xl font-medium'>(10) Reviews</Text>
                            
                            <View className='flex-row items-center gap-x-2 justify-center py-4'>
                                <View className='bg-gray-300 h-16 w-16 rounded-full'/>
                                <View>
                                    <View>
                                        <Text className='font-semibold text-lg'>Name of User</Text>
                                    </View>
                                    <View>
                                        <Text>Rating</Text>
                                    </View>
                                    <View className='w-72'>
                                        <Text>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</Text>
                                    </View>
                                </View>
                            </View>
                        </View>
                    )}


                    
                </View>
            </View>
        </View>
      )}
    </ScrollView> 
    </SafeAreaView>
  )
}