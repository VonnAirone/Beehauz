import { supabase } from "@/utils/supabase"

export async function checkBookmarkStatus(propertyID, tenantID, setBookmarkStatus) {
  const { data, error } = await supabase
    .from('favorites')
    .select('*')
    .eq('property_id', propertyID)
    .eq('tenant_id', tenantID)

  if (data && data.length > 0) {
    setBookmarkStatus(true)
  }
}

  export async function toggleBookmark(propertyID, tenantID, bookmarkStatus, setBookmarkStatus) {
    if (!bookmarkStatus) {
      await addToFavorites(propertyID, tenantID, setBookmarkStatus)
    } else {
      await removeFromFavorites(propertyID, tenantID, setBookmarkStatus)
    }
  }

  export async function addToFavorites(propertyID, tenantID, setBookmarkStatus) {
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

  export async function removeFromFavorites(propertyID, tenantID, setBookmarkStatus) {
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
