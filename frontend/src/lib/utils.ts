import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Normalize a role value from any source into a clean frontend role string.
 * Handles "ROLE_ADMIN" → "ADMIN", "ROLE_USER" → "USER", etc.
 * Falls back to "USER" for any unknown/null/undefined value.
 */
export function normalizeRole(role: unknown): 'USER' | 'ADMIN' | 'TECHNICIAN' {
  if (typeof role !== 'string' || !role) return 'USER';
  const clean = role.replace(/^ROLE_/i, '').toUpperCase();
  if (clean === 'ADMIN') return 'ADMIN';
  if (clean === 'TECHNICIAN') return 'TECHNICIAN';
  return 'USER';
}
