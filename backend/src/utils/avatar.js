function sanitizeSeed(seed) {
  return encodeURIComponent(seed.trim().toLowerCase());
}

function buildAvatarUrl(seed) {
  const safeSeed = sanitizeSeed(seed);
  return `https://api.dicebear.com/9.x/initials/svg?seed=${safeSeed}&backgroundType=gradientLinear&backgroundColor=f6f1e8,c8a97e,111111&textColor=111111&fontFamily=Georgia`;
}

module.exports = {
  buildAvatarUrl,
};
