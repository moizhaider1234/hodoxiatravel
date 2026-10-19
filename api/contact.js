const { sql, clean, emailOk, wrap } = require('./_lib');
module.exports = wrap(async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { name, email, message } = req.body || {};
  if (!clean(name) || !emailOk(clean(email)) || !clean(message)) return res.status(400).json({ error: 'Name, valid email and message are required.' });
  await sql`INSERT INTO contacts(name,email,message) VALUES(${clean(name)},${clean(email)},${clean(message, 2000)})`;
  res.json({ ok: true });
});
