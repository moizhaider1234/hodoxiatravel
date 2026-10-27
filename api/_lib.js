// Shared helpers. Files starting with "_" are not exposed as routes.
const { neon } = require('@neondatabase/serverless');
const sql = neon(process.env.DATABASE_URL);
const CITIES = ['Toronto','Vancouver','Montreal','Calgary','Ottawa','Edmonton','Quebec City','Winnipeg','Halifax','Mississauga','Victoria','Niagara Falls','Deer Lake'];
const FLEET = [
 ['business','Mercedes E-Class','Quiet, composed and ideal for executive airport transfers.',3,3],
 ['business','BMW 5 Series','Sharp handling with a refined, tech-forward cabin.',3,3],
 ['business','Audi A6','Understated elegance with a smooth long-distance ride.',3,3],
 ['business','Cadillac XTS','Generous rear legroom and a hushed cabin.',3,3],
 ['first','Mercedes S-Class','The flagship of comfort: reclining rear seats and ambient calm.',3,3],
 ['first','BMW 7 Series','Executive lounge comfort with commanding presence.',3,3],
 ['first','Audi A8','Whisper-quiet luxury for arrivals that matter.',3,3],
 ['suv','Mercedes V-Class','Boardroom-style seating for up to 6 guests.',6,6],
 ['suv','Chevy Suburban','Room for the whole group and all their luggage.',6,7],
 ['suv','Cadillac Escalade','Presence, space and plush captain seating.',6,6],
 ['suv','GMC Yukon Denali','All-weather confidence across Canadian winters.',6,6]];
let ready;
function init() {
  return ready ||= (async () => {
    await sql`CREATE TABLE IF NOT EXISTS fleet(id SERIAL PRIMARY KEY, category TEXT, name TEXT UNIQUE, blurb TEXT, seats INT, bags INT, sort INT)`;
    await sql`CREATE TABLE IF NOT EXISTS bookings(id SERIAL PRIMARY KEY, ref TEXT UNIQUE, name TEXT, email TEXT, phone TEXT, service TEXT, category TEXT, city TEXT, pickup TEXT, dropoff TEXT, date TEXT, time TEXT, passengers INT, notes TEXT, status TEXT DEFAULT 'new', created TIMESTAMPTZ DEFAULT now())`;
    await sql`CREATE TABLE IF NOT EXISTS contacts(id SERIAL PRIMARY KEY, name TEXT, email TEXT, message TEXT, created TIMESTAMPTZ DEFAULT now())`;
    for (const [i, f] of FLEET.entries())
      await sql`INSERT INTO fleet(category,name,blurb,seats,bags,sort) VALUES(${f[0]},${f[1]},${f[2]},${f[3]},${f[4]},${i}) ON CONFLICT (name) DO NOTHING`;
  })();
}

// Sends a notification email through Resend (https://resend.com). Never throws: the record is already saved in the DB.
const MAIL_TO = process.env.MAIL_TO || 'reservations@hodoxiatravels.com';
const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
async function notify(subject, rows, replyTo) {
  const key = process.env.RESEND_API_KEY;
  if (!key) { console.warn('RESEND_API_KEY not set: email not sent'); return false; }
  const html = '<table style="font-family:Arial,sans-serif;font-size:15px;border-collapse:collapse">' +
    rows.map(([k, v]) => `<tr><td style="padding:6px 14px 6px 0;color:#666;vertical-align:top">${esc(k)}</td><td style="padding:6px 0;white-space:pre-wrap">${esc(v) || '-'}</td></tr>`).join('') + '</table>';
  const text = rows.map(([k, v]) => `${k}: ${v || '-'}`).join('\n');
  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST', headers: { Authorization: 'Bearer ' + key, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: process.env.MAIL_FROM || 'Hodoxia Travel <onboarding@resend.dev>', to: [MAIL_TO], reply_to: replyTo, subject, html, text }) });
    if (!r.ok) console.error('Email failed', r.status, await r.text());
    return r.ok;
  } catch (e) { console.error('Email error', e); return false; }
}
const clean = (v, n = 300) => String(v ?? '').trim().slice(0, n);
const emailOk = e => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e);
const wrap = fn => async (req, res) => { try { await init(); await fn(req, res); } catch (e) { console.error(e); res.status(500).json({ error: 'Server error. Please try again.' }); } };
module.exports = { sql, CITIES, clean, emailOk, wrap, notify };
