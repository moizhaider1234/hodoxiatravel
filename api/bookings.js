const { sql, CITIES, clean, emailOk, wrap } = require('./_lib');
module.exports = wrap(async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const b = req.body || {}, d = {};
  for (const k of ['name','email','phone','service','category','city','pickup','dropoff','date','time','notes']) d[k] = clean(b[k], k === 'notes' ? 1000 : 200);
  d.passengers = Math.max(1, Math.min(20, parseInt(b.passengers) || 1));
  if (!d.name || !emailOk(d.email) || !d.phone || !d.pickup || !d.date || !d.time) return res.status(400).json({ error: 'Please complete name, valid email, phone, pickup, date and time.' });
  if (!CITIES.includes(d.city)) return res.status(400).json({ error: 'We currently serve Canadian cities only. Please choose a listed city.' });
  const ref = 'HDX-' + Date.now().toString(36).toUpperCase().slice(-6);
  await sql`INSERT INTO bookings(ref,name,email,phone,service,category,city,pickup,dropoff,date,time,passengers,notes)
    VALUES(${ref},${d.name},${d.email},${d.phone},${d.service},${d.category},${d.city},${d.pickup},${d.dropoff},${d.date},${d.time},${d.passengers},${d.notes})`;
  res.json({ ok: true, ref });
});
