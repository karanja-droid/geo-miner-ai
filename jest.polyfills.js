// Polyfill for TextEncoder/TextDecoder
import { TextEncoder, TextDecoder } from "util"

global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder

// Polyfill for crypto.randomUUID
import { randomUUID } from "crypto"
global.crypto = {
  randomUUID,
}

// Polyfill for URL
import { URL, URLSearchParams } from "url"
global.URL = URL
global.URLSearchParams = URLSearchParams
