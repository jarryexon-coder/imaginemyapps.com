module.exports = function handler(_req, res) {
  res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=300');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  return res.status(200).json({
    tiktokPixelId: process.env.TIKTOK_PIXEL_ID || null,
  });
};
