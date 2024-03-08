import { useEffect } from 'react';
import { supabase } from '@/utils/supabase';

const useRealtimeVisitUpdates = (ownerId) => {
  useEffect(() => {
    const channels = supabase.channel('custom-filter-channel')
    .on(
    'postgres_changes',
    { event: '*', schema: 'public', table: 'property_visits', filter: 'some_column=eq.some_value' },
    (payload) => {
        console.log('Change received!', payload)
    }
    )
    .subscribe()

  }, [ownerId]);
};

export default useRealtimeVisitUpdates;
