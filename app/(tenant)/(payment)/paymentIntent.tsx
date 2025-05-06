import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, Alert } from 'react-native';
import { useLocalSearchParams } from 'expo-router'; // Import useRouter and useSearchParams
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '@/utils/supabase';
import { useAuth } from '@/utils/AuthProvider';
import { fetchPropertyDetailsData, getProfile } from '@/app/api/DataFetching';
import { SingleImageDisplay } from '../(aux)/homecomponents';
import { Dropdown } from 'react-native-element-dropdown';
import BackButton from '@/app/components/back-button';
import { UserData } from '@/models/IUsers';

export default function PaymentIntent() {
  const user = useAuth()?.session.user;
  const [userData, setUserData] = useState<UserData | null>(null)
  const params = useLocalSearchParams()
  const [propertyDetails, setPropertyDetails] = useState(null);
  const [rentAmount, setRentAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [provider, setProvider] = useState('')

  useEffect(() => {
      async function fetchDetails() {
          const property = await fetchPropertyDetailsData(params.propertyID.toString());
          setPropertyDetails(property);

          const { data, error } = await supabase
              .from('rentals')
              .select('*')
              .eq('rental_id', params.rentalID)
              .single();

          if (error) {
              console.log('Error fetching rental data:', error.message);
          } else {
              setRentAmount(data.rent_amount);
              setPaymentMethod(data.payment_method);
              const userData = await getProfile(user.id)
              setUserData(userData)
          }
      }

      fetchDetails();
  }, [params.rentalID, params.propertyID.toString()]);

  function handlePayment() {
      console.log('Processing payment...');
  }

  const paymentMethods = [
    { label: 'Online Payment', value: 'Online Payment' },
    { label: 'Cash on Hand', value: 'Cash on Hand' },
  ];

  const onlinePaymentProvider = [
    { label: 'GCash', value: 'GCash' },
    { label: 'Maya', value: 'Maya' },
  ];

  const handleMethodPress = (selectedMethod) => {
    setPaymentMethod(prevMethod => prevMethod === selectedMethod ? null : selectedMethod);
  };

  const handleProviderPress = (selectedProvider) => {
    setProvider(prevMethod => prevMethod === selectedProvider ? null : selectedProvider);
  };

  function proceedToPayment(id) {
    // Provide default values to avoid calling trim on null or undefined
    const paymentMethodIsEmpty = (paymentMethod || '').trim() === '';
    const providerIsEmpty = (provider || '').trim() === '';

    if (paymentMethodIsEmpty || (paymentMethod === 'Online Payment' && providerIsEmpty)) {
        Alert.alert("Please select a payment method or provider.");
        return;
    } else {
        if (paymentMethod === 'Online Payment') {
            console.log('Online Payment method chosen.');
        } else if (paymentMethod === 'Cash on Hand') {
          updatePaymentMethod('Cash on Hand', id)
        }
    }
}

  async function updatePaymentMethod(paymentMethod, id) {
    try {
      const {error} = await supabase
      .from('rentals')
      .update({'payment_method': paymentMethod})
      .eq('rental_id', id)
    } catch (error) {
      console.log("Error updating rental status: ", error.message)
    } finally {
      Alert.alert('You have successfully updated your payment.')
    }
  }

  return (
    <SafeAreaView className='h-full '>
      <View className='p-5'>
        <BackButton/>
        <Text className='font-semibold text-xl'>Payment Details</Text>
            <View className='mt-4'>

              <View>
                <Text className='font-semibold'>Personal Information</Text>
                <View className='mt-2'>
                  <Text>Name: <Text className='font-medium text-base'>{userData?.first_name} {userData?.last_name}</Text></Text>
                  <Text>Address: {userData?.address}</Text>
                  <Text>Contact Number: 0{userData?.phone_number}</Text>
                </View>
              </View>

              <View className='h-40 w-full mt-5'>
                <SingleImageDisplay propertyID={propertyDetails?.property_id}/>
              </View>

              <View className='mt-4'>
                <Text className='font-semibold'>Property Name: {propertyDetails?.name}</Text>
                <Text>Address: {propertyDetails?.address}</Text>
              </View>
            
              <View className='mt-4'>
                  <Text className='font-semibold'>Reservation Fee: Php {propertyDetails?.reservation_fee ? propertyDetails?.reservation_fee : 'Unspecified'}</Text>
              </View>

              <View className='mt-2'>
                <Text className='font-semibold'>Payment Method: {paymentMethod}</Text>
                <View className='bg-gray-200 rounded-md mt-2'>
                  <Dropdown 
                    style={{padding: 4}}
                    data={paymentMethods} 
                    labelField='label' 
                    valueField='value' 
                    selectedTextStyle={{fontSize: 12, left: 10}}  
                    placeholderStyle={{fontSize: 12, left: 10}}
                    placeholder={paymentMethod ? paymentMethod : 'Not specified'}
                    itemTextStyle={{fontSize: 13}}
                    itemContainerStyle={{backgroundColor: '#F3F4F6', borderColor: 'none'}}
                    onChange={item => (
                      handleMethodPress(item.value)
                    )} 
                  />
              </View>

              {paymentMethod === 'Cash on Hand' && (
                <View className='mt-2 flex-row items-start'>
                  <Text className='text-xs'>Please be aware that if you select the 'Cash on Hand' payment method, the owner will need to confirm and update the payment status.</Text>
                </View>
              )}

              {paymentMethod === 'Online Payment' && (
                <View className='mt-2'>
                  <Text className='font-semibold'>Select Provider: {provider}</Text>
                  <View className='bg-gray-200 rounded-md mt-2'>
                    <Dropdown 
                      style={{padding: 4}}
                      data={onlinePaymentProvider} 
                      labelField='label' 
                      valueField='value' 
                      selectedTextStyle={{fontSize: 12, left: 10}}  
                      placeholderStyle={{fontSize: 12, left: 10}}
                      placeholder={provider ? provider : 'Not specified'}
                      itemTextStyle={{fontSize: 13}}
                      itemContainerStyle={{backgroundColor: '#F3F4F6', borderColor: 'none'}}
                      onChange={item => (
                        handleProviderPress(item.value)
                      )} 
                    />
                  </View>
                  
                  {provider && (
                    <Text className='text-xs mt-1'>Upon confirming, you will be redirected to {provider} page.</Text>
                  )}
                  
                </View>
              )} 
             
          </View>
        </View>
      </View>
      <View className='rounded-md overflow-hidden absolute bottom-3 self-center w-80'>
        <Pressable
        onPress={() => proceedToPayment(params.rentalID)}
        className='p-3'
        style={{backgroundColor: "#444"}}>
          <Text className='text-white text-center font-medium'>PROCEED</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
