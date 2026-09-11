/**
 * Vercel Edge Function — /api/reviews
 *
 * Fetches reviews from Google Places API and Facebook Graph API.
 * Results are cached at the edge for 1 hour so the upstream APIs
 * are not hit on every single page load; the client shuffles the
 * returned array so different reviews appear on every visit.
 *
 * Required environment variables (set in Vercel project settings):
 *   GOOGLE_PLACES_API_KEY  — Google Cloud API key with "Places API (New)" enabled
 *                            (the legacy Places API is no longer available to new projects)
 *   GOOGLE_PLACE_ID        — Place ID for Atlantic Dental Care
 *                            Find yours: https://developers.google.com/maps/documentation/places/web-service/place-id
 *                            Note: Google returns at most 5 reviews per place.
 *   FACEBOOK_PAGE_ID       — Numeric Facebook Page ID
 *   FACEBOOK_PAGE_TOKEN    — Long-lived Page Access Token
 *                            Generate: https://developers.facebook.com/tools/explorer
 */

export const config = { runtime: "edge" };

export interface Review {
  id: string;
  source: "google" | "facebook";
  name: string;
  photo: string | null;
  rating: number;
  text: string;
  time: number;
}

// Places API (New) — https://developers.google.com/maps/documentation/places/web-service/place-details
interface GooglePlacesResponse {
  reviews?: Array<{
    rating?: number;
    text?: { text?: string; languageCode?: string };
    originalText?: { text?: string };
    publishTime?: string; // RFC 3339
    authorAttribution?: { displayName?: string; uri?: string; photoUri?: string };
  }>;
  error?: { code?: number; message?: string; status?: string };
}

interface FacebookRatingsResponse {
  data?: Array<{
    reviewer?: { name: string; picture?: { data?: { url?: string } } };
    rating?: number;
    review_text?: string;
    created_time?: string;
  }>;
}

export default async function handler(): Promise<Response> {
  const reviews: Review[] = [];
  const errors: string[] = [];

  // ── Google Places ──────────────────────────────────────────
  const GOOGLE_KEY = process.env.GOOGLE_PLACES_API_KEY;
  const PLACE_ID   = process.env.GOOGLE_PLACE_ID;

  if (GOOGLE_KEY && PLACE_ID) {
    try {
      const url = `https://places.googleapis.com/v1/places/${encodeURIComponent(PLACE_ID)}?languageCode=en`;

      const res  = await fetch(url, {
        headers: {
          "X-Goog-Api-Key":   GOOGLE_KEY,
          "X-Goog-FieldMask": "reviews",
        },
      });
      const data = (await res.json()) as GooglePlacesResponse;

      if (data.reviews) {
        data.reviews.forEach((r, i) => {
          const text = (r.text?.text ?? r.originalText?.text ?? "").trim();
          if (text.length > 20) {
            reviews.push({
              id:     `google-${i}`,
              source: "google",
              name:   r.authorAttribution?.displayName ?? "Google Reviewer",
              photo:  r.authorAttribution?.photoUri ?? null,
              rating: r.rating ?? 5,
              text,
              time:   r.publishTime
                ? Math.floor(new Date(r.publishTime).getTime() / 1000)
                : Math.floor(Date.now() / 1000),
            });
          }
        });
      } else if (data.error) {
        errors.push(`Google Places ${data.error.status ?? res.status}: ${data.error.message ?? "unknown error"}`);
      }
    } catch (e) {
      errors.push(`Google Places error: ${String(e)}`);
    }
  }

  // ── Facebook Page Ratings ──────────────────────────────────
  const FB_PAGE_ID = process.env.FACEBOOK_PAGE_ID;
  const FB_TOKEN   = process.env.FACEBOOK_PAGE_TOKEN;

  if (FB_PAGE_ID && FB_TOKEN) {
    try {
      const fields = "reviewer{name,picture{url}},rating,review_text,created_time";
      const url =
        `https://graph.facebook.com/v19.0/${encodeURIComponent(FB_PAGE_ID)}/ratings` +
        `?fields=${encodeURIComponent(fields)}` +
        `&limit=50` +
        `&access_token=${encodeURIComponent(FB_TOKEN)}`;

      const res  = await fetch(url);
      const data = (await res.json()) as FacebookRatingsResponse;

      if (data.data) {
        data.data.forEach((r, i) => {
          const text = r.review_text?.trim() ?? "";
          const rating = r.rating ?? 5;
          if (text.length > 20 && rating >= 4) {
            reviews.push({
              id:     `facebook-${i}`,
              source: "facebook",
              name:   r.reviewer?.name ?? "Facebook Reviewer",
              photo:  r.reviewer?.picture?.data?.url ?? null,
              rating,
              text,
              time:   r.created_time
                ? Math.floor(new Date(r.created_time).getTime() / 1000)
                : Date.now() / 1000,
            });
          }
        });
      }
    } catch (e) {
      errors.push(`Facebook error: ${String(e)}`);
    }
  }

  return new Response(
    JSON.stringify({ reviews, errors, configured: { google: !!(GOOGLE_KEY && PLACE_ID), facebook: !!(FB_PAGE_ID && FB_TOKEN) } }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        // Cache at the edge for 1 hour; stale while revalidating up to 2h
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200",
        "Access-Control-Allow-Origin": "*",
      },
    }
  );
}
