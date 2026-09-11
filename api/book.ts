/**
 * Vercel Edge Function — POST /api/book
 *
 * Receives the "Request Your Visit" form and emails it to the front desk
 * via Resend (https://resend.com — free tier covers a dental office easily).
 *
 * Required environment variables (Vercel → Project → Settings → Environment Variables):
 *   RESEND_API_KEY     — API key from resend.com/api-keys
 *   BOOKING_TO_EMAIL   — Inbox that should receive requests (e.g. dora@drluma.com)
 *   BOOKING_FROM_EMAIL — Verified sender, e.g. "Atlantic Dental Care <bookings@drluma.com>"
 *                        (add drluma.com as a domain in Resend first; until then
 *                        "onboarding@resend.dev" works for testing only)
 *
 * If the variables are missing the endpoint returns 503 and the site
 * falls back to showing the phone number, so nothing is lost silently.
 */

export const config = { runtime: "edge" };

interface BookingPayload {
  name?: string;
  phone?: string;
  email?: string;
  service?: string;
  date?: string;
  note?: string;
  website?: string; // honeypot — real users never fill this
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });

const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] as string));

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  let body: BookingPayload;
  try {
    body = (await req.json()) as BookingPayload;
  } catch {
    return json({ error: "Invalid request body" }, 400);
  }

  // Bots fill every field, including the hidden one — pretend it worked.
  if (body.website) return json({ ok: true });

  const name    = (body.name    ?? "").trim().slice(0, 120);
  const phone   = (body.phone   ?? "").trim().slice(0, 40);
  const email   = (body.email   ?? "").trim().slice(0, 120);
  const service = (body.service ?? "").trim().slice(0, 80);
  const date    = (body.date    ?? "").trim().slice(0, 20);
  const note    = (body.note    ?? "").trim().slice(0, 2000);

  if (!name || !phone || !service) {
    return json({ error: "Name, phone number and service are required." }, 400);
  }

  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  const TO   = process.env.BOOKING_TO_EMAIL;
  const FROM = process.env.BOOKING_FROM_EMAIL ?? "Atlantic Dental Care <onboarding@resend.dev>";

  if (!RESEND_API_KEY || !TO) {
    return json({ error: "Online booking is not configured yet." }, 503);
  }

  const rows: Array<[string, string]> = [
    ["Name", name],
    ["Phone", phone],
    ["Email", email || "—"],
    ["Service", service],
    ["Preferred date", date || "—"],
    ["Notes", note || "—"],
  ];

  const html = `
    <h2 style="font-family:system-ui,sans-serif;color:#162b50">New appointment request</h2>
    <table style="font-family:system-ui,sans-serif;font-size:15px;border-collapse:collapse">
      ${rows.map(([k, v]) => `<tr><td style="padding:6px 14px 6px 0;color:#4b6275;font-weight:600">${k}</td><td style="padding:6px 0">${escapeHtml(v).replace(/\n/g, "<br>")}</td></tr>`).join("")}
    </table>
    <p style="font-family:system-ui,sans-serif;font-size:13px;color:#849aaa">Sent from the website booking form.</p>`;

  const text = rows.map(([k, v]) => `${k}: ${v}`).join("\n");

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: FROM,
        to: TO.split(",").map((s) => s.trim()),
        reply_to: email || undefined,
        subject: `Appointment request — ${name} (${service})`,
        html,
        text,
      }),
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      console.error("Resend error", res.status, detail);
      return json({ error: "Could not send your request." }, 502);
    }
    return json({ ok: true });
  } catch (e) {
    console.error("Booking send failed", e);
    return json({ error: "Could not send your request." }, 502);
  }
}
