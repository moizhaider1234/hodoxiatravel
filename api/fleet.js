const { sql, wrap } = require('./_lib');
module.exports = wrap(async (req, res) => { res.setHeader('Cache-Control','s-maxage=300'); res.json(await sql`SELECT * FROM fleet ORDER BY sort`); });
