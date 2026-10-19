import { app } from './init.js';

export async function initializeAnalytics() {
  const { getAnalytics, isSupported } = await import('firebase/analytics');
  if (await isSupported()) return getAnalytics(app);
  return null;
}
