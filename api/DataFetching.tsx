import { supabase } from "@/utils/supabase";

async function fetchData(query: any) {
  try {
    const { data, error } = await query;
    if (error) {
      console.error('Error fetching data:', error);
      return null;
    } else {
      return data || null;
    }
  } catch (error) {
    console.error('Error:', error);
    return null;
  }
}

export async function fetchPropertyListData() {
  const query = supabase.from('property').select('*').limit(5);
  return fetchData(query);
}

export async function fetchPopularNowList() {
  const query = supabase.from('property')
  .select('*')
  .order('view_count', {ascending: false})
  .limit(5)

  return fetchData(query);
}

export async function fetchPropertyDetailsData(propertyID: string) {
  const query = supabase
    .from('property')
    .select('*')
    .eq('property_id', propertyID)
    .single();
  return fetchData(query);
}

export async function fetchPropertyData(ownerID: string) {
  const query = supabase
    .from('property')
    .select('*')
    .eq('owner_id', ownerID)
  return fetchData(query);
}

export async function fetchFilteredProperties(filterCriteria) {
  const { prices } = filterCriteria;

  try {
    const { data, error } = await supabase
      .from('property')
      .select('*')
      .eq('price', prices)

    if (error) {
      console.error(error.message);
      return null;
    }

    return data
  } catch (error) {
    console.error('Error fetching filtered properties: ', error);
    return null;
  }
}


export async function getProfile(userID: string) {
  const query = supabase
    .from('profiles')
    .select('*')
    .eq('id', userID)
    .single();
  return fetchData(query);
}


