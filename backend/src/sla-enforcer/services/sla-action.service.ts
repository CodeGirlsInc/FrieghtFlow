import { Injectable, Logger } from "@nestjs/common"
import type { Repository } from "typeorm"
import type { HttpService } from "@nestjs/axios"
import { type SLAViolation, ViolationStatus } from "../entities/sla-violation.entity"
import type { SLARule } from "../entities/sla-rule.entity"
import type { Shipment } from "../entities/shipment.entity"
import type { ActionExecutionResult } from "../interfaces/sla-enforcer.interface"

@Injectable()
export class SLAActionService {
  private readonly logger = new Logger(SLAActionService.name)

  private readonly slaViolationRepository: Repository<SLAViolation>
  private readonly slaRuleRepository: Repository<SLARule>
  private readonly shipmentRepository: Repository<Shipment>
  private readonly httpService: HttpService

  constructor(
    slaViolationRepository: Repository<SLAViolation>,
    slaRuleRepository: Repository<SLARule>,
    shipmentRepository: Repository<Shipment>,
    httpService: HttpService,
  ) {
    this.slaViolationRepository = slaViolationRepository
    this.slaRuleRepository = slaRuleRepository
    this.shipmentRepository = shipmentRepository
    this.httpService = httpService
  }

  /**
   * Execute all actions for an SLA violation
   */
  async executeViolationActions(violationId: string): Promise<ActionExecutionResult[]> {
    const violation = await this.slaViolationRepository.findOne({
      where: { id: violationId },
      relations: ["rule", "shipment"],
    })

    if (!violation) {
      throw new Error(`SLA violation not found: ${violationId}`)
    }

    // Update violation status to processing
    violation.status = ViolationStatus.PROCESSING
    await this.slaViolationRepository.save(violation)

    const results: ActionExecutionResult[] = []
    const actionsTaken: any = {}

    try {
      // Execute email alerts
      if (violation.rule.actions.alertEmails?.length) {
        const emailResult = await this.sendEmailAlerts(violation)
        results.push(emailResult)
        actionsTaken.alertsSent = violation.rule.actions.alertEmails
      }

      // Execute webhook calls
      if (violation.rule.actions.webhookUrl) {
        const webhookResult = await this.callWebhook(violation)
        results.push(webhookResult)
        actionsTaken.webhooksCalled = [violation.rule.actions.webhookUrl]
      }

      // Execute smart contract calls
      if (violation.rule.actions.smartContractAddress) {
        const contractResult = await this.triggerSmartContract(violation)
        results.push(contractResult)
        actionsTaken.contractsTriggered = [violation.rule.actions.smartContractAddress]
      }

      // Apply penalties
      if (violation.rule.actions.penaltyAmount) {
        const penaltyResult = await this.applyPenalty(violation)
        results.push(penaltyResult)
        actionsTaken.penalties = [violation.rule.actions.penaltyAmount]
      }

      // Update violation with actions taken
      violation.actionsTaken = actionsTaken
      violation.status = ViolationStatus.RESOLVED
      await this.slaViolationRepository.save(violation)

      this.logger.log(`Successfully executed ${results.length} actions for violation ${violationId}`)
    } catch (error) {
      this.logger.error(`Error executing actions for violation ${violationId}`, error)
      violation.status = ViolationStatus.ESCALATED
      violation.notes = `Action execution failed: ${error.message}`
      await this.slaViolationRepository.save(violation)
    }

    return results
  }

  /**
   * Send email alerts for SLA violation
   */
  private async sendEmailAlerts(violation: SLAViolation): Promise<ActionExecutionResult> {
    try {
      // Simulate email sending (replace with actual email service)
      const emailData = {
        to: violation.rule.actions.alertEmails,
        subject: `SLA Violation Alert - ${violation.rule.name}`,
        body: this.generateEmailBody(violation),
        timestamp: new Date(),
      }

      this.logger.log(`Email alert sent for violation ${violation.id}`, emailData)

      return {
        actionType: "email_alert",
        success: true,
        message: `Email alerts sent to ${violation.rule.actions.alertEmails?.join(", ")}`,
        timestamp: new Date(),
        details: emailData,
      }
    } catch (error) {
      return {
        actionType: "email_alert",
        success: false,
        message: `Failed to send email alerts: ${error.message}`,
        timestamp: new Date(),
      }
    }
  }

  /**
   * Call webhook for SLA violation
   */
  private async callWebhook(violation: SLAViolation): Promise<ActionExecutionResult> {
    try {
      const webhookPayload = {
        violationId: violation.id,
        shipmentId: violation.shipmentId,
        trackingNumber: violation.shipment.trackingNumber,
        ruleName: violation.rule.name,
        ruleType: violation.rule.ruleType,
        priority: violation.rule.priority,
        delayMinutes: violation.delayMinutes,
        detectedAt: violation.detectedAt,
        shipmentDetails: {
          origin: violation.shipment.origin,
          destination: violation.shipment.destination,
          status: violation.shipment.status,
          expectedDeliveryAt: violation.shipment.expectedDeliveryAt,
        },
      }

      // Simulate webhook call (replace with actual HTTP call)
      this.logger.log(`Webhook called for violation ${violation.id}`, {
        url: violation.rule.actions.webhookUrl,
        payload: webhookPayload,
      })

      // Uncomment for actual webhook call:
      // const response = await this.httpService.post(
      //   violation.rule.actions.webhookUrl!,
      //   webhookPayload
      // ).toPromise()

      return {
        actionType: "webhook",
        success: true,
        message: `Webhook called successfully: ${violation.rule.actions.webhookUrl}`,
        timestamp: new Date(),
        details: webhookPayload,
      }
    } catch (error) {
      return {
        actionType: "webhook",
        success: false,
        message: `Failed to call webhook: ${error.message}`,
        timestamp: new Date(),
      }
    }
  }

  /**
   * Trigger smart contract for SLA violation
   */
  private async triggerSmartContract(violation: SLAViolation): Promise<ActionExecutionResult> {
    try {
      // Simulate smart contract interaction (replace with actual blockchain call)
      const contractData = {
        contractAddress: violation.rule.actions.smartContractAddress,
        function: "reportSLAViolation",
        parameters: {
          shipmentId: violation.shipmentId,
          violationId: violation.id,
          delayMinutes: violation.delayMinutes,
          penaltyAmount: violation.rule.actions.penaltyAmount || 0,
        },
        timestamp: new Date(),
      }

      this.logger.log(`Smart contract triggered for violation ${violation.id}`, contractData)

      return {
        actionType: "smart_contract",
        success: true,
        message: `Smart contract triggered: ${violation.rule.actions.smartContractAddress}`,
        timestamp: new Date(),
        details: contractData,
      }
    } catch (error) {
      return {
        actionType: "smart_contract",
        success: false,
        message: `Failed to trigger smart contract: ${error.message}`,
        timestamp: new Date(),
      }
    }
  }

  /**
   * Apply penalty for SLA violation
   */
  private async applyPenalty(violation: SLAViolation): Promise<ActionExecutionResult> {
    try {
      // Simulate penalty application (replace with actual penalty logic)
      const penaltyData = {
        customerId: violation.shipment.customerId,
        shipmentId: violation.shipmentId,
        amount: violation.rule.actions.penaltyAmount,
        reason: `SLA violation: ${violation.rule.name}`,
        delayMinutes: violation.delayMinutes,
        timestamp: new Date(),
      }

      this.logger.log(`Penalty applied for violation ${violation.id}`, penaltyData)

      return {
        actionType: "penalty",
        success: true,
        message: `Penalty of $${violation.rule.actions.penaltyAmount} applied`,
        timestamp: new Date(),
        details: penaltyData,
      }
    } catch (error) {
      return {
        actionType: "penalty",
        success: false,
        message: `Failed to apply penalty: ${error.message}`,
        timestamp: new Date(),
      }
    }
  }

  /**
   * Generate email body for SLA violation alert
   */
  private generateEmailBody(violation: SLAViolation): string {
    return `
      SLA Violation Alert
      
      Rule: ${violation.rule.name}
      Type: ${violation.rule.ruleType}
      Priority: ${violation.rule.priority}
      
      Shipment Details:
      - Tracking Number: ${violation.shipment.trackingNumber}
      - Origin: ${violation.shipment.origin}
      - Destination: ${violation.shipment.destination}
      - Status: ${violation.shipment.status}
      - Expected Delivery: ${violation.shipment.expectedDeliveryAt}
      
      Violation Details:
      - Delay: ${violation.delayMinutes} minutes
      - Detected At: ${violation.detectedAt}
      
      Please take immediate action to resolve this SLA violation.
    `
  }

  /**
   * Manually trigger actions for a violation
   */
  async retriggerActions(violationId: string): Promise<ActionExecutionResult[]> {
    const violation = await this.slaViolationRepository.findOne({
      where: { id: violationId },
      relations: ["rule", "shipment"],
    })

    if (!violation) {
      throw new Error(`SLA violation not found: ${violationId}`)
    }

    this.logger.log(`Manually retriggering actions for violation ${violationId}`)
    return this.executeViolationActions(violationId)
  }
}
