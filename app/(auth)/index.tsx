import { Text, View, Pressable, Alert, TouchableWithoutFeedback, Keyboard } from 'react-native';
import React, { useEffect, useState } from 'react';
import Button from 'components/button';
import { supabase } from 'utils/supabase';
import TermsAndPolicies from '../(aux)/Terms and Policies';
import { Ionicons } from '@expo/vector-icons';
import { CheckEmail, Logo, TextInputField } from '../(tenant)/(aux)/logincomponent';
import { makeRedirectUri } from 'expo-auth-session';
import { router } from 'expo-router';
import * as Linking from 'expo-linking'
import * as QueryParams from 'expo-auth-session/build/QueryParams'

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
  const [users, setUsers] = useState([])
  const [userEmails, setUserEmails] = useState([])
  
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
  

  async function signInWithFacebook() {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'facebook',
    })
  }
  
  

  const handleSubmission = async () => {
    try {
      const emailIsEmpty = email.trim() === '';
      const passwordIsEmpty = password.trim() === '';

      setIsEmailEmpty(emailIsEmpty);
      setIsPasswordEmpty(passwordIsEmpty);
  
      if (emailIsEmpty || passwordIsEmpty) {
        setIsFormEmpty(true);
        return;
      } else {
        setIsFormEmpty(false);
  
        if (validateEmail()) {
          if (lockoutTimestamp && lockoutTimestamp > Date.now()) {
            Alert.alert('Account Locked', 'Too many failed attempts. Please try again later.')
            return;
          }
          setLoading(true);

          if (isNotRegistered) {
            setLoading(true);
          
            if (userEmails.includes(email)) {
              Alert.alert("Email address provided has already been registered.");
              setLoading(false);
              return;
            }
          
            const { error } = await supabase.auth.signUp({
              email: email,
              password: password,
              options: {
                data: {
                  profileCompleted: false,
                  usertype: ''
                },
                emailRedirectTo: "com.beehauz://Usertype"
              }
            });
          
            if (error) {
              Alert.alert('Error creating account', error.message);
              setEmail('');
              setPassword('');
            } else {
              setEmail('');
              setPassword('');
              router.push("/ConfirmEmail");
              Alert.alert('Account created successfully!');
            }
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

  async function fetchUsers() {
    try {
      const { data, error } = await supabase.from('profiles').select('*');
  
      if (error) {
        console.log("Error retrieving users: ", error.message);
        return;
      }
  
      if (data) {
        const userEmails = data.map(user => user.email);
        setUserEmails(userEmails);
      }
    } catch (error) {
      console.log("Error retrieving users: ", error.message);
    }
  }
  
  
  useEffect(() => {
    fetchUsers();
  }, []);

  


  return (
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View className='justify-center items-center relative bg-white h-full'>

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

            <View className='absolute -bottom-2 w-80'>
              {!isNotRegistered ? (
                <Pressable onPress={() => router.push("/SendResetPasswordLink")}>
                    <Text className='text-right text-xs right-1'>Forgot Password?</Text>
                </Pressable>
              ) : (
                <Text className='text-right bottom- right-1'></Text>
              )}
            </View>

          </View>



          {/* Submit Button */}
          <View className='mb-5 w-80'>
            <Button onPress={handleSubmission} text={isNotRegistered ? 'CREATE ACCOUNT' : loading ? 'LOADING' : 'LOGIN'} />
          </View>

          <View className='my-4'>
            <Text>or log in using</Text>
          </View>

          

          {/* Social Media Login Buttons */}
          <View className='flex-row justify-center my-5'>
            <View className='mx-5'>
              <Pressable
              onPress={() => signInWithFacebook()}>
                <Ionicons 
                name='logo-facebook' 
                size={40} 
                color={"#444"}/>
              </Pressable>
            </View>

            <View className='mx-5'>
              <Pressable>
                <Ionicons 
                name='logo-google' 
                size={40}
                color={"#444"}/>
              </Pressable>
            </View>

            <View className='mx-5'>
              <Pressable>
                <Ionicons 
                name='logo-instagram' 
                size={40}
                color={"#444"}/>
              </Pressable>
            </View>
          </View>

          <View className='items-center relative top-20'>
            <Pressable onPress={Register}>
              <Text className='text-xs'>
                {!isNotRegistered ? "Don't have an account?" : "Already have an account?"}{''}
                <Text className='text-blue-500'> Press here.</Text>
              </Text>
            </Pressable>

            <TermsAndPolicies/>
          </View>          


        </View>


        </View>
      </TouchableWithoutFeedback>
  );
}
