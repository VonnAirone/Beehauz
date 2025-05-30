import { Text, View } from 'react-native'
import React from 'react'
import { Link } from 'expo-router'

export default function TermsAndPolicies() {
  return (
      <View className='w-72 items-center mt-3'>
        <Text className='text-center text-sm'>By signing up, you agree to our
          <Link href={'/(aux)/Terms and Policies'} className='font-bold'> Terms and Policies </Link>

          as well the

          <Link href={'/(aux)/Terms and Policies'} className='font-bold'> Privacy Policy</Link>
      </Text>
    </View>
  )
}
