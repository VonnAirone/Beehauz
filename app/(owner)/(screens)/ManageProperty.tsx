import React, { useEffect, useState, useRef } from 'react';
import { Text, View, Alert, TextInput, Pressable, FlatList, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/utils/AuthProvider';
import { supabase } from '@/utils/supabase';
import { loadImages, uploadImage } from '@/api/ImageFetching';
import { fetchAmenities, fetchPropertyDetailsData, fetchPropertyTerms } from '@/api/DataFetching';
import { PropertyData, PropertyTerms } from '@/api/Properties';
import { Ionicons } from '@expo/vector-icons';
import { Images } from '@/app/(tenant)/(aux)/homecomponents';
import BackButton from '@/components/back-button';
import { useLocalSearchParams } from 'expo-router';
import LoadingComponent from '@/components/LoadingComponent';


export default function BHDetails() {
  const user = useAuth()?.session.user;
  const [data, setData] = useState<PropertyData | null>(null);
  const [propertyTerms, setPropertyTerms] = useState<PropertyTerms | null>(null);
  const params = useLocalSearchParams()
  const propertyID = params?.propertyID?.toString()
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [amenities, setAmenities] = useState([]);
  const [allowEdit, setAllowEdit] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [typedAmenity, setTypedAmenity] = useState('')

  // const handleAddAmenity = () => {
  //   if (typedAmenity) {
  //     setAmenities(prevAmenities => [...prevAmenities, typedAmenity]);
  //     setTypedAmenity('')
  //   } else {
  //     Alert.alert("Please type in the amenity you want to add.")
  //   }
   
  // };

  // const handleRemoveAmenity = (index) => {
  //   const newAmenities = [...amenities];
  //   newAmenities.splice(index, 1);
  //   setAmenities(newAmenities);
  // };
  
  const handleChangeText = (key, value) => {
    setData(prevData => ({
      ...prevData,
      [key]: value
    }));
  };

  const termChange = (key, value) => {
    setPropertyTerms(prevTerms => ({
      ...prevTerms,
      [key]: value
    }));
  };

  async function fetchData() {
    try {
      setLoading(true)
      const fetchedData = await fetchPropertyDetailsData(propertyID)
      setData(fetchedData)
      setAmenities(data?.amenities)
      await loadImages(propertyID, setImages)
      await fetchPropertyTerms(propertyID, setPropertyTerms)
    } catch (error) {
      console.log("Error fetching data: ", error.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { 
    console.log(typedAmenity)
    fetchData()
  }, [user?.id, propertyID]);

  const handleUpdateProperty = async () => {
    const propertyData = {
      name: data?.name,
      description: data?.description,
      address: data?.address,
      price: data?.price,
      amenities: amenities,
      available_beds: data?.available_beds,
      reservation_fee: data?.reservation_fee
    };

    const terms = {
      property_id: propertyID,
      advance_payment: propertyTerms?.advance_payment,
      security_deposit: propertyTerms?.security_deposit,
      minimum_stay: propertyTerms?.minimum_stay, 
      electricity_bill: propertyTerms?.electricity_bill,
      water_bills: propertyTerms?.water_bills
    }

    try {
      setLoading(true)
      const { data: propertyUpdate, error: propertyError } = await supabase
      .from('property')
      .update(propertyData)
      .eq('property_id', propertyID)

      if (propertyError) {
        console.log("Error updating property: ", propertyError.message)
      } else {
        const refreshedData = await fetchPropertyDetailsData(propertyID.toString());
        setData(refreshedData);
        
        const { data: termsData, error: termsError } = await supabase
        .from('property_terms')
        .upsert(terms, {
          onConflict: 'property_id'
        })

        if (termsError) {
          console.log("Error updating property details: ", termsError.message)
        } else {
          fetchData()
          Alert.alert("Succesfully updated property details.")
          setLoading(false)
        }

      }
    } catch (error) {
      console.error('Error updating property:', error);
      Alert.alert('Error', 'Failed to update property details. Please try again later.');
    }
  };

  async function uploadPropertyImage() {
    setUploading(true)
    await uploadImage(propertyID)
    await loadImages(propertyID, setImages)
    setUploading(false)
  }
 

  return (
      <SafeAreaView className='flex-1'>
        {loading ? (
          <LoadingComponent/>
        ) : (
      <ScrollView 
        showsVerticalScrollIndicator={false}
        className='p-5'>
          <BackButton/>
          <View className='flex-row items-center justify-between mt-4'>
            <Text className='font-semibold text-xl'>Manage Property</Text>
            <Pressable 
            className='flex-row items-center gap-x-1'
            onPress={() => setAllowEdit(!allowEdit)}>
              <Ionicons name='pencil' size={15}/>
              <Text>Edit</Text>
            </Pressable>
            
          </View>

          <View className='gap-y-2 mt-5'>
            <Text className='font-semibold'>Number of Beds Available</Text>
            <TextInput 
            onChangeText={(text) => handleChangeText('available_beds', text)}
            className='w-full border border-gray-200 rounded-md py-2 px-5' 
            value={data?.available_beds?.toString()}
            editable={allowEdit}/>
          </View>

          <View className='gap-y-2 mt-5'>
            <Text className='font-semibold'>Reservation Fee</Text>
            <TextInput 
            onChangeText={(text) => handleChangeText('reservation_fee', text)}
            className='w-full border border-gray-200 rounded-md py-2 px-5' 
            value={data?.reservation_fee?.toString()}
            editable={allowEdit}/>
          </View>

          <View className='gap-y-2 mt-2'>
            <Text className='font-semibold'>Property Name </Text>
            <TextInput 
            onChangeText={(text) => handleChangeText('name', text)}
            className='w-full border border-gray-200 rounded-md py-2 px-5' value={data?.name}
            editable={allowEdit}/>
          </View>

          <View className='gap-y-2 mt-2'>
            <Text className='font-semibold'>Description</Text>
            <TextInput className='w-full border border-gray-200 rounded-md py-2 px-5'
            onChangeText={(text) => handleChangeText('description', text)} 
            editable={allowEdit}
            multiline
            value={data?.description}/>
          </View>

          <View className='gap-y-2 mt-2'>
            <Text className='font-semibold'>Address</Text>

            <View className='flex-row items-center gap-x-2'>
              <Pressable 
              style={{backgroundColor: "#444"}}
              className='p-3 rounded-md'>
                <Ionicons name='location' color={"white"} size={20}/>
              </Pressable>
              
              <TextInput 
              className='grow border border-gray-200 rounded-md py-2 px-5'
              onChangeText={(text) => handleChangeText('address', text)}
              editable={allowEdit} 
              multiline
              value={data?.address}/>
            </View>
            
          </View>

          <View className='gap-y-2 mt-2'>
            <Text className='font-semibold'>Images</Text>
            {images.length > 0 ? (
            <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
              data={images}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => 
              <View className='h-20 w-20 mr-2'> 
                <Pressable>
                  <Images item={{...item, propertyID}} />
                </Pressable>
              </View>}
              initialNumToRender={4}
              maxToRenderPerBatch={5}
              windowSize={7}
            />
            ) : (
              <View className='h-20 w-20 bg-gray-200'/>
            )}

            {allowEdit && (
              <Pressable 
              disabled={uploading}
              onPress={uploadPropertyImage}
              className='bg-gray-50 rounded-md p-3'>
                {uploading ? (
                    <View className='flex-row items-center justify-center gap-x-2'>
                      <Text>Uploading</Text>
                      <ActivityIndicator/>
                    </View>
                ) : (
                  <View className='flex-row items-center justify-center gap-x-2'>
                    <Ionicons name='camera-outline'/>
                    <Text>Add Property Image</Text>
                  </View>
                )}

              </Pressable>
            )}

          </View>

          <View className='gap-y-2 mt-2'>
            <Text className='font-semibold'>Payment Terms</Text>

            <View className='gap-y-2'>
              <View className='my-1 grow'>
                <Text className='text-xs'>Renting Fee: </Text>
                <TextInput
                onChangeText={(text) => handleChangeText('price', text)}
                editable={allowEdit}
                value={String(data?.price)}
                className='border border-gray-200 rounded-md py-2 px-5 mt-1'/>
              </View>
            </View>

            <View className='flex-row gap-x-4'>
              <View className='my-1 grow'>
                <Text className='text-xs'>Advance Payment: </Text>
                <TextInput
                 onChangeText={(text) => termChange('advance_payment', text)} 
                editable={allowEdit}
                value={propertyTerms?.advance_payment}
                className='border border-gray-200 rounded-md py-2 px-5 mt-1'/>
              </View>

              <View className='my-1 grow'>
                <Text className='text-xs'>Security Deposit: </Text>
                <TextInput
                onChangeText={(text) => termChange('security_deposit', text)}
                editable={allowEdit}
                value={propertyTerms?.security_deposit}
                className='border border-gray-200 rounded-md py-2 px-5 mt-1'/>
              </View>
            </View>

          </View>

          <View className='gap-y-2 mt-2'>
            <Text className='font-semibold'>Additional Terms</Text>
            <View className='my-1 grow'>
              <Text className='text-xs'>Minimum Stay: </Text>
              <TextInput
              onChangeText={(text) => termChange('minimum_stay', text)}
              editable={allowEdit}
              value={propertyTerms?.minimum_stay}
              className='border border-gray-200 rounded-md py-2 px-5 mt-1'/>
            </View>

            <View className='my-1 grow'>
              <Text className='text-xs'>Electricity Bill: </Text>
              <TextInput
              onChangeText={(text) => termChange('electricity_bill', text)}
              editable={allowEdit}
              value={propertyTerms?.electricity_bill}
              className='border border-gray-200 rounded-md py-2 px-5 mt-1'/>
            </View>

            <View className='my-1 grow'>
              <Text className='text-xs'>Water Bill: </Text>
              <TextInput
              onChangeText={(text) => termChange('water_bills', text)}
              editable={allowEdit}
              value={propertyTerms?.water_bills}
              className='border border-gray-200 rounded-md py-2 px-5 mt-1'/>
            </View>

          </View>
          

          {/* <View className='gap-y-2 mt-2'>
            <View className='flex-row items-end gap-x-1'>
              <Text className='font-semibold'>Amenities</Text>
              <Pressable onPress={() => setShowModal(true)}>
                <Ionicons name='help-circle-outline' size={15}/>
              </Pressable>
            </View>
            

            {showModal && (
            <Pressable 
            onPress={() => setShowModal(false)}
            className='bg-gray-50 border  p-3 rounded-md absolute z-10 w-full flex-row items-center justify-between'>
              <View className='w-72'>
                <Text className='text-xs'>Amenities typically refer to the facilities and services provided to the residents for their comfort, convenience, and daily living needs.</Text>
                <Text className='mt-2 text-xs italic'>Ex. Wi-Fi, Common CR, Private Bathroom, Kitchen, Laundry Area</Text>
              </View>

              <Ionicons name='close-outline' size={15}/>
            </Pressable>
            )}
            

            <FlatList 
              horizontal
              data={data?.amenities}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item, index }) => (
                <View className='mr-2'>
                  <View key={item} className='flex-row items-center rounded-lg border border-gray-500 py-1.5 px-3 text-xs font-bold uppercase text-white'>
                    <Text className='text-center text-xs mr-2'>{item}</Text>
                    {allowEdit && 
                    <Pressable onPress={() => handleRemoveAmenity(index)}>
                      <Ionicons name='close-outline'  color={'#444'} size={15}/>
                    </Pressable>
                    
                    }
                  </View>
                </View>
              )}
            />

            <View className='flex-row items-center py-2 px-5 justify-between border border-gray-200 rounded-md'>
              <TextInput 
              value={typedAmenity}
              placeholder='Add an amenity'
              onChangeText={(text) => setTypedAmenity(text)}/>
              
              <Pressable 
              android_ripple={{color: "white"}}
              style={{backgroundColor: "#444"}}
              onPress={handleAddAmenity}
              className='p-1 rounded-sm'>
                <Ionicons 
                name='add' 
                size={20}
                color={'white'}/>
              </Pressable>
            </View> */}

            <View className='pt-10'>
              <Pressable 
              android_ripple={{color: "white"}}
              style={{backgroundColor: "#444"}}
              onPress={handleUpdateProperty}
              className='rounded-md p-3'>
                <Text className='text-center text-white'>{loading ? 'Loading' : 'Save Changes'}</Text>
              </Pressable>
            </View>

            <View className='h-10'></View>
        </ScrollView>
        )}
      </SafeAreaView>
  );
}
