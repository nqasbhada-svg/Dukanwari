/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import bcrypt from 'bcryptjs';

/**
 * Hash a plain text password using bcryptjs.
 * @param password Plain text password
 * @returns Bcrypt hashed password string
 */
export function hashPassword(password: string): string {
  const salt = bcrypt.genSaltSync(10);
  return bcrypt.hashSync(password, salt);
}

/**
 * Safely compare a plain text password with a hashed password.
 * Supports legacy plain-text passwords as fallback.
 * @param password Plain text password input
 * @param hash Hashed or plain text password stored in database/state
 * @returns boolean indicating if the password matches
 */
export function comparePassword(password: string, hash: string): boolean {
  if (
    hash &&
    (hash.startsWith('$2a$') || hash.startsWith('$2b$') || hash.startsWith('$2y$'))
  ) {
    try {
      return bcrypt.compareSync(password, hash);
    } catch (error) {
      console.error('Bcrypt comparison failed, falling back to plain text comparison:', error);
    }
  }
  // Fallback for pre-existing plain-text mock data or error cases
  return password === hash;
}
