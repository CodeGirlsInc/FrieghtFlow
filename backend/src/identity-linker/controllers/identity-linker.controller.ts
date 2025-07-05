import { Controller, Post, Get, Delete, Param, HttpCode, HttpStatus } from "@nestjs/common"
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from "@nestjs/swagger"
import type { IdentityLinkerService } from "../services/identity-linker.service"
import type { GenerateNonceDto } from "../dto/generate-nonce.dto"
import type { LinkWalletDto } from "../dto/link-wallet.dto"
import type { GetLinkedIdentitiesDto } from "../dto/get-linked-identities.dto"
import type { NonceResponse, LinkWalletResponse, LinkedIdentity } from "../interfaces/identity-linker.interface"

@ApiTags("Identity Linker")
@Controller("identity-linker")
export class IdentityLinkerController {
  constructor(private readonly identityLinkerService: IdentityLinkerService) {}

  @Post("generate-nonce")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Generate nonce for wallet verification" })
  @ApiResponse({ status: 200, description: "Nonce generated successfully" })
  @ApiResponse({ status: 400, description: "Invalid wallet address" })
  async generateNonce(generateNonceDto: GenerateNonceDto): Promise<NonceResponse> {
    return this.identityLinkerService.generateNonce(generateNonceDto)
  }

  @Post("link-wallet")
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Link wallet to user account" })
  @ApiResponse({ status: 201, description: "Wallet linked successfully" })
  @ApiResponse({ status: 400, description: "Invalid signature or expired nonce" })
  @ApiResponse({ status: 409, description: "Wallet already linked" })
  async linkWallet(linkWalletDto: LinkWalletDto): Promise<LinkWalletResponse> {
    return this.identityLinkerService.linkWallet(linkWalletDto)
  }

  @Get("linked-identities")
  @ApiOperation({ summary: "Get linked identities" })
  @ApiResponse({ status: 200, description: "Linked identities retrieved successfully" })
  @ApiQuery({ name: "userId", required: false, description: "Filter by user ID" })
  @ApiQuery({ name: "walletAddress", required: false, description: "Filter by wallet address" })
  async getLinkedIdentities(filters: GetLinkedIdentitiesDto): Promise<LinkedIdentity[]> {
    return this.identityLinkerService.getLinkedIdentities(filters)
  }

  @Delete("unlink-wallet/:userId/:walletAddress")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Unlink wallet from user account" })
  @ApiParam({ name: "userId", description: "User ID" })
  @ApiParam({ name: "walletAddress", description: "Wallet address to unlink" })
  @ApiResponse({ status: 204, description: "Wallet unlinked successfully" })
  @ApiResponse({ status: 404, description: "Wallet link not found" })
  async unlinkWallet(@Param('userId') userId: string, @Param('walletAddress') walletAddress: string): Promise<void> {
    await this.identityLinkerService.unlinkWallet(userId, walletAddress)
  }

  @Get("check-link/:userId/:walletAddress")
  @ApiOperation({ summary: "Check if wallet is linked to user" })
  @ApiParam({ name: "userId", description: "User ID" })
  @ApiParam({ name: "walletAddress", description: "Wallet address" })
  @ApiResponse({ status: 200, description: "Link status retrieved" })
  async checkWalletLink(
    @Param('userId') userId: string,
    @Param('walletAddress') walletAddress: string,
  ): Promise<{ isLinked: boolean }> {
    const isLinked = await this.identityLinkerService.isWalletLinkedToUser(userId, walletAddress)
    return { isLinked }
  }

  @Get('user-by-wallet/:walletAddress')
  @ApiOperation({ summary: 'Get user ID by wallet address' })
  @ApiParam({ name: 'walletAddress', description: 'Wallet address' })
  @ApiResponse({ status: 200, description: 'User ID retrieved' })
  @ApiResponse({ status: 404, description: 'No user found for this wallet' })
  async getUserByWallet(
    @Param('walletAddress') walletAddress: string,
  ): Promise<{ userId: string | null }> {
    const userId = await this.identityLinkerService.getUserByWallet(walletAddress);
    return { userId };
  }
}
