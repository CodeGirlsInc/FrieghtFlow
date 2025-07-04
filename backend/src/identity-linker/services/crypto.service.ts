import { Injectable } from "@nestjs/common"
import { ethers } from "ethers"
import * as crypto from "crypto"

@Injectable()
export class CryptoService {
  /**
   * Generate a cryptographically secure nonce
   */
  generateNonce(): string {
    return crypto.randomBytes(32).toString("hex")
  }

  /**
   * Create a message for wallet signature
   */
  createSignatureMessage(walletAddress: string, nonce: string): string {
    return `Please sign this message to verify your wallet ownership.\n\nWallet: ${walletAddress}\nNonce: ${nonce}\nTimestamp: ${Date.now()}`
  }

  /**
   * Verify wallet signature
   */
  verifySignature(message: string, signature: string, expectedAddress: string): boolean {
    try {
      const recoveredAddress = ethers.verifyMessage(message, signature)
      return recoveredAddress.toLowerCase() === expectedAddress.toLowerCase()
    } catch (error) {
      return false
    }
  }

  /**
   * Hash signature for secure storage
   */
  hashSignature(signature: string): string {
    return crypto.createHash("sha256").update(signature).digest("hex")
  }

  /**
   * Normalize wallet address to lowercase
   */
  normalizeAddress(address: string): string {
    return address.toLowerCase()
  }
}
