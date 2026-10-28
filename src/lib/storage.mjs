export const BOOKING_KEY = 'project56.booking.v1';
export const CONTACT_KEY = 'project56.contact.v1';
export function saveDemoRecord(key, record) {
  try { localStorage.setItem(key, JSON.stringify(record)); return true; }
  catch { return false; }
}
