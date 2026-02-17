const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // okunabilir, I/O/0/1 yok

/**
 * Kısa takip kodu üretir (örn: 10 karakter).
 * Çakışma ihtimali çok düşük; DB UNIQUE kısıtı ile garanti edilir.
 */
export function generateTrackingCode(length = 10) {
  const bytes = new Uint8Array(length)
  crypto.getRandomValues(bytes)
  let out = ''
  for (let i = 0; i < bytes.length; i++) {
    out += ALPHABET[bytes[i] % ALPHABET.length]
  }
  return out
}

