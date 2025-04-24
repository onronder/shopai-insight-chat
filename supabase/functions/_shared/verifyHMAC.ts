// File: supabase/functions/_shared/verifyHMAC.ts
/**
 * Verifies HMAC-SHA256 signature from Shopify webhook headers.
 */
// Just use the native crypto module without external imports
const encoder = new TextEncoder();

/**
 * Validate HMAC header with body + secret
 * @param rawBody Raw request body string
 * @param hmacHeader X-Shopify-Hmac-Sha256 header value
 * @param secret Shopify App Secret
 * @returns boolean - valid or not
 */
export async function verifyShopifyHMAC(
  rawBody: string,
  hmacHeader: string,
  secret: string
): Promise<boolean> {
  try {
    // Import key
    const keyData = encoder.encode(secret);
    const key = await crypto.subtle.importKey(
      "raw",
      keyData,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    
    // Sign message
    const messageData = encoder.encode(rawBody);
    const signature = await crypto.subtle.sign(
      "HMAC",
      key,
      messageData
    );
    
    // Convert signature to base64
    const base64Signature = btoa(
      String.fromCharCode(...new Uint8Array(signature))
    );
    
    // Constant-time comparison
    if (base64Signature.length !== hmacHeader.length) {
      return false;
    }
    
    let result = 0;
    for (let i = 0; i < base64Signature.length; i++) {
      result |= base64Signature.charCodeAt(i) ^ hmacHeader.charCodeAt(i);
    }
    
    return result === 0;
  } catch (err) {
    console.error("HMAC verification failed:", err);
    return false;
  }
}