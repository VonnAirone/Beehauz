import { supabase } from "@/utils/supabase";

export const Filters = [
  {id: 1, filter: 'Location'},
  {id: 2, filter: 'Price'},
  {id: 3, filter: 'Rating'},
  {id: 4, filter: 'Popular'}
];

export const locationsData = [
  { id: 1, name: 'University of Antique' },
  { id: 2, name: `Saint Anthony's College` },
  { id: 3, name: 'More Soon...' },
];

export const pricesData = [
  { id: 1, price: '500 - 1000' },
  { id: 2, price: '1100 - 1500' },
  { id: 3, price: '1500 - 2000' },
];

export const ratingsData = [
  { id: 1, rating: '1' },
  { id: 2, rating: '2' },
  { id: 3, rating: '3' },
  { id: 4, rating: '4' },
  { id: 5, rating: '5' },
];

export async function fetchNearbyMe(latitude, longitude, setNearbyProperties) {
  try {
    const radius = 1000;

    const { data, error } = await supabase
      .from('property')
      .select("*")
      .lte('latitude', latitude + radius / 111000)
      .gte('latitude', latitude - radius / 111000)
      .lte('longitude', longitude + radius / (111000 * Math.cos(latitude * Math.PI / 180)))
      .gte('longitude', longitude - radius / (111000 * Math.cos(latitude * Math.PI / 180)));

    if (error) {
      console.error('Error fetching nearby properties:', error.message);
      return;
    }

    if (data) {
      setNearbyProperties(data);
    }
  } catch (error) {
    console.error('Error fetching nearby properties:', error.message);
  }
}

export async function fetchNearbyUA(setNearbyProperties) {
  try {
    const radius = 1000;

    const { data, error } = await supabase
      .from('property')
      .select("*")
      .lte('latitude', 10.7907876 + radius / 111000)
      .gte('latitude', 10.7907876 - radius / 111000)
      .lte('longitude', 122.0077978 + radius / (111000 * Math.cos(10.7907876 * Math.PI / 180)))
      .gte('longitude', 122.0077978 - radius / (111000 * Math.cos(10.7907876 * Math.PI / 180)));

    if (error) {
      console.error('Error fetching nearby properties:', error.message);
      return;
    }

    if (data) {
      setNearbyProperties(data);
    }
  } catch (error) {
    console.error('Error fetching nearby properties:', error.message);
  }
}

export async function fetchNearbySAC(setNearbyProperties) {
  try {
    const radius = 1000;
    const { data, error } = await supabase
      .from('property')
      .select("*")
      .lte('latitude', 10.7389901 + radius / 111000)
      .gte('latitude', 10.7389901 - radius / 111000)
      .lte('longitude', 121.9474484 + radius / (111000 * Math.cos(10.7389901 * Math.PI / 180)))
      .gte('longitude', 121.9474484 - radius / (111000 * Math.cos(10.7389901 * Math.PI / 180)));

    if (error) {
      console.error('Error fetching nearby properties:', error.message);
      return;
    }

    if (data) {
      setNearbyProperties(data);
    }
  } catch (error) {
    console.error('Error fetching nearby properties:', error.message);
  }
}


export async function fetchPropertiesByPriceRange(minPrice, maxPrice) {
  try {
    const { data, error } = await supabase
      .from('property')
      .select()
      .gte('price', minPrice)
      .lte('price', maxPrice);

    if (error) {
      console.error('Error fetching properties:', error.message);
      return null;
    }

    if (data) {
      return data;
    }

    return null;
  } catch (error) {
    console.error('Error fetching properties:', error.message);
    return null;
  }
}



export async function fetchCheapProperties(setCheapProperties) {
  try {
    const minPrice = 500
    const maxPrice = 1000

    const { data, error } = await supabase
      .from('property')
      .select('*')
      .gte('price', minPrice)
      .lte('price', maxPrice);

    if (error) {
      console.error('Error fetching cheap properties:', error.message);
      return null;
    }

    if (data) {
      setCheapProperties(data)
    }

    return null;
  } catch (error) {
    console.error('Error fetching cheap properties:', error.message);
    return null;
  }
}

export async function fetchPropertiesByAverageRating(averageRating) {
  try {
    const { data: reviews, error: reviewsError } = await supabase
      .from('property_reviews')
      .select('property_id, rating');

    if (reviewsError) {
      console.error('Error fetching property reviews:', reviewsError.message);
      return null;
    }

    if (!reviews || reviews.length === 0) {
      console.log('No property reviews found.');
      return null;
    }

    const propertyRatingMap = new Map();

    reviews.forEach(review => {
      const { property_id, rating } = review;
      const totalRating = propertyRatingMap.get(property_id) || 0;
      propertyRatingMap.set(property_id, totalRating + rating);
    });

    const filteredProperties = [];

    for (const [propertyId, totalRating] of propertyRatingMap.entries()) {
      const average = totalRating / reviews.filter(review => review.property_id === propertyId).length;
      if (Math.round(average) === averageRating) {
        filteredProperties.push(propertyId);
      }
    }

    const { data: properties, error: propertiesError } = await supabase
      .from('property')
      .select()
      .in('property_id', filteredProperties);

    if (propertiesError) {
      console.error('Error fetching properties:', propertiesError.message);
      return null;
    }

    return properties;
  } catch (error) {
    console.error('Error fetching properties by average rating:', error.message);
    return null;
  }
}

