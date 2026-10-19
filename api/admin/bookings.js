const { sql, wrap } = require('../_lib');
module.exports = wrap(async (req, res) => {
  if (!process.env.ADMIN_KEY || req.headers['x-admin-key'] !== process.env.ADMIN_KEY) return res.status(401).json({ error: 'Unauthorized' });
  res.json(await sql`SELECT * FROM bookings ORDER BY id DESC`);
});
