import { Text, View, TextInput, Pressable, Image, KeyboardAvoidingView, Alert, TouchableWithoutFeedback, Keyboard } from 'react-native';
import React, { useState } from 'react';
import { Link, router } from 'expo-router';
import Button from 'components/button';
import { supabase } from 'utils/supabase';
import TermsAndPolicies from '../(aux)/Terms and Policies';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isFormEmpty, setIsFormEmpty] = useState(false);
  const [isEmailEmpty, setIsEmailEmpty] = useState(false);
  const [isPasswordEmpty, setIsPasswordEmpty] = useState(false);
  const [loading, setLoading] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutTimestamp, setLockoutTimestamp] = useState(null);
  const [isNotRegistered, setIsNotRegistered] = useState(false)


  const handleEmailChange = (text) => {
    setEmail(text);
    setIsFormEmpty(false);
    setIsEmailEmpty(false);
  };

  const handlePasswordChange = (text) => {
    setPassword(text);
    setIsFormEmpty(false);
    setIsPasswordEmpty(false);
  };

  const Register = () => {
    setIsNotRegistered(!isNotRegistered);
    setIsEmailEmpty(false)
    setIsPasswordEmpty(false)
    setIsFormEmpty(false)
  };

  const validateEmail = () => {
    const isValidEmailFormat = email.includes('@gmail.com');
    if (!isValidEmailFormat) {
      setIsEmailEmpty(true);
    }
    return isValidEmailFormat;
  };

  // const handleBlur = () => {
  //   setEmail('');
  //   setPassword('');
  // };

  const handleSubmission = async () => {
    try {
      setIsEmailEmpty(email.trim() === '');
      setIsPasswordEmpty(password.trim() === '');
  
      if (email.trim() === '' || password.trim() === '') {
        setIsFormEmpty(true);
      } else {
        setIsFormEmpty(false);
  
        if (validateEmail()) {
          if (lockoutTimestamp && lockoutTimestamp > Date.now()) {
            Alert.alert('Account Locked', 'Too many failed attempts. Please try again later.')
            return;
          }
          setLoading(true);

          if(isNotRegistered) {
            const { error } = await supabase.auth.signUp({
              email: email,
              password: password,
            });
  
            if (error) {
              Alert.alert('Error creating account', error.message);
            } else {
              Alert.alert('Account created successfully!');
            }
            router.push("/(onboarding)/Splashscreen")
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
  

  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
    <KeyboardAvoidingView className='container flex-1 justify-center'>
      
        <View className='items-center flex-col gap-5'>
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
            {/* Email Input Field */}
            <TextInput
              value={email}
              placeholder='Enter your email address'

              placeholderTextColor={(isEmailEmpty && email.trim() === '') ? 'red' : email.includes('@gmail.com') ? 'green': 'black'}
              
              className={`p-3 pl-5 border border-gray-200 focus:border-gray-400 rounded-sm w-80 ${
                isEmailEmpty && email.trim() === '' ? 'border-red-500' : email.includes('@gmail.com') ? 'border-gray-400' : ''
              }`}
              onChangeText={handleEmailChange} />

            {/* Feedback for Email */}
            <Text className={isEmailEmpty && email.trim() === '' ? 'ml-5 mt-1 text-red-500 text-xs' : email.trim() !== '' && !email.includes('@gmail.com') ? 'ml-5 mt-1 text-gray-500 text-xs' : 'hidden'}>
              {email.trim() !== '' && !email.includes('@gmail.com') ? 'Please use a valid email.' : 'Your email is required for signing in.'}
            </Text>



          </View>

          
          <View>
            {/* Password Input Field */}
            <TextInput
              value={password}
              placeholder='Enter your password'
              placeholderTextColor={(isPasswordEmpty && password.trim() === '') ? 'red' : 'black'}
              className={`p-3 pl-5 border border-gray-200 focus:border-gray-400 rounded-sm w-80 ${
                isPasswordEmpty && password.trim() === '' ? 'border-red-500' : password.trim() === '' ? '' : 'border-gray-400'
              }`}
              onChangeText={handlePasswordChange}
              secureTextEntry />

            {/* Feedback for Password */}
            <View className='mb-10'>
              <Text className={isPasswordEmpty && password.trim() === '' ? 'absolute ml-5 mt-1 text-gray-500 text-xs' : 'hidden'}>
                Your password is required for signing in.
              </Text>

              {!isNotRegistered && (
                <Pressable>
                  <Link className='text-right w-80 mt-1 right-1 absolute' href={'/(auth)/ForgotPassword'}>Forgot Password?</Link>
                </Pressable>
              )}
 
              
            </View>
           
          </View>

          {/* Submit Button */}
          <View>
            <Button onPress={handleSubmission} text={isNotRegistered ? 'CREATE ACCOUNT' : loading ? 'LOADING' : 'LOGIN'} />
          </View>

          <View></View>

          <Text>or log in using</Text>

          {/* Social Media Login Buttons */}
          <View className='rounded-sm overflow-hidden'>
            <Pressable android_ripple={{color: '#4285F4'}} className='bg-[#3b5998] p-4 w-80' onPress={LoginWithFacebook}>
              <Text className='text-center text-white'>{loading ? 'Loading' : 'Facebook'}</Text>
            </Pressable>
          </View>

          <View>
            <Pressable className='bg-[#4285F4] p-4 w-80 rounded-sm'>
              <Text className='text-center text-white'>Google</Text>
            </Pressable>
          </View>

          <Pressable onPress={Register}>
              <Text>
                {!isNotRegistered ? "Don't have an account?" : "Already have an account?"}{' '}
                <Text style={{ color: 'blue' }}>Press here.</Text>
              </Text>
            </Pressable>

          {/* Terms and Policies */}
          <TermsAndPolicies/>

        </View>
      
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}
