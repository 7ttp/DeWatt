/**
 * MongoDB Connection Utility
 * Re-export from db.ts for compatibility
 */

import { connectDB } from './db';

export async function connectToDatabase() {
  return await connectDB();
}
