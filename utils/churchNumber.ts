/**
 * Church (membership) numbers.
 *
 * Uniqueness is enforced by a reservation document whose id is derived from the number, so the
 * key has to be a legal Firestore document id: no slashes, and stable under the cosmetic
 * differences people type. `COC/001`, `coc-001` and ` COC 001 ` all reserve the same number,
 * which is what a human means by "that number is taken".
 */

/** Display form: trimmed, inner whitespace collapsed. Stored on the member as typed. */
export function normaliseChurchNumber(input: string): string {
  return input.trim().replace(/\s+/g, ' ')
}

/**
 * Reservation key. Lower-cased with every run of non-alphanumeric characters collapsed to a
 * single hyphen, so it can never contain the `/` that Firestore forbids in document ids.
 */
export function churchNumberKey(input: string): string {
  return normaliseChurchNumber(input)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}
