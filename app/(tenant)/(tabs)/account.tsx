import { Pressable, SafeAreaView, Text, View, Modal, Alert, TextInput, TouchableWithoutFeedback, Keyboard, Image } from 'react-native';
import React, { memo, useEffect, useRef, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import Logo from '@/components/logo';
import { supabase } from '@/utils/supabase';
import { downloadAvatar, loadAvatar } from '@/api/ImageFetching';
import { getProfile } from '@/api/DataFetching';
import { useAuth } from '@/utils/AuthProvider';
import { getUsername } from '../(aux)/usercomponent';

export default function Account() {
  const user = useAuth().session?.user;
  const [phoneNumber, setPhoneNumber] = useState('')
  const [email, setEmail] = useState(user?.email)
  const [modalVisible, setModalVisible] = useState(false);
  const [onEditMode, setOnEditMode] = useState(false);
  const [isChangeMade, setIsChangeMade] = useState(false)
  const [username, setUsername] = useState('')
  const hasFetched = useRef(false);
  const [imagesLoaded, setImagesLoaded] = useState(false);

  useEffect(() => {
    getUsername(user?.id, setUsername);

    if (!hasFetched.current) {
      async function fetchData() {
        try {
          await loadAvatar(username, setImagesLoaded);
        } catch (error) {
          console.error('Error fetching data:', error);
        }
      }
      fetchData();
    }
  }, []);


  const updateUserData = async ({phoneNumber}) => {
    
    const { data, error } = await supabase.auth.updateUser({
      phone: phoneNumber
    });

    if (error) {
      console.error('Error fetching user data:', error.message);
    } else {
      console.log('User data:', data);
    }
  }

  const handleEmailChange = (text) => {
    setEmail(text)
    setIsChangeMade(!!text)
  }

  const handlePhoneChange = (text) => {
    setPhoneNumber(text)
    setIsChangeMade(!!text)
  }

  async function signOUt() {
    const { error } = await supabase.auth.signOut()

    if (error) {
      console.log('Error message', error.message)
    }
  }

  const Avatar = memo(({ item }: { item: any }) => {
    const [image, setImage] = useState<string | null>(null);
  
    useEffect(() => {
      if (!image) {
        downloadAvatar(username, item.name, setImage);
      } 
    }, [username, item.name]);
  
    if (!image) {
      return (
        <View></View>
      );
    }
  
    return (
      <Image
        className='w-full h-full rounded-full'
        source={{ uri: image }}
        resizeMode="cover"
      />
    );
  });

  const SingleImageDisplay = ({ username }) => {
    const [images, setImages] = useState([]);
    const hasFetched = useRef(false);
  
    useEffect(() => {
      if (!hasFetched.current) {
        const fetchImages = async () => {
          try {
            await loadAvatar(username, setImages)
          } catch (error) {
            console.error('Error fetching images:', error);
          }
        };
    
        fetchImages();
      }
    }, [username]);

    
  
    if (images.length > 0) {
      const firstImage = images[0];
      return (
        <View className="flex-1">
          <Avatar 
          item={{ ...firstImage, username }} />
        </View>
      );
    }}

  return (
    <TouchableWithoutFeedback className='flex-1' onPress={() => Keyboard.dismiss()}>
      <SafeAreaView className='flex-1 w-80 justify-center m-auto '>
        <View className='items-start -left-4'>
          <Logo/>
        </View>

        <View className='items-center mb-10'>
          <View className='h-20 w-20 rounded-full mb-2'>
            {imagesLoaded && (
              <SingleImageDisplay username={username}/>
            )}
            
          </View>
          <Text className='text-xl font-semibold'>Airone Vonn Villasor</Text>
        </View>

        <View className='flex-row justify-between'>
          <Text className='text-base text-yellow'>Personal Information</Text>
          <Pressable 
          onPress={() => setOnEditMode(!onEditMode)}
          
          className='flex-row items-center gap-x-1'>
            <Ionicons color={onEditMode ? '#FF8B00' : 'black'} name='pencil'/>
            <Text className={onEditMode ? 'text-yellow' : 'black'}>Edit</Text>
          </Pressable>
        </View>

          {onEditMode && (
          <View className='self-center absolute top-10 p-3 rounded-md bg-yellow'>
            <Text className='text-center'>On Edit Mode</Text>
          </View>
          )}


        <View className='gap-y-3 mt-3 mb-10'>
          <View className='flex-row justify-between p-2'>
            <View className='flex-row items-center gap-x-2 opacity-60'>
              <Ionicons name='mail-outline' size={18}/>
              <Text className='text-base'>Email</Text>
            </View>

            <View>
              <TextInput 
                editable={onEditMode}
                placeholderTextColor={onEditMode? 'black' : 'gray'}  
                placeholder={email}/>
            </View>
          </View>

          <View className='border-b opacity-10'></View>

          <View className='flex-row justify-between p-2'>
            <View className='flex-row items-center gap-x-2 opacity-60'>
              <Ionicons name='phone-portrait-outline' size={18}/>
              <Text className='text-base'>Phone</Text>
            </View>

            <View className='relative w-40'>
              <TextInput 
              editable={onEditMode} 
              onChangeText={handlePhoneChange}
              placeholderTextColor={onEditMode? 'black' : 'gray'} 
              placeholder={!user?.phone ? 'Add your number' :  user?.phone}
              className='text-right'/>
            </View>
          </View>

          <View className='border-b opacity-10'></View>

          <View className='flex-row justify-between p-2'>
            <View className='flex-row items-center gap-x-2 opacity-60'>
              <Ionicons name='location-outline' size={18}/>
              <Text className='text-base'>Location</Text>
            </View>

            <View>
              <TextInput 
              editable={onEditMode}
              placeholderTextColor={onEditMode? 'black' : 'gray'} placeholder='Catungan 1, Sibalom, Antique' className='text-right'/>
            </View>
          </View>
          
          {onEditMode ? (          
          <View className='-bottom-10 right-0 absolute'>
            <Pressable className={`px-8 ${isChangeMade ? 'bg-yellow' : 'bg-slate-300'} py-2 rounded-md`}>
              <Text>Save</Text>
            </Pressable>
          </View>) : (
          <View className='-bottom-10 right-0 absolute'></View>
          )}


        </View>

        <View>
          <Text className='text-base text-yellow'>Utilities</Text>
        </View>

        <View className='gap-y-3 mt-3 mb-10'>
          <Pressable android_ripple={{color: 'f1f1f1'}} className='p-2'>
            <View className='flex-row justify-between items-center'>
              <View className='flex-row items-center gap-x-2 opacity-60'>
                <Ionicons name='document-text-outline' size={18}/>
                <Text className='text-base'>Transaction History</Text>
              </View>

              <View>
                <Ionicons name='chevron-forward-outline'/>
              </View>
            </View>
          </Pressable>

          <View className='border-b opacity-10'></View>

          <Pressable android_ripple={{color: 'f1f1f1'}} className='p-2'>
            <View className='flex-row justify-between items-center'>
              <View className='flex-row items-center gap-x-2 opacity-60'>
                <Ionicons name='information-circle-outline' size={18}/>
                <Text className='text-base'>Help Center</Text>
              </View>

              <View>
                <Ionicons name='chevron-forward-outline'/>
              </View>
            </View>
          </Pressable>

          <View className='border-b opacity-10'></View>

          <Pressable android_ripple={{color: 'f1f1f1'}} className='p-2'>
            <View className='flex-row justify-between items-center'>
              <View className='flex-row items-center gap-x-2 opacity-60'>
                <Ionicons name='star-half-outline' size={18}/>
                <Text className='text-base'>Rate this app</Text>
              </View>

              <View>
                <Ionicons name='chevron-forward-outline'/>
              </View>
            </View>
          </Pressable>

          <View className='border-b opacity-10'></View>

          <Pressable
          onPress={() => setModalVisible(true)}
          android_ripple={{color: 'f1f1f1'}} 
          className='p-2'>
            <View className='flex-row justify-between items-center'>
              <View className='flex-row items-center gap-x-2 opacity-60'>
                <Ionicons name='log-out-outline' size={18}/>
                <Text className='text-base'>Logout</Text>
              </View>

              <View>
                <Ionicons name='chevron-forward-outline'/>
              </View>
            </View>
          </Pressable>

          {/* <View className='border-b opacity-10'></View> */}

          {/* <Pressable
          onPress={() => {}}
          android_ripple={{color: 'f1f1f1'}} 
          className='p-2'>
            <View className='flex-row justify-between items-center'>
              <View className='flex-row items-center gap-x-2 opacity-60'>
                <Ionicons name='log-out-outline' size={18} color={'red'}/>
                <Text className='text-base text-red-500'>Delete account</Text>
              </View>

              <View>
                <Ionicons name='chevron-forward-outline' color={'red'}/>
              </View>
            </View>
          </Pressable> */}
          
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
            <View className='bg-white h-40 w-80 rounded-md justify-center'>

              <Pressable
              onPress={() => setModalVisible(false)} 
              className='absolute top-2 right-3'>
                <Ionicons name='close-outline' size={20}/>
              </Pressable>

              <Text className='text-center font-semibold text-base mb-10'>Are you sure about logging out?</Text>
              <View className='flex-row justify-evenly'>
                <View className='rounded-md overflow-hidden'>
                  <Pressable 
                  onPress={() => setModalVisible(false)}
                  android_ripple={{color: 'gray'}}
                  className='border border-gray-200 px-2 py-3 w-32'>
                    <Text className='text-center'>Cancel</Text>
                  </Pressable>
                </View>
                <View className='rounded-md overflow-hidden'>
                  <Pressable 
                  onPress={signOUt}
                  android_ripple={{color: 'yellow'}}
                  className='bg-yellow px-2 py-3 w-32 rounded-md'>
                    <Text className='text-center'>Logout</Text>
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

