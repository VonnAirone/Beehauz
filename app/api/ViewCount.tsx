import { supabase } from "@/utils/supabase";

export async function handlePropertyClick(propertyID: string) {
   try {
      let { data, error } = await supabase
      .rpc('increment_view_count', {
      id: propertyID
      })

      if (error) console.error(error)
      else console.log(data)

   } catch (error) {
      console.error('Network error:', error);
   }
};