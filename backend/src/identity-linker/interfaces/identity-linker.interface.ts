export interface NonceResponse {
  nonce: string
  message: string
  expiresAt: Date
}

export interface LinkWalletResponse {
  success: boolean
  linkId: string
  linkedAt: Date
}

export interface LinkedIdentity {
  id: string
  userId: string
  walletAddress: string
  linkedAt: Date
  isActive: boolean
}
