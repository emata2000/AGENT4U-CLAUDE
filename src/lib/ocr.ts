"use client"

/** Extract the first phone-like number from OCR text */
export function extractPhone(text: string): string {
  // Match Mexican phone patterns: 10 digits, possibly with spaces/dashes/parens
  const patterns = [
    /\(?\d{2,3}\)?[\s\-.]?\d{3,4}[\s\-.]?\d{4}/g,   // (55) 1234-5678
    /\d{10}/g,                                          // 5512345678
    /\d{3}[\s\-]\d{3}[\s\-]\d{4}/g,                   // 555 123 4567
  ]
  for (const pattern of patterns) {
    const matches = text.match(pattern)
    if (matches && matches.length > 0) {
      // Clean up to standard format
      const digits = matches[0].replace(/\D/g, "")
      if (digits.length === 10) {
        return `${digits.slice(0,2)}-${digits.slice(2,6)}-${digits.slice(6)}`
      }
      return matches[0].trim()
    }
  }
  return ""
}

/** Run Tesseract OCR on an image data URL, return extracted text */
export async function runOCR(imageDataUrl: string): Promise<string> {
  try {
    const { createWorker } = await import("tesseract.js")
    // createWorker API for tesseract.js v5+
    const worker = await createWorker(["spa", "eng"], 1, {
      // @ts-ignore
      logger: () => {},
    })
    const { data: { text } } = await worker.recognize(imageDataUrl)
    await worker.terminate()
    return text
  } catch (e) {
    console.warn("OCR failed:", e)
    return ""
  }
}
