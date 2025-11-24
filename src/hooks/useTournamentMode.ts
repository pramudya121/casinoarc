import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

export const useTournamentMode = () => {
  const location = useLocation();
  const [tournamentId, setTournamentId] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tid = params.get('tournament');
    setTournamentId(tid);
  }, [location.search]);

  return {
    isTournamentMode: !!tournamentId,
    tournamentId,
  };
};
