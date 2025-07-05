import { Injectable, BadRequestException, ConflictException, NotFoundException } from "@nestjs/common"
import type { Repository } from "typeorm"
import type { IdentityLink } from "../entities/identity-link.entity"
import type { WalletNonce } from "../entities/wallet-nonce.entity"
import type { CryptoService } from "./crypto.service"
import type { GenerateNonceDto } from "../dto/generate-nonce.dto"
import type { LinkWalletDto } from "../dto/link-wallet.dto"
import type { GetLinkedIdentitiesDto } from "../dto/get-linked-identities.dto"
import type { NonceResponse, LinkWalletResponse, LinkedIdentity } from "../interfaces/identity-linker.interface"

@Injectable()
export class IdentityLinkerService {
  private readonly NONCE_EXPIRY_MINUTES = 15

  constructor(
    private readonly identityLinkRepository: Repository<IdentityLink>,
    private readonly walletNonceRepository: Repository<WalletNonce>,
    private readonly cryptoService: CryptoService,
  ) {}

  /**
   * Generate a nonce for wallet verification
   */
  async generateNonce(generateNonceDto: GenerateNonceDto): Promise<NonceResponse> {
    const { walletAddress } = generateNonceDto
    const normalizedAddress = this.cryptoService.normalizeAddress(walletAddress)

    // Clean up expired nonces
    await this.cleanupExpiredNonces()

    // Check if there's an existing valid nonce
    const existingNonce = await this.walletNonceRepository.findOne({
      where: {
        walletAddress: normalizedAddress,
        isUsed: false,
      },
    })

    if (existingNonce && existingNonce.expiresAt > new Date()) {
      const message = this.cryptoService.createSignatureMessage(normalizedAddress, existingNonce.nonce)
      return {
        nonce: existingNonce.nonce,
        message,
        expiresAt: existingNonce.expiresAt,
      }
    }

    // Generate new nonce
    const nonce = this.cryptoService.generateNonce()
    const expiresAt = new Date(Date.now() + this.NONCE_EXPIRY_MINUTES * 60 * 1000)

    // Remove any existing nonce for this wallet
    await this.walletNonceRepository.delete({ walletAddress: normalizedAddress })

    // Create new nonce record
    const walletNonce = this.walletNonceRepository.create({
      walletAddress: normalizedAddress,
      nonce,
      expiresAt,
    })

    await this.walletNonceRepository.save(walletNonce)

    const message = this.cryptoService.createSignatureMessage(normalizedAddress, nonce)

    return {
      nonce,
      message,
      expiresAt,
    }
  }

  /**
   * Link a wallet to a user account
   */
  async linkWallet(linkWalletDto: LinkWalletDto): Promise<LinkWalletResponse> {
    const { userId, walletAddress, signature } = linkWalletDto
    const normalizedAddress = this.cryptoService.normalizeAddress(walletAddress)

    // Find and validate nonce
    const walletNonce = await this.walletNonceRepository.findOne({
      where: {
        walletAddress: normalizedAddress,
        isUsed: false,
      },
    })

    if (!walletNonce) {
      throw new BadRequestException("No valid nonce found for this wallet address")
    }

    if (walletNonce.expiresAt < new Date()) {
      throw new BadRequestException("Nonce has expired")
    }

    // Verify signature
    const message = this.cryptoService.createSignatureMessage(normalizedAddress, walletNonce.nonce)
    const isValidSignature = this.cryptoService.verifySignature(message, signature, normalizedAddress)

    if (!isValidSignature) {
      throw new BadRequestException("Invalid signature")
    }

    // Check if wallet is already linked to any user
    const existingLink = await this.identityLinkRepository.findOne({
      where: {
        walletAddress: normalizedAddress,
        isActive: true,
      },
    })

    if (existingLink) {
      throw new ConflictException("Wallet address is already linked to another account")
    }

    // Check if user already has this wallet linked
    const existingUserLink = await this.identityLinkRepository.findOne({
      where: {
        userId,
        walletAddress: normalizedAddress,
      },
    })

    if (existingUserLink) {
      throw new ConflictException("This wallet is already linked to your account")
    }

    // Create identity link
    const signatureHash = this.cryptoService.hashSignature(signature)
    const identityLink = this.identityLinkRepository.create({
      userId,
      walletAddress: normalizedAddress,
      signatureHash,
      linkedAt: new Date(),
    })

    const savedLink = await this.identityLinkRepository.save(identityLink)

    // Mark nonce as used
    walletNonce.isUsed = true
    await this.walletNonceRepository.save(walletNonce)

    return {
      success: true,
      linkId: savedLink.id,
      linkedAt: savedLink.linkedAt,
    }
  }

  /**
   * Get linked identities based on filters
   */
  async getLinkedIdentities(filters: GetLinkedIdentitiesDto): Promise<LinkedIdentity[]> {
    const queryBuilder = this.identityLinkRepository.createQueryBuilder("identity_link")

    queryBuilder.where("identity_link.isActive = :isActive", { isActive: true })

    if (filters.userId) {
      queryBuilder.andWhere("identity_link.userId = :userId", { userId: filters.userId })
    }

    if (filters.walletAddress) {
      const normalizedAddress = this.cryptoService.normalizeAddress(filters.walletAddress)
      queryBuilder.andWhere("identity_link.walletAddress = :walletAddress", {
        walletAddress: normalizedAddress,
      })
    }

    queryBuilder.orderBy("identity_link.linkedAt", "DESC")

    const identityLinks = await queryBuilder.getMany()

    return identityLinks.map((link) => ({
      id: link.id,
      userId: link.userId,
      walletAddress: link.walletAddress,
      linkedAt: link.linkedAt,
      isActive: link.isActive,
    }))
  }

  /**
   * Unlink a wallet from a user account
   */
  async unlinkWallet(userId: string, walletAddress: string): Promise<boolean> {
    const normalizedAddress = this.cryptoService.normalizeAddress(walletAddress)

    const identityLink = await this.identityLinkRepository.findOne({
      where: {
        userId,
        walletAddress: normalizedAddress,
        isActive: true,
      },
    })

    if (!identityLink) {
      throw new NotFoundException("Wallet link not found")
    }

    identityLink.isActive = false
    await this.identityLinkRepository.save(identityLink)

    return true
  }

  /**
   * Check if a wallet is linked to a specific user
   */
  async isWalletLinkedToUser(userId: string, walletAddress: string): Promise<boolean> {
    const normalizedAddress = this.cryptoService.normalizeAddress(walletAddress)

    const count = await this.identityLinkRepository.count({
      where: {
        userId,
        walletAddress: normalizedAddress,
        isActive: true,
      },
    })

    return count > 0
  }

  /**
   * Get user ID by wallet address
   */
  async getUserByWallet(walletAddress: string): Promise<string | null> {
    const normalizedAddress = this.cryptoService.normalizeAddress(walletAddress)

    const identityLink = await this.identityLinkRepository.findOne({
      where: {
        walletAddress: normalizedAddress,
        isActive: true,
      },
    })

    return identityLink?.userId || null
  }

  /**
   * Clean up expired nonces
   */
  private async cleanupExpiredNonces(): Promise<void> {
    await this.walletNonceRepository.delete({
      expiresAt: { $lt: new Date() } as any,
    })
  }
}
