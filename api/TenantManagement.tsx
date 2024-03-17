import { supabase } from "@/utils/supabase"

export async function addTenant(id) {
    try {
      const {data, error} = await supabase.from('owners')
      .insert({owner_id: id})

      if (error) {
        console.log("Error updating owners table: ", error.message)
      } else {
        console.log("Successfully updated owners table.")
      }
    } catch (error) {
      console.log("Error updating owners table: ", error.message)
    }
  }
  