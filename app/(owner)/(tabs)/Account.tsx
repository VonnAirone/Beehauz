import { Pressable, SafeAreaView, Text, View, Modal, Alert, TextInput, TouchableWithoutFeedback, Keyboard, Image, TouchableOpacity } from 'react-native';
import React, { useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/utils/supabase';
import { useAuth } from '@/utils/AuthProvider';
import { getProfile } from '@/app/api/DataFetching';
import { OwnerData, UserData } from '@/app/api/Properties';
import { router } from 'expo-router';

export default function Account() {
  const auth = useAuth();
  const user = auth.session?.user;
  const [modalVisible, setModalVisible] = useState(false);
  const [userProfile, setUserProfile] = useState<UserData | null>(null)
  const [avatar, setAvatar] = useState(null);
  const [owner, setOwner] = useState<OwnerData | null>(null)
  const [property, setProperty] = useState('')
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
    subscribeToChanges();
    subscribeToVerificationStatusChanges();
  }, []); 

  async function fetchData() {
    try {
      setLoading(true)

      await Promise.all([
        getUserProfile(),
        fetchAvatar(),
        getProperty(),
        ownerStatus(user?.id)
      ])
    } catch (error) {
      console.log("Error fetching data: ", error.message)
    } finally {
      setLoading(false)
    }
   
  }

  async function ownerStatus(userID) {
    try {
      const {data, error} = await supabase
      .from('owners')
      .select('*')
      .eq('owner_id', userID)
      .single()
      
      if (data) {
       setOwner(data)
      }
    } catch (error) {
      
    }
  }

  async function getProperty() {
    try {
      const { data, error } = await supabase
        .from("property")
        .select()
        .eq("owner_id", user?.id)
        .single()
      
      if (data) {
        setProperty(data?.property_id)
      }
    } catch (error) {
      console.log("Error fetching property: ", error.message)
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

  async function subscribeToVerificationStatusChanges() {
    const channels = supabase
      .channel('profile-update')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'owners' },
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

  async function subscribeToChanges() {
    const channels = supabase
      .channel('profile-update')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'profiles' },
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
      setLoading(true)
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
    } finally {
     
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


  async function signOUt() {
    const { error } = await supabase.auth.signOut()

    if (error) {
      console.log('Error message', error.message)
    }
  } 

  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      <SafeAreaView className='flex-1 p-5'>

        <View
        className='mt-10 flex-row items-center'>
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
            <View className='flex-row items-center gap-x-2'>
              <Text className='font-medium italic'>Owner</Text>
              {loading ? (
                <View className='h-3 bg-gray-200 w-20 rounded-md'/>
                
              ) : (
                <>
                  {owner?.status === 'Unverified' ? (
                    <TouchableOpacity
                    onPress={() => router.push("/(owner)/(verification)/VerificationPage")}>
                      <Text className='text-xs text-blue-700'>{`(${owner?.status})`}</Text>
                    </TouchableOpacity>
                  ) : owner?.status  === 'Pending Verification' ? (
                    <View>
                      <Text className='text-xs text-blue-700 ml-2'>{`(${owner?.status})`}</Text>
                    </View>
                  ) : (
                    <View className='flex-row items-center ml-2'>
                      <Ionicons name='shield-checkmark' color={'blue'}/>
                      <Text className='text-xs text-blue-700 ml-1'>{owner?.status}</Text>
                    </View>
                  )}
                 
                </>

              )}
            </View>

            {loading ? (
              <>
                <View className='h-3 bg-gray-200 w-20 rounded-md mt-2'/>
                <View className='h-2 bg-gray-200 w-10 rounded-md mt-1'/>
                <View className='h-2 bg-gray-200 w-10 rounded-md mt-1'/>
              </>
            ) : (
              <>
                <Text className='font-semibold text-xl'>{userProfile?.first_name} {userProfile?.last_name}</Text>
                <Text className='text-xs'>{userProfile?.gender}</Text>
                <Text className='text-xs'>{userProfile?.age}</Text>
              </>
            )}           
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
          <View className='flex-row justify-between rounded-md p-3'>
            <View className='flex-row items-center gap-x-2'>
              <Ionicons name='mail-outline' size={18}/>
              <Text className='font-semibold'>Email</Text>
            </View>

            <View>
              {loading ? (
                <View className='h-3 bg-gray-200 w-40 rounded-md mt-2'/>
              ) : (
                <TextInput 
                editable={false}
                className='text-xs text-right'
                placeholder={user?.email}/>
              )}
              
            </View>
          </View>

          <View className='flex-row justify-between rounded-md p-3'>
            <View className='flex-row items-center gap-x-2'>
              <Ionicons name='phone-portrait-outline' size={18}/>
              <Text className='font-semibold'>Phone</Text>
            </View>

            {loading ? (
                <View className='h-3 bg-gray-200 w-40 rounded-md mt-2'/>
              ) : (
              <TextInput 
              editable={false} 
              value={userProfile?.phone_number?.toString()}
              className='text-right text-xs'/>
            )}
          </View>

          <View className='flex-row justify-between rounded-md p-3'>
            <View className='flex-row items-center gap-x-2'>
              <Ionicons name='location-outline' size={18}/>
              <Text className='font-semibold'>Location</Text>
            </View>

            {loading ? (
                <View className='h-3 bg-gray-200 w-40 rounded-md mt-2'/>
              ) : (
              <TextInput 
              editable={false}
              value={userProfile?.address}
              className='text-right text-xs'/>
              )}
          </View>
          
        </View>

        <View>
          <Text className='font-semibold text-gray-700'>Utilities</Text>
        </View>

        <View className='gap-y-3 mt-3 mb-10'>
          <View className='rounded-md overflow-hidden'>
            <Pressable 
            onPress={() => router.push({pathname: "/(owner)/(screens)/Transactions", params: {property}})}
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

