/**
 * Normalizes a Sri Lankan NIC number to the 12-digit format.
 * Handles both old (9 digits + 'V'/'X') and new (12 digits) formats.
 * @param nic The NIC number string.
 * @returns The normalized 12-digit NIC string, or null if the format is invalid.
 */
export function normalizeNic(nic: string): string | null {
  const nicClean = nic.trim().toUpperCase();

  // New 12-digit format (e.g., 198426801723)
  if (nicClean.length === 12 && /^\d{12}$/.test(nicClean)) {
    return nicClean;
  }

  // Old 10-character format (e.g., 842681723V)
  if (nicClean.length === 10 && /^\d{9}[VX]$/.test(nicClean)) {
    const year = "19" + nicClean.substring(0, 2);
    const dayOfYear = nicClean.substring(2, 5);
    const serial = nicClean.substring(5, 9);
    // The 5th digit (gender) in the old NIC corresponds to the day of the year.
    // The new format adds a '0' after the day of year.
    // This is a simplification; a full conversion is more complex.
    // For preventing duplicates, this level of normalization is often sufficient.
    return `${year}${dayOfYear}0${serial}`;
  }

  return null; // Return null if format is not recognized
}
