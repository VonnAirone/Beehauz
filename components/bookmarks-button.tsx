import { Pressable, View } from 'react-native'
import React, { useState } from 'react'
import { Ionicons } from '@expo/vector-icons'
import { supabase } from '@/utils/supabase'

export default function Bookmark({propertyID, tenantID}) {
    const [bookmarkStatus, setBookmarkStatus] = useState(false)

    async function addToFavorites() {
      setBookmarkStatus(!bookmarkStatus)
      if (bookmarkStatus == false) {
        const {data, error} = await supabase
        .from('favorites')
        .upsert({property_id: propertyID, tenant_id: tenantID})
  
        if (error) {
          console.log("Error adding to favorites:", error.message)
        } else {
          console.log("Successfully added to favorites")
        }
      } else {
        removeFromFavorites()
      }

    }

    async function removeFromFavorites() {
      const {data, error} = await supabase.from('favorites')
      .delete()
      .eq('tenant_id', tenantID)

      if(error) {
        console.log("Error removing from favorites:", error.message)
      }
    }
  return (
    <Pressable onPress={addToFavorites}>
        <View className='flex-row items-center '>
            <Pressable onPress={addToFavorites}>
                <Ionicons name={bookmarkStatus == true ? 'bookmark' : 'bookmark-outline'} size={28} color={"#ffa233"}/>
            </Pressable>

        </View>
    </Pressable>
  )
}