import { Pressable, SafeAreaView, Text, View, Modal, Alert, TextInput, TouchableWithoutFeedback, Keyboard, Image } from 'react-native';
import React, { useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/utils/supabase';
import { useAuth } from '@/utils/AuthProvider';
import { fetchPropertyDetailsData, getProfile } from '@/api/DataFetching';
import { PropertyData, UserData } from '@/api/Properties';
import { router } from 'expo-router';
import { TouchableOpacity } from 'react-native-gesture-handler';

export default function Account() {
  const auth = useAuth();
  const user = auth.session?.user;
  const [modalVisible, setModalVisible] = useState(false);
  const [userProfile, setUserProfile] = useState<UserData | null>(null)
  const [avatar, setAvatar] = useState(null);
  const [property, setProperty] = useState<PropertyData | null>(null)
  const [dateJoined, setDateJoined] = useState('')

  useEffect(() => {
    fetchData();
    subscribeToChanges();
    subscribeToTenantTableChanges();
  }, []); 

  async function fetchData() {
    try {
      await getUserProfile();
      await fetchAvatar();
      await fetchProperty();
    } catch (error) {
      console.log("Error fetching data: ", error.message)
    }
    
  }

  async function signOUt() {
    const { error } = await supabase.auth.signOut()

    if (error) {
      console.log('Error message', error.message)
    }
  } 

  async function fetchProperty() {
    try {
      const { data, error } = await supabase
        .from("tenants")
        .select('*')
        .eq('tenant_id', user?.id.toString());

      if (data[0]?.property_id) {
        const property = await fetchPropertyDetailsData(data[0]?.property_id)
        setProperty(property)
        setDateJoined(data[0].date_joined)
      } else {
        console.log("No property found for the user.");
      }
  
      if (error) {
        console.log("Error fetching property: ", error.message);
      }
    } catch (error) {
      console.log("An error occurred while fetching property: ", error.message);
    }
  }
  

  async function getUserProfile() {
    try {
        const data = await getProfile(user?.id);
        setUserProfile(data);
    } catch (error) {
        console.log("Error fetching owner", error.message);
        throw error;
    }
  }

  async function subscribeToChanges() {
    const channels = supabase
      .channel('profile-updatesss')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'profiles' },
        (payload) => {
          console.log('Change received!', payload);
          getUserProfile()
        }
      )
      .subscribe();
  
    return () => {
      channels.unsubscribe();
    };
  }

  async function subscribeToTenantTableChanges() {
    const channels = supabase
      .channel('profile-update')
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

  const fetchAvatar = async () => {
    try {
      const { data } = await supabase.storage.from('images').list(`avatars/${user?.id}`);
      if (data && data.length > 0) {
        const lastAvatar = data[data.length - 1];
        const avatarURL = await downloadAvatar(user?.id, lastAvatar.name);
        setAvatar(avatarURL);
      } else {
        console.log('No avatar found');
      }
    } catch (error) {
      console.error('Error loading avatar:', error.message);
    }
  };

  const downloadAvatar = async (userID, itemName) => {
    try {
      const { data } = await supabase.storage
        .from('images')
        .download(`avatars/${userID}/${itemName}`);
      
      if (data) {
        const fr = new FileReader();
        fr.readAsDataURL(data);
        fr.onload = () => {
          setAvatar(fr.result);
        };
      } else {
        console.log('No data for avatar');
        return null;
      }
    } catch (error) {
      console.error('Error downloading avatar:', error.message);
      return null;
    }
  };

  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      <SafeAreaView className='flex-1 p-5'>

        <View
        className='mt-5 flex-row items-center'>
          <View className='h-20 w-20 rounded-md'>
            {avatar ?
            (<Image 
            className='rounded-md'
            source={{ uri: avatar }} 
            style={{ width: '100%', height: "100%" }} 
            resizeMode='cover'/>) : 
            (
            <Image 
            className='rounded-md bg-white'
            source={require("@/assets/icon.png")} 
            style={{ width: '100%', height: "100%" }} 
            resizeMode='cover'/>
            )}
          </View>

          <View className='ml-4'>
            <Text className='font-medium italic'>Tenant</Text>
            <Text className='font-semibold text-xl'>{userProfile?.first_name} {userProfile?.last_name}</Text>
            <Text className='text-xs'>{userProfile?.age}</Text>
          </View>
        </View>

        <View className='flex-row justify-between mt-10'>
          <Text className='font-semibold text-gray-700'>Personal Information</Text>
            <Pressable 
            onPress={() => router.push("/(aux)/ManageProfile")}
            className='flex-row items-center gap-x-1'> 
              <Text>Edit</Text>
              <Ionicons name='chevron-forward-outline'/>
            </Pressable>
        </View>
        
        <View className='gap-y-3 mt-3 mb-10'>
          <View className='flex-row justify-between rounded-md p-2'>
            <View className='flex-row items-center gap-x-2'>
              <Ionicons name='mail-outline' size={18}/>
              <Text className='font-semibold'>Email</Text>
            </View>

            <View>
              <TextInput 
                editable={false}
                className='text-xs text-right'
                placeholder={userProfile?.email}/>
            </View>
          </View>

          <View className='flex-row justify-between rounded-md p-2'>
            <View className='flex-row items-center gap-x-2'>
              <Ionicons name='phone-portrait-outline' size={18}/>
              <Text className='font-semibold'>Phone</Text>
            </View>

            <View className='relative w-40'>
              <TextInput 
              editable={false} 
              value={userProfile?.phone_number.toString()}
              className='text-right text-xs'/>
            </View>
          </View>

          <View className='flex-row justify-between rounded-md p-2'>
            <View className='flex-row items-center gap-x-2'>
              <Ionicons name='location-outline' size={18}/>
              <Text className='font-semibold'>Location</Text>
            </View>

            <View>
              <TextInput 
              editable={false}
              value={userProfile?.address}
              className='text-right text-xs'/>
            </View>
          </View>

          <View className='flex-row justify-between rounded-md p-2'>
            <View className='flex-row items-center gap-x-2'>
              <Ionicons name='home-outline' size={18}/>
              <Text className='font-semibold'>Property</Text>
            </View>

            <View>
            {property ? (
              <TouchableOpacity 
              onPress={() => router.push({pathname: "/(tenant)/(screens)/TenantProperty", params: {propertyID: property?.property_id,
              date_joined: dateJoined}})}
              className='flex-row items-center'>
                <Text className='mr-1'>{property.name}</Text>
                <Ionicons name='chevron-forward'/>
              </TouchableOpacity>
            ) : (
              <Text>{property === null ? "Not boarding" : ""}</Text>
            )}
            </View>
          </View>
          
        </View>

        <View>
          <Text className='font-semibold text-gray-700'>Utilities</Text>
        </View>

        <View className='gap-y-3 mt-1 mb-10'>
          <View className='rounded-md overflow-hidden'>
            <Pressable 
            onPress={() => router.push("/(tenant)/(screens)/Transactions")}
            android_ripple={{color: 'f1f1f1'}} 
            className='rounded-md p-4'>
              <View className='flex-row justify-between items-center'>
                <View className='flex-row items-center gap-x-2'>
                  <Ionicons name='document-text-outline' size={18}/>
                  <Text className='font-semibold'>Transaction History</Text>
                </View>

                <View>
                  <Ionicons name='chevron-forward-outline'/>
                </View>
              </View>
            </Pressable>
          </View>

          <View className='rounded-md overflow-hidden'>
            <Pressable android_ripple={{color: 'f1f1f1'}} className='rounded-md p-4'>
              <View className='flex-row justify-between items-center'>
                <View className='flex-row items-center gap-x-2'>
                  <Ionicons name='information-circle-outline' size={18}/>
                  <Text className='font-semibold'>Help Center</Text>
                </View>

                <View>
                  <Ionicons name='chevron-forward-outline'/>
                </View>
              </View>
            </Pressable>
          </View>
         
         <View className='rounded-md overflow-hidden'>
            <Pressable 
            onPress={() => router.navigate("https://forms.gle/YM1LU7Q5cfvhJeeKA")}
            android_ripple={{color: 'f1f1f1'}} 
            className='rounded-md p-4'>
                <View className='flex-row justify-between items-center'>
                  <View className='flex-row items-center gap-x-2'>
                    <Ionicons name='star-half-outline' size={18}/>
                    <Text className='font-semibold'>Rate this app</Text>
                  </View>

                  <View>
                    <Ionicons name='chevron-forward-outline'/>
                  </View>
                </View>
            </Pressable>
         </View>

         <View className='rounded-md overflow-hidden'>
          <Pressable
            onPress={() => setModalVisible(true)}
            android_ripple={{color: 'f1f1f1'}} 
            className='rounded-md p-4'>
              <View className='flex-row justify-between items-center'>
                <View className='flex-row items-center gap-x-2'>
                  <Ionicons name='log-out-outline' size={18}/>
                  <Text className='font-semibold'>Logout</Text>
                </View>

                <View>
                  <Ionicons name='chevron-forward-outline'/>
                </View>
              </View>
            </Pressable>
         </View>
        </View>

        
        {/* MODAL AREA */}
        <Modal
          animationType="none"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => {
            Alert.alert('Modal has been closed.');
            setModalVisible(!modalVisible);
          }}>

          <View className='flex-1 justify-center items-center'>
            <View className='bg-white h-40 w-80 rounded-md justify-center border border-gray-200'>

              <Text className='text-center font-semibold mb-5'>Are you sure about logging out?</Text>
              <View className='flex-row justify-evenly'>
                <View className='rounded-md overflow-hidden'>
                  <Pressable 
                  onPress={() => setModalVisible(false)}
                  android_ripple={{color: 'gray'}}
                  className='border border-gray-200 rounded-md px-2 py-3 w-32'>
                    <Text className='text-center font-semibold'>Cancel</Text>
                  </Pressable>
                </View>
                <View className='rounded-md overflow-hidden'>
                  <Pressable 
                  onPress={signOUt}
                  android_ripple={{color: 'white'}}
                  style={{backgroundColor: "#444"}}
                  className='px-2 py-3 w-32 rounded-md'>
                    <Text className='text-white text-center font-semibold'>Logout</Text>
                  </Pressable>
                </View>

              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  )
}

