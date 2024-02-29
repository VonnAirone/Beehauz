import { Text, View, Pressable, Alert, TouchableWithoutFeedback, Keyboard, KeyboardAvoidingView } from 'react-native';
import React, { useState } from 'react';
import { router } from 'expo-router';
import Button from 'components/button';
import { supabase } from 'utils/supabase';
import TermsAndPolicies from '../(aux)/Terms and Policies';
import { Ionicons } from '@expo/vector-icons';
import { CheckEmail, Logo, TextInputField } from '../(tenant)/(aux)/logincomponent';

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

  const validateEmail = () => {
    const isValidEmailFormat = email.includes('@gmail.com');
  
    setIsEmailInvalid(!isValidEmailFormat);
    return isValidEmailFormat;
  };
  
  

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
    <KeyboardAvoidingView>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View className='justify-center items-center relative bg-white h-full'>
      
        <View className='z-10 items-center'>

            {showModal && (
              <View className='absolute top-40'>
                <Pressable 
                  onPress={() => setShowModal(false)}
                  className='absolute right-3 top-3 z-20'>
                  <Ionicons name='close' size={20}/>
                </Pressable>

                <CheckEmail email={email} actionType={action}/>
              </View>
            )}
        </View>

        <View className={`justify-center items-center z-0 ${showModal && 'opacity-40'}`}>

          <Logo/>

          <View>
            <TextInputField 
                isEditable={!showModal}
                label={"Email"}
                value={email}
                placeholder={"example@gmail.com"}
                isPassword={false}
                isRevealed={false}
                onChangeText={handleEmailChange}
                onPressReveal={() => { } }
                feedbackText={isEmailInvalid ? 'Must be a valid email account.' :
                  isEmailEmpty ? 'Your email is required for signing in.' : ''} defaultFeedback={undefined}/>
                       
          </View>

          
          <View className='mb-10'>
            <TextInputField 
                isEditable={!showModal}
                label={"Password"}
                value={password}
                placeholder={"Enter your password"}
                isPassword={true}
                isRevealed={isRevealed}
                onChangeText={handlePasswordChange}
                onPressReveal={() => setIsRevealed(!isRevealed)}
                feedbackText={isPasswordEmpty && password.trim() === '' ? 'Your password is required for signing in.' : ''} defaultFeedback={undefined}/>

            <View className='absolute -bottom-2'>
              {!isNotRegistered ? (
                <Pressable onPress={() => setShowModal(!showModal)}>
                    <Text className='text-right w-80 right-1'>Forgot Password?</Text>
                </Pressable>
              ) : (
                <Text className='text-right bottom- right-1'></Text>
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


        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}
