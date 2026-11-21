import type { ChurchSettings } from '~/repositories/churchSettingsRepository'

/** Tokens an admin may use in legal page text; filled from Settings → General at render time. */
export const LEGAL_TOKENS = ['{church}', '{email}', '{phone}', '{address}'] as const

export function fillLegalTokens(
  text: string,
  s: Pick<ChurchSettings, 'name' | 'email' | 'phone' | 'address'>
): string {
  return text
    .replaceAll('{church}', s.name)
    .replaceAll('{email}', s.email)
    .replaceAll('{phone}', s.phone)
    .replaceAll('{address}', s.address)
}

/** Splits plain text into paragraphs on blank lines, dropping empty ones. */
export function toParagraphs(text: string): string[] {
  return text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean)
}

/** Today as YYYY-MM-DD in the visitor's local time. */
export function todayIso(): string {
  const d = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}
