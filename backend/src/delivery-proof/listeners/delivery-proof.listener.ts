import { Injectable, Logger } from "@nestjs/common"
import { OnEvent } from "@nestjs/event-emitter"
import type {
  DeliveryProofCreatedEvent,
  DeliveryProofVerifiedEvent,
  DeliveryProofFailedEvent,
  BlockchainUpdateRequestedEvent,
  BlockchainUpdateCompletedEvent,
} from "../events/delivery-proof.events"
import type { DeliveryProofService } from "../services/delivery-proof.service"
import { ProofStatus } from "../entities/delivery-proof.entity"

@Injectable()
export class DeliveryProofListener {
  private readonly logger = new Logger(DeliveryProofListener.name)

  constructor(private readonly deliveryProofService: DeliveryProofService) {}

  @OnEvent("delivery-proof.created")
  async handleDeliveryProofCreated(event: DeliveryProofCreatedEvent): Promise<void> {
    this.logger.log(`Handling delivery proof created event: ${event.deliveryProof.id}`)

    // Auto-verify certain types of proofs
    if (event.deliveryProof.proofType === "token" && event.deliveryProof.token) {
      try {
        await this.deliveryProofService.verifyProof(event.deliveryProof.id)
      } catch (error) {
        this.logger.error(`Auto-verification failed: ${error.message}`)
        await this.deliveryProofService.markAsFailed(event.deliveryProof.id, error.message)
      }
    }
  }

  @OnEvent("delivery-proof.verified")
  async handleDeliveryProofVerified(event: DeliveryProofVerifiedEvent): Promise<void> {
    this.logger.log(`Handling delivery proof verified event: ${event.deliveryProof.id}`)

    // Additional processing after verification
    // Could trigger notifications, update external systems, etc.
  }

  @OnEvent("delivery-proof.failed")
  async handleDeliveryProofFailed(event: DeliveryProofFailedEvent): Promise<void> {
    this.logger.warn(`Handling delivery proof failed event: ${event.deliveryProof.id}, Error: ${event.error}`)

    // Handle failed proofs - could trigger alerts, retry mechanisms, etc.
  }

  @OnEvent("blockchain.update-requested")
  async handleBlockchainUpdateRequested(event: BlockchainUpdateRequestedEvent): Promise<void> {
    this.logger.log(`Handling blockchain update requested event: ${event.deliveryProof.id}`)

    try {
      // Update status to indicate blockchain processing
      await this.deliveryProofService.update(event.deliveryProof.id, {
        status: ProofStatus.BLOCKCHAIN_PENDING,
      })

      // Simulate blockchain interaction (replace with actual smart contract call)
      await this.simulateBlockchainUpdate(event.deliveryProof.id)
    } catch (error) {
      this.logger.error(`Blockchain update failed: ${error.message}`)
      await this.deliveryProofService.markAsFailed(event.deliveryProof.id, `Blockchain update failed: ${error.message}`)
    }
  }

  @OnEvent("blockchain.update-completed")
  async handleBlockchainUpdateCompleted(event: BlockchainUpdateCompletedEvent): Promise<void> {
    this.logger.log(`Blockchain update completed for proof: ${event.deliveryProof.id}, TX: ${event.txHash}`)
  }

  private async simulateBlockchainUpdate(proofId: string): Promise<void> {
    // Simulate async blockchain operation
    setTimeout(async () => {
      try {
        const mockTxHash = `0x${Math.random().toString(16).substr(2, 64)}`
        const mockBlockNumber = Math.floor(Math.random() * 1000000).toString()

        await this.deliveryProofService.updateBlockchainInfo(proofId, mockTxHash, mockBlockNumber)

        this.logger.log(`Simulated blockchain update completed for proof: ${proofId}`)
      } catch (error) {
        this.logger.error(`Simulated blockchain update failed: ${error.message}`)
        await this.deliveryProofService.markAsFailed(proofId, `Blockchain simulation failed: ${error.message}`)
      }
    }, 2000) // 2 second delay to simulate blockchain processing
  }
}
