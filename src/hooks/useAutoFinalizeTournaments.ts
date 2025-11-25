import { useEffect } from 'react';

const SUPABASE_URL = 'https://ypfqjtaujcafoullwfvm.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlwZnFqdGF1amNhZm91bGx3ZnZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM5MTI3NzYsImV4cCI6MjA3OTQ4ODc3Nn0.itkDZCoBcYY_B38aT-0-xgV4AnDnIjpVaS67Fcso4XA';

export const useAutoFinalizeTournaments = () => {
  useEffect(() => {
    // Check and finalize tournaments every 60 seconds
    const interval = setInterval(async () => {
      try {
        const response = await fetch(
          `${SUPABASE_URL}/functions/v1/auto-finalize-tournaments`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            },
          }
        );
        
        if (response.ok) {
          const data = await response.json();
          console.log('Auto-finalize check:', data);
        }
      } catch (error) {
        console.error('Error auto-finalizing tournaments:', error);
      }
    }, 60000); // Check every 60 seconds

    return () => clearInterval(interval);
  }, []);
};
