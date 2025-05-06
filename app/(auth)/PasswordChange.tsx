import { Alert, Linking, Pressable, StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import Logo from '@/app/components/logo'
import Glass from '@/app/components/glassmorph'
import { TextInputField } from '../(tenant)/(aux)/logincomponent'
import Button from '@/app/components/button'
import { supabase } from '@/utils/supabase'
import { Ionicons } from '@expo/vector-icons'
import { Vibration } from 'react-native'

export default function PasswordChange() {
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [confirmPasswordReveal, setConfirmPasswordReveal] = useState(false)
  const [newPasswordReveal, setNewPasswordReveal] = useState(false)
  const [notMatched, isNotMatched] = useState(false)

  const handleNewPassword = (text) => {
    setNewPassword(text)
  }

  const handleConfirmPassword = (text) => {
    setConfirmPassword(text)
  }
  
  const updatePassword = async () => {

    try {
      if (newPassword.trim() !== confirmPassword.trim()) {
        isNotMatched(true)
        Vibration.vibrate(100)
      } else {
        const { error } = await supabase.auth.updateUser({
          password: newPassword,
        });
    
        if (error) throw error;
    
        console.log('Password updated successfully.');
      }
    } catch (error) {
      Alert.alert("Error updating password:", error.message);
    }
    
  };

  useEffect(() => {
    Linking.getInitialURL().then((url) => {
      console.log(url);
  });
  
  }, [])


  return (
    <SafeAreaView className='flex-1 justify-center items-center'>
        <View className='absolute top-10'>
            <Logo/>
        </View>

        {notMatched && (
        <View className='bg-white border border-red-300 p-5 h w-72 absolute z-10 top-5 flex-row justify-between items-center rounded-md'>    
          <View className='flex-row items-center gap-x-2'>
            <Ionicons name='alert-circle-outline' size={15} color={'red'}/>
            <Text className='text-center text-red-500'>Password does not match</Text>
          </View>
          <Pressable onPress={() => isNotMatched(false)}>
            <Ionicons name='close-outline' size={20} color={'red'}/>
          </Pressable>
          
        </View>
        )}


        <View>
          <View className='w-80 mx-auto pt-5'>
            <Glass>
                <Text className='text-2xl font-semibold text-center mb-2'>Enter your new password</Text>
                <Text className='text-center'>Your new password must be different from your previous one.</Text>
            </Glass>
          </View>
          <View>
            <TextInputField 
            value={newPassword}
            placeholder={"Enter new password"}
            onChangeText={handleNewPassword}
            isPassword={true}
            isEditable={true}
            label={"New Password"}
            isRevealed={newPasswordReveal}
            onPressReveal={() => setNewPasswordReveal(!newPasswordReveal)}
            feedbackText={undefined} 
            defaultFeedback={undefined}/>
          </View>
          <View>
            <TextInputField 
            value={confirmPassword}
            placeholder={"Enter new password"}
            onChangeText={handleConfirmPassword}
            isPassword={true}
            isEditable={true}
            label={"Confirm Password"}
            isRevealed={confirmPasswordReveal}
            onPressReveal={() => setConfirmPasswordReveal(!confirmPasswordReveal)}
            feedbackText={undefined} defaultFeedback={"Both password must match"}/>
          </View>  
          <View className='mt-10'>
              <Button text={"Save New Password"} onPress={updatePassword}/>
          </View>
          
        </View>

      
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({})