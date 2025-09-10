const path = require('path');

// CDN middleware for static asset optimization
const cdnMiddleware = (req, res, next) => {
  // Set CDN headers for static assets
  if (req.url.match(/\.(css|js|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$/)) {
    res.setHeader('Cache-Control', 'public, max-age=31536000'); // 1 year
    res.setHeader('Vary', 'Accept-Encoding');
  }
  
  next();
};

// Preload critical assets
const preloadCriticalAssets = async () => {
  const criticalAssets = [
    '/css/main.css',
    '/js/app.js',
    '/images/LogoRed.svg'
  ];
  
  console.log('📦 Preloading critical assets...');
  return criticalAssets;
};

module.exports = {
  cdnMiddleware,
  preloadCriticalAssets
};
