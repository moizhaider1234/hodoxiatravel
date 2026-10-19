# Hodoxia Travel Inc. (Canada) on Vercel
1. Push this folder to GitHub, import it in Vercel (Framework preset: Other, no build command).
2. Vercel dashboard > Storage > Create > Neon Postgres, connect to the project. This adds DATABASE_URL.
3. Add env var ADMIN_KEY (any secret). Redeploy. Tables and the fleet are created automatically on first request.
4. View bookings: GET /api/admin/bookings with header `x-admin-key: <ADMIN_KEY>`.
Local dev: `npm i -g vercel && vercel link && vercel env pull && vercel dev`.
Hero video: add public/media/gulfstream.mp4 (keep under ~10 MB, 1080p H.264, no audio). Fleet photos: public/fleet/<model-slug>.jpg.
