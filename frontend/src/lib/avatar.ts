export function generateAvatarSeed(name: string) {
  return `${name.trim().toLowerCase().replace(/\s+/g, "-")}-${Math.random().toString(36).slice(2, 8)}`;
}

export function buildAvatarUrl(seed: string) {
  return `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(seed)}&backgroundType=gradientLinear&backgroundColor=f6f1e8,c8a97e,111111&textColor=111111&fontFamily=Georgia`;
}
