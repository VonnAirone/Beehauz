import { Text, View, Pressable, Image, Alert, TouchableWithoutFeedback, Keyboard, SafeAreaView, KeyboardAvoidingView } from 'react-native';
import React, { useEffect, useState } from 'react';
import { Link, router } from 'expo-router';
import Button from 'components/button';
import { supabase } from 'utils/supabase';
import TermsAndPolicies from '../(aux)/Terms and Policies';
import { Ionicons } from '@expo/vector-icons';
import { CheckEmail, TextInputField } from '../(tenant)/(aux)/logincomponent';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isFormEmpty, setIsFormEmpty] = useState(false);
  const [isEmailEmpty, setIsEmailEmpty] = useState(false);
  const [isEmailInvalid, setIsEmailInvalid] = useState(false);
  const [isPasswordEmpty, setIsPasswordEmpty] = useState(false);
  const [loading, setLoading] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutTimestamp, setLockoutTimestamp] = useState(null);
  const [isNotRegistered, setIsNotRegistered] = useState(false)
  const [isRevealed, setIsRevealed] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [action, setAction] = useState('')

  const handleEmailChange = (text) => {
    setEmail(text);
    setIsFormEmpty(false);
    setIsEmailEmpty(false);
    setIsEmailInvalid(validateEmail());
  };

  const handlePasswordChange = (text) => {
    setPassword(text);
    setIsFormEmpty(false);
    setIsPasswordEmpty(false);
  };

  const Register = () => {
    setAction('confirmation')
    setIsNotRegistered(!isNotRegistered);
    setIsEmailEmpty(false)
    setIsPasswordEmpty(false)
    setIsFormEmpty(false)
  };

  const closeModal = () => {
    setShowModal(false)
  }


  const validateEmail = () => {
    const isValidEmailFormat = email.includes('@gmail.com');
  
    setIsEmailInvalid(!isValidEmailFormat);
    return isValidEmailFormat;
  };
  
  async function forgetPassword() {
    setAction('forgetPassword')
    setShowModal(true)
    // setLoading(true);
    // const { error } = await supabase.auth.resetPasswordForEmail(
    //   email,
    //   {
    //     redirectTo: "exp://192.168.1.140:8081/--/changepassword"
    //   }
    // );
    // if (!error) {
    //   setLoading(false);
    //   setShowModal(true)
    // } else {
    //   setLoading(false);
    //   alert(error.message);
    // }
  }
  

  const handleSubmission = async () => {
    try {

      const emailIsEmpty = email.trim() === '';
      const passwordIsEmpty = password.trim() === '';

      setIsEmailEmpty(emailIsEmpty);
      setIsPasswordEmpty(passwordIsEmpty);
  
      if (emailIsEmpty || passwordIsEmpty) {
        setIsFormEmpty(true);
        // If form is incomplete, return early to avoid proceeding with submission
        return;
      } else {
        setIsFormEmpty(false);
  
        if (validateEmail()) {
          if (lockoutTimestamp && lockoutTimestamp > Date.now()) {
            Alert.alert('Account Locked', 'Too many failed attempts. Please try again later.')
            return;
          }
          setLoading(true);

          if(isNotRegistered) {
            // const { error } = await supabase.auth.signUp({
            //   email: email,
            //   password: password,
            // });
  
            // if (error) {
            //   Alert.alert('Error creating account', error.message);
            // } else {
            //   Alert.alert('Account created successfully!');
            // }
            setShowModal(true)
          } else {
            const { error } = await supabase.auth.signInWithPassword({
              email: email,
              password: password,
            });
    
            if (error) {
              setFailedAttempts(failedAttempts + 1);
  
              if(failedAttempts + 1 >= 2) {
                const lockoutDuration = 5 * 60 * 1000;
                setLockoutTimestamp(Date.now() + lockoutDuration)
              }
              Alert.alert('Error logging in', error.message);
            } else {
              Alert.alert("Logged in successfully!");
            }
          }
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const LoginWithFacebook = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'facebook',
      })

      if (error) {
        throw new Error(error.message)
      } else {
        Alert.alert("Logged in successfully!")
      }
    } catch (error) {
      console.log('Error logging in', error.message);
      Alert.alert('Error logging in', error.message)
    } finally {
      setLoading(false)
      router.replace('/(tenant)/(tabs)/home')
    }
  }

  // useEffect(() => {
  //   checkEmailAvailability()
  // })

  return (
    <KeyboardAvoidingView className='flex-1 justify-center relative'>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <>
      
        <View className='z-10 items-center'>
            {showModal && (
              <View className='absolute top-40'>
                <CheckEmail email={email} actionType={action} closeModal={() => setShowModal(false)}/>
              </View>
            )}
        </View>

        <View className={`items-center flex-col gap-2 z-0 ${showModal && 'opacity-40'}`}>
          {/* App Logo */}
          <View className='mb-5 flex flex-row items-center w-80 justify-center'>
            <View>
              <Image className='w-20 h-20' style={{ resizeMode: 'contain' }} source={require("@/assets/images/icon.png")} />
            </View>
            <View>
              <Text className='text-5xl'>BEEHAUZ</Text>
            </View>
          </View>

          <View>
            <TextInputField 
            isEditable={!showModal}
            label={"Email"} 
            value={email} 
            placeholder={"example@gmail.com"} 
            isPassword={false} 
            isRevealed={false} 
            onChangeText={handleEmailChange} 
            onPressReveal={() => {}} 
            feedbackText={
              isEmailInvalid ? 'Must be a valid email account.' :
              isEmailEmpty ? 'Your email is required for signing in.' : ''
            }/>
                       
          </View>

          
          <View className='mb-5'>
            <TextInputField 
            isEditable={!showModal}
            label={"Password"} 
            value={password} 
            placeholder={"Enter your password"} 
            isPassword={true} 
            isRevealed={isRevealed} 
            onChangeText={handlePasswordChange} 
            onPressReveal={() => setIsRevealed(!isRevealed)} 
            feedbackText={isPasswordEmpty && password.trim() === '' ? 'Your password is required for signing in.' : ''}/>

            <View>
              {!isNotRegistered ? (
                <Pressable onPress={forgetPassword}>
                    <Text className='text-right w-80 mt-1 right-1'>Forgot Password?</Text>
                </Pressable>
              ) : (
                <Text className='text-right mt-1 right-1'></Text>
              )}
            </View>

          </View>



          {/* Submit Button */}
          <View className='mb-5'>
            <Button onPress={handleSubmission} text={isNotRegistered ? 'CREATE ACCOUNT' : loading ? 'LOADING' : 'LOGIN'} />
          </View>

          <View className='my-4'>
            <Text>or log in using</Text>
          </View>

          

          {/* Social Media Login Buttons */}
          <View className='flex-row justify-center my-5'>
            <View className='mx-5'>
              <Pressable>
                <Ionicons name='logo-facebook' size={32}/>
              </Pressable>
            </View>

            <View className='mx-5'>
              <Pressable>
                <Ionicons name='logo-google' size={32}/>
              </Pressable>
            </View>

            <View className='mx-5'>
              <Pressable>
                <Ionicons name='logo-instagram' size={32}/>
              </Pressable>
            </View>
          </View>

          <View className='items-center relative top-20'>
            <Pressable onPress={Register}>
              <Text>
                {!isNotRegistered ? "Don't have an account?" : "Already have an account?"}{''}
                <Text style={{ color: 'blue' }}>Press here.</Text>
              </Text>
            </Pressable>

            <TermsAndPolicies/>
          </View>          


        </View>


        </>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}
