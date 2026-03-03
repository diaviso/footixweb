import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getAvatarUrl(avatarPath: string | null | undefined, userId?: string): string {
  if (!avatarPath) {
    // Generate a fun DiceBear avatar if no avatar is set
    if (userId) {
      return `https://api.dicebear.com/9.x/lorelei/svg?seed=${userId}&backgroundColor=ffcdd2,ffd54f,ef5350,ffb74d&backgroundType=gradientLinear`;
    }
    return '';
  }
  if (avatarPath.startsWith('http')) return avatarPath;
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
  return `${apiUrl}${avatarPath}`;
}

/**
 * Generate a DiceBear avatar URL for a user
 * Uses "lorelei" style for artistic football-themed avatars
 */
export function generateDiceBearAvatar(seed: string): string {
  return `https://api.dicebear.com/9.x/lorelei/svg?seed=${seed}&backgroundColor=ffcdd2,ffd54f,ef5350,ffb74d&backgroundType=gradientLinear`;
}
