import axios from 'axios';
import { useState, useEffect } from 'react';

export function useUserData() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get('http://localhost:3000/auth/me', {
          withCredentials: true,
        });
        setUser(response.data);
      } catch (err) {
        setError("Not authenticated");
        console.error("User fetch failed:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  return { user, loading, error };
}