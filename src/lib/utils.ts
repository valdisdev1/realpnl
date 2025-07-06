import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Check if a user has active API credentials configured
 * @param profile - The user profile from AuthContext
 * @returns boolean indicating if API credentials are configured
 */
export function hasActiveApiCredentials(profile: any): boolean {
  return !!(profile?.api_key && profile?.api_secret);
}
