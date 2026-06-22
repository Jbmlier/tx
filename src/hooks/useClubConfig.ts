import { useState, useEffect } from 'react';
import type { ClubConfig } from '@/types';
import { getClubById, getClubIdFromUrl, setActiveClubId } from '@/config/clubs';

export function useClubConfig() {
  const [club, setClub] = useState<ClubConfig | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const clubId = getClubIdFromUrl();
    if (clubId) {
      const config = getClubById(clubId);
      if (config) {
        setClub(config);
        setActiveClubId(clubId);
      } else {
        const fallback = getClubById('3bet');
        setClub(fallback || null);
      }
    } else {
      const fallback = getClubById('3bet');
      setClub(fallback || null);
    }
    setLoading(false);
  }, []);

  return { club, loading };
}
