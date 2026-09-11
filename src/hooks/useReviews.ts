import { useState, useEffect } from "react";

export interface Review {
  id: string;
  source: "google" | "facebook";
  name: string;
  photo: string | null;
  rating: number;
  text: string;
  time: number;
}

export interface ReviewsState {
  reviews: Review[];      // shuffled slice shown this load
  all: Review[];          // full list returned from API
  loading: boolean;
  error: string | null;
  configured: { google: boolean; facebook: boolean };
}

/** Fisher-Yates shuffle — returns a new array */
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Fetches reviews from /api/reviews, shuffles them, and returns
 * `count` reviews for display. Every page load gets a different
 * random selection from the full pool.
 */
export function useReviews(count = 6): ReviewsState {
  const [state, setState] = useState<ReviewsState>({
    reviews: [],
    all: [],
    loading: true,
    error: null,
    configured: { google: false, facebook: false },
  });

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch("/api/reviews");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data = await res.json() as {
          reviews: Review[];
          errors: string[];
          configured: { google: boolean; facebook: boolean };
        };

        if (cancelled) return;

        const all      = data.reviews ?? [];
        const shuffled = shuffle(all);
        const shown    = shuffled.slice(0, count);

        setState({
          reviews: shown,
          all,
          loading: false,
          error: null,
          configured: data.configured ?? { google: false, facebook: false },
        });
      } catch (err) {
        if (cancelled) return;
        setState(prev => ({ ...prev, loading: false, error: String(err) }));
      }
    }

    load();
    return () => { cancelled = true; };
  }, [count]);

  return state;
}
