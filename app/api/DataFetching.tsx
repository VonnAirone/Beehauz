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
  const query = supabase.from('Properties').select('*').limit(5);
  return fetchData(query);
}

export async function fetchPopularNowList() {
  const query = supabase
    .from('Properties')
    .select('*')
    .gte('ViewCount', 50)

  return fetchData(query);
}


export async function fetchPropertyDetailsData(propertyID: string) {
  const query = supabase
    .from('Properties')
    .select('*')
    .eq('Id', propertyID)
    .single();
  return fetchData(query);
}

export async function fetchPropertyData(ownerID: string) {
  const query = supabase
    .from('Properties')
    .select('*')
    .eq('OwnerId', ownerID)
  return fetchData(query);
}

export async function fetchFavorites(propertyID: string) {
  const query = supabase
    .from('Properties')
    .select('*')
    .eq('id', propertyID)
  return fetchData(query);
}

export async function fetchFilteredProperties(filterCriteria) {
  const { prices } = filterCriteria;

  try {
    const { data, error } = await supabase
      .from('Properties')
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
    .from('users')
    .select('*')
    .eq('id', userID)
    .single();
  return fetchData(query);
}


export async function getProperties(id, setLoading, setProperties) {
  try {
    setLoading(true)
    const { data, error } = await supabase
      .from("Properties")
      .select()
      .eq("OwnerId", id)
      .limit(1)
    
    if (error) {
      console.log("Error fetching properties: ", error.message)
    } else {
      setProperties(data);
    }
    // setLoading(false);
  } catch (error) {
    console.log("Error fetching properties: ", error.message)
    // setLoading(false);
  } finally {
    setTimeout(() => {
      setLoading(false);
    }, 2000); 
  }
}


export async function getPropertyReviews(propertyID) {
  try {
      const { data, error } = await supabase
          .from("PropertyRR")
          .select("*")
          .eq('PropertyId', propertyID);

      if (error) {
          console.log("Error fetching property reviews: ", error.message);
          return null;
      }

      if (data) {
          return data
      } else {
          console.log("No property reviews found.");
      }
  } catch (error) {
      console.log("Error fetching property reviews: ", error.message);
      return null;
  }
}


export const fetchAmenities = async (propertyID, setAmenities) => {
  const {data, error} = await supabase
  .from('amenities')
  .select('*')
  .eq('property_id', propertyID)
  if (error) {
      console.log('Error message', error.message)
  } else {
  setAmenities(data)
  }
}

export async function fetchPropertyTerms(propertyID, setPropertyTerms) {
  try {
    const { data, error } = await supabase
    .schema('beehauz')
    .from('PropertyConfig')
    .select()
    .eq('PropertyId', propertyID.toString())

    if (!data || data.length === 0) {
      throw new Error("Data not found")
    }

    setPropertyTerms(data[0])
  } catch (error: any) {
    console.log("Error fetching property terms: ", error.message)
  }
}

export async function getOwnerData(ownerID, setOwnerData) {
  try {
    const data = await getProfile(ownerID)

    if (data) {
      setOwnerData(data)
    }
  } catch (error) {
    console.log("Error fetching owner data", error.message)
  }
}

export  async function fetchTenantStatus (userID) {
  try {
    const { data } = await supabase
    .from('tenants')
    .select('*')
    .eq('tenant_id', userID)

    return data;
  } catch (error) {
    console.log("Error fetching tenant status: ", error.message)
  }
}