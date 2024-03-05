import { Pressable, StyleSheet, Text, View } from 'react-native'
import React, { useState } from 'react'
import { Ionicons } from '@expo/vector-icons'

export default function Bookmark() {
    const [bookmarkStatus, setBookmarkStatus] = useState(false)
  return (
    <View className='mt-5 mr-5 mb-3'>
    <Pressable onPress={() => {}}>
        <View className='flex-row items-center '>
            <Pressable onPress={() => setBookmarkStatus(!bookmarkStatus)}>
                <Ionicons name={bookmarkStatus == true ? 'bookmark' : 'bookmark-outline'} size={28}/>
            </Pressable>

        </View>
    </Pressable>
</View>
  )
}

const styles = StyleSheet.create({})