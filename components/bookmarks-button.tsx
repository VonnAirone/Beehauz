import { Pressable, View } from 'react-native'
import React, { useState, useEffect } from 'react'
import { Ionicons } from '@expo/vector-icons'
import { supabase } from '@/utils/supabase'

export default function Bookmark({ propertyID, tenantID }) {
  const [bookmarkStatus, setBookmarkStatus] = useState(false)

  useEffect(() => {
    async function checkBookmarkStatus() {
      const { data, error } = await supabase
        .from('favorites')
        .select('*')
        .eq('property_id', propertyID)
        .eq('tenant_id', tenantID)

      if (data && data.length > 0) {
        setBookmarkStatus(true)
      }
    }
    checkBookmarkStatus()
  }, [propertyID, tenantID])

  async function toggleBookmark() {
    if (!bookmarkStatus) {
      await addToFavorites()
    } else {
      await removeFromFavorites()
    }
  }

  async function addToFavorites() {
    setBookmarkStatus(true)
    const { data, error } = await supabase
      .from('favorites')
      .upsert({ property_id: propertyID, tenant_id: tenantID })

    if (error) {
      console.log("Error adding to favorites:", error.message)
    } else {
      console.log("Successfully added to favorites")
    }
  }

  async function removeFromFavorites() {
    setBookmarkStatus(false)
    const { data, error } = await supabase.from('favorites')
      .delete()
      .eq('property_id', propertyID)
      .eq('tenant_id', tenantID)

    if (error) {
      console.log("Error removing from favorites:", error.message)
    } else {
      console.log("Successfully removed from favorites")
    }
  }

  return (
    <Pressable onPress={toggleBookmark}>
      <View className='flex-row items-center'>
        <Ionicons name={bookmarkStatus ? 'bookmark' : 'bookmark-outline'} size={28} color={"#ffa233"} />
      </View>
    </Pressable>
  )
}
