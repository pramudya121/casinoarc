import { useEffect } from 'react';

const SUPABASE_URL = 'https://ypfqjtaujcafoullwfvm.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlwZnFqdGF1amNhZm91bGx3ZnZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM5MTI3NzYsImV4cCI6MjA3OTQ4ODc3Nn0.itkDZCoBcYY_B38aT-0-xgV4AnDnIjpVaS67Fcso4XA';

export const useAutoFinalizeTournaments = () => {
  useEffect(() => {
    const checkTournaments = async () => {
      try {
        // Update tournament statuses
        await fetch(
          `${SUPABASE_URL}/functions/v1/update-tournament-status`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            },
          }
        );

        // Finalize completed tournaments
        await fetch(
          `${SUPABASE_URL}/functions/v1/auto-finalize-tournaments`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            },
          }
        );
      } catch (error) {
        console.error('Error managing tournaments:', error);
      }
    };

    // Run immediately on mount
    checkTournaments();

    // Then check every 30 seconds
    const interval = setInterval(checkTournaments, 30000);

    return () => clearInterval(interval);
  }, []);
};
