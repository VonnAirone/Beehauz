// import { Pressable, Text, View, ScrollView, ActivityIndicator, TouchableOpacity, Image } from 'react-native'
// import React, { useEffect, useRef, useState } from 'react'
// import { SafeAreaView } from 'react-native-safe-area-context'
// import BackButton from '@/components/back-button'
// import { Ionicons } from '@expo/vector-icons'
// import { fetchPropertyData, getProfile } from '@/api/DataFetching'
// import { SingleImageDisplay } from '../(aux)/homecomponents'
// import { supabase } from '@/utils/supabase'
// import StarRatingComponent from '../(aux)/starrating'
// import { Link, useLocalSearchParams } from 'expo-router'
// import AvatarImage from '../(aux)/avatar'
// import { PropertyData, ReviewData, UserData } from '@/api/Properties'
// import LoadingComponent from '@/components/LoadingComponent'


// export default function OwnerProfile() {
//     const [propertyList, setPropertyList] = useState<PropertyData[] | null>(null);
//     const [ownerData, setOwnerData] = useState<UserData | null>(null);
//     const [ownerReviews, setOwnerReviews] = useState<ReviewData[] | null>(null);
//     const [reviewUsernames, setReviewUsernames] = useState([])
//     const [loading, setLoading] = useState(true)
//     const [activeTab, setActiveTab] = useState<'Details' | 'Reviews'>('Details');
//     let { owner_id } = useLocalSearchParams();
//     const hasFetched = useRef(null)

//     //working on realtime changes in review table
//     useEffect(() => {
//         fetchData();     
//         const unsubscribe = listenToRealTimeChanges();
//         return () => {
//             if (unsubscribe) {
//                 unsubscribe();
//             }
//         }
//     }, []);

//     function listenToRealTimeChanges() {
//         const reviews = supabase.channel('custom-all-channel')
//         .on(
//         'postgres_changes',
//         { event: '*', schema: 'public', table: 'owner_reviews' },
//         (payload) => {
//             fetchData()
//             console.log("Updated reviews!", payload)
//         }
//         )
//         return () => {
//             reviews.unsubscribe();
//         };
//     }

//     async function fetchData() {
//         if(!hasFetched.current) {
//             try {
//                 const [profileData, propertyData, ownerReviews] = await Promise.all([
//                     getUserProfile(owner_id.toString()),
//                     fetchOwnerProperties(),
//                     getReviews(),
//                 ]);
//                 setOwnerData(profileData);
//                 setPropertyList(propertyData);
//                 setOwnerReviews(ownerReviews);
    
//                 const tenant_id = ownerReviews.map(review => review.tenant_id);
//                 const tenantData = await Promise.all(tenant_id.map(id => getProfile(id)));
//                 const usernames = tenantData.map(tenant => tenant.name);
//                 setReviewUsernames(usernames);
//             } catch (error) {
//                 console.error('Error fetching data:', error);
//             } finally {
//                 setLoading(false);
//             }
//         }
//     }

//     async function getUserProfile(id: string) {
//         try {
//             const data = await getProfile(id);
//             return data;
//         } catch (error) {
//             console.log("Error fetching owner", error.message);
//             throw error;
//         }
//     }

//   return (
//     <SafeAreaView className='flex-1'>
        
//       {loading ? (
//         <LoadingComponent/>
//       ) : (
//         <ScrollView 
//         showsVerticalScrollIndicator={false}
//         className='p-5'>
        
//         <BackButton/>
//         <View>
//           <View className='items-center bg-yellow rounded-md mt-2 h-32 mb-6'>
//             <View className='absolute -bottom-10 rounded-full border-2 border-yellow bg-white h-28 w-28'>
//                 <AvatarImage username={ownerData?.first_name}/>
//             </View>
//           </View>

//           <View>
//             <View className='items-center mt-5'>
//               <Text className='text-2xl font-semibold'>{ownerData?.first_name} {ownerData?.last_name}</Text>
//               <Text>Owner of {propertyList[0]?.name}</Text>
//             </View>

//               <View>
//                 {activeTab === 'Details' && (
//                 <View className='gap-y-3'>
//                   <View className='gap-y-2'>
//                       <Text className='font-semibold text-base'>Bio</Text>

//                       <Text>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</Text>
//                   </View>

//                   <View className='gap-y-3'>
//                     <Text className='font-semibold'>Contact Details</Text>
//                     <View className='flex-row items-center gap-x-4'>
//                         <Ionicons name='call' size={18}/>
//                         <Text className='text-base'>{ownerData?.phone_number}</Text>
//                     </View>

//                     <View className='flex-row items-center gap-x-4'>
//                       <Ionicons name='mail' size={18}/>
//                       <Text className='text-base'>{ownerData?.email}</Text>
//                     </View>

//                     <View className='flex-row items-center gap-x-4'>
//                       <Ionicons name='logo-facebook' size={18}/>
//                       <Text className='text-base'>{ownerData?.first_name} {ownerData.last_name}</Text>
//                     </View>
//                   </View>
//         </ScrollView>
//     )}}
//     </SafeAreaView>
//   )
// }