import { Controller, Post, Get, Put, Delete, Param, Query, HttpStatus, HttpCode } from "@nestjs/common"
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery, ApiParam } from "@nestjs/swagger"
import type { EmailService } from "../services/email.service"
import type { TemplateService } from "../services/template.service"
import type { NotificationService } from "../services/notification.service"
import type {
  SendEmailDto,
  SendBulkEmailDto,
  SendTemplateEmailDto,
  CreateTemplateDto,
  UpdateTemplateDto,
  EmailMetricsQueryDto,
  UnsubscribeDto,
} from "../dto/email.dto"
import { EmailCategory } from "../interfaces/email.interface"
import type { LoggerService } from "../../logger/services/logger.service"

@ApiTags("Email")
@Controller("api/email")
@ApiBearerAuth()
export class EmailController {
  constructor(
    private emailService: EmailService,
    private templateService: TemplateService,
    private notificationService: NotificationService,
    private loggerService: LoggerService,
  ) {}

  @Post("send")
  @ApiOperation({ summary: "Send a single email" })
  @ApiResponse({ status: 201, description: "Email queued successfully" })
  @HttpCode(HttpStatus.CREATED)
  async sendEmail(sendEmailDto: SendEmailDto) {
    const messageId = await this.emailService.sendEmail(sendEmailDto)

    this.loggerService.audit("EMAIL_SENT", "emails", {
      messageId,
      to: sendEmailDto.to,
      category: sendEmailDto.category,
      operation: "send_email",
    })

    return { messageId, status: "queued" }
  }

  @Post("send-bulk")
  @ApiOperation({ summary: "Send bulk emails" })
  @ApiResponse({ status: 201, description: "Bulk emails queued successfully" })
  @HttpCode(HttpStatus.CREATED)
  async sendBulkEmails(sendBulkEmailDto: SendBulkEmailDto) {
    const messageIds = await this.emailService.sendBulkEmails(sendBulkEmailDto.messages)

    this.loggerService.audit("BULK_EMAIL_SENT", "emails", {
      messageIds,
      count: sendBulkEmailDto.messages.length,
      operation: "send_bulk_email",
    })

    return { messageIds, status: "queued", count: messageIds.length }
  }

  @Post("send-template")
  @ApiOperation({ summary: "Send email using template" })
  @ApiResponse({ status: 201, description: "Template email queued successfully" })
  @HttpCode(HttpStatus.CREATED)
  async sendTemplateEmail(sendTemplateEmailDto: SendTemplateEmailDto) {
    const messageId = await this.emailService.sendTemplateEmail(
      sendTemplateEmailDto.templateId,
      sendTemplateEmailDto.to,
      sendTemplateEmailDto.data,
    )

    this.loggerService.audit("TEMPLATE_EMAIL_SENT", "emails", {
      messageId,
      templateId: sendTemplateEmailDto.templateId,
      to: sendTemplateEmailDto.to,
      operation: "send_template_email",
    })

    return { messageId, status: "queued" }
  }

  @Get('status/:messageId')
  @ApiOperation({ summary: 'Get email delivery status' })
  @ApiParam({ name: 'messageId', description: 'Email message ID' })
  @ApiResponse({ status: 200, description: 'Email delivery status' })
  async getDeliveryStatus(@Param('messageId') messageId: string) {
    return await this.emailService.getDeliveryStatus(messageId)
  }

  @Delete('cancel/:messageId')
  @ApiOperation({ summary: 'Cancel scheduled email' })
  @ApiParam({ name: 'messageId', description: 'Email message ID' })
  @ApiResponse({ status: 200, description: 'Email cancellation status' })
  async cancelScheduledEmail(@Param('messageId') messageId: string) {
    const cancelled = await this.emailService.cancelScheduledEmail(messageId)
    
    if (cancelled) {
      this.loggerService.audit('EMAIL_CANCELLED', 'emails', {
        messageId,
        operation: 'cancel_email'
      })
    }
    
    return { cancelled }
  }

  @Get('metrics')
  @ApiOperation({ summary: 'Get email metrics' })
  @ApiQuery({ name: 'startDate', required: false, type: Date })
  @ApiQuery({ name: 'endDate', required: false, type: Date })
  @ApiResponse({ status: 200, description: 'Email metrics' })
  async getMetrics(@Query() query: EmailMetricsQueryDto) {
    return await this.emailService.getMetrics(query.startDate, query.endDate)
  }

  @Post("unsubscribe")
  @ApiOperation({ summary: "Unsubscribe email from category" })
  @ApiResponse({ status: 200, description: "Unsubscribe successful" })
  async unsubscribe(unsubscribeDto: UnsubscribeDto) {
    const success = await this.emailService.unsubscribe(unsubscribeDto.email, unsubscribeDto.category)

    this.loggerService.audit("EMAIL_UNSUBSCRIBE", "email_unsubscribes", {
      email: unsubscribeDto.email,
      category: unsubscribeDto.category,
      operation: "unsubscribe",
    })

    return { success }
  }

  @Get("unsubscribe-status")
  @ApiOperation({ summary: "Check unsubscribe status" })
  @ApiQuery({ name: "email", required: true })
  @ApiQuery({ name: "category", required: false, enum: EmailCategory })
  @ApiResponse({ status: 200, description: "Unsubscribe status" })
  async getUnsubscribeStatus(@Query('email') email: string, @Query('category') category?: EmailCategory) {
    const isUnsubscribed = await this.emailService.isUnsubscribed(email, category)
    return { email, category, isUnsubscribed }
  }

  // Template Management Endpoints
  @Post("templates")
  @ApiOperation({ summary: "Create email template" })
  @ApiResponse({ status: 201, description: "Template created successfully" })
  @HttpCode(HttpStatus.CREATED)
  async createTemplate(createTemplateDto: CreateTemplateDto) {
    const template = await this.templateService.createTemplate(createTemplateDto)

    this.loggerService.audit("TEMPLATE_CREATED", "email_templates", {
      templateId: template.id,
      name: template.name,
      category: template.category,
      operation: "create_template",
    })

    return template
  }

  @Get('templates')
  @ApiOperation({ summary: 'Get email templates' })
  @ApiQuery({ name: 'category', required: false, enum: EmailCategory })
  @ApiResponse({ status: 200, description: 'Email templates' })
  async getTemplates(@Query('category') category?: EmailCategory) {
    if (category) {
      return await this.templateService.getTemplatesByCategory(category)
    }
    // Return all templates logic would go here
    return []
  }

  @Get('templates/:id')
  @ApiOperation({ summary: 'Get email template by ID' })
  @ApiParam({ name: 'id', description: 'Template ID' })
  @ApiResponse({ status: 200, description: 'Email template' })
  async getTemplate(@Param('id') id: string) {
    return await this.templateService.getTemplate(id)
  }

  @Put("templates/:id")
  @ApiOperation({ summary: "Update email template" })
  @ApiParam({ name: "id", description: "Template ID" })
  @ApiResponse({ status: 200, description: "Template updated successfully" })
  async updateTemplate(@Param('id') id: string, updateTemplateDto: UpdateTemplateDto) {
    const template = await this.templateService.updateTemplate(id, updateTemplateDto)

    this.loggerService.audit("TEMPLATE_UPDATED", "email_templates", {
      templateId: id,
      name: template.name,
      operation: "update_template",
    })

    return template
  }

  @Delete('templates/:id')
  @ApiOperation({ summary: 'Delete email template' })
  @ApiParam({ name: 'id', description: 'Template ID' })
  @ApiResponse({ status: 200, description: 'Template deleted successfully' })
  async deleteTemplate(@Param('id') id: string) {
    await this.templateService.deleteTemplate(id)
    
    this.loggerService.audit('TEMPLATE_DELETED', 'email_templates', {
      templateId: id,
      operation: 'delete_template'
    })
    
    return { deleted: true }
  }

  @Post("templates/:id/render")
  @ApiOperation({ summary: "Render email template with data" })
  @ApiParam({ name: "id", description: "Template ID" })
  @ApiResponse({ status: 200, description: "Rendered template" })
  async renderTemplate(@Param('id') id: string, data: Record<string, any>) {
    return await this.templateService.renderTemplate(id, data)
  }

  @Post("templates/validate")
  @ApiOperation({ summary: "Validate email template" })
  @ApiResponse({ status: 200, description: "Template validation result" })
  async validateTemplate(templateData: {
    htmlContent: string
    textContent: string
    variables: string[]
  }) {
    return await this.templateService.validateTemplate(
      templateData.htmlContent,
      templateData.textContent,
      templateData.variables,
    )
  }

  // Notification shortcuts
  @Post("notifications/welcome")
  @ApiOperation({ summary: "Send welcome email" })
  @ApiResponse({ status: 201, description: "Welcome email sent" })
  @HttpCode(HttpStatus.CREATED)
  async sendWelcomeEmail(data: { email: string; userData: any }) {
    const messageId = await this.notificationService.sendWelcomeEmail(data.email, data.userData)
    return { messageId, status: "queued" }
  }

  @Post("notifications/shipment-created")
  @ApiOperation({ summary: "Send shipment created notification" })
  @ApiResponse({ status: 201, description: "Shipment notification sent" })
  @HttpCode(HttpStatus.CREATED)
  async sendShipmentCreated(data: { email: string; shipmentData: any }) {
    const messageId = await this.notificationService.sendShipmentCreated(data.email, data.shipmentData)
    return { messageId, status: "queued" }
  }

  @Post("notifications/payment-received")
  @ApiOperation({ summary: "Send payment received notification" })
  @ApiResponse({ status: 201, description: "Payment notification sent" })
  @HttpCode(HttpStatus.CREATED)
  async sendPaymentReceived(data: { email: string; paymentData: any }) {
    const messageId = await this.notificationService.sendPaymentReceived(data.email, data.paymentData)
    return { messageId, status: "queued" }
  }

  @Post("notifications/transaction-confirmed")
  @ApiOperation({ summary: "Send transaction confirmed notification" })
  @ApiResponse({ status: 201, description: "Transaction notification sent" })
  @HttpCode(HttpStatus.CREATED)
  async sendTransactionConfirmed(data: { email: string; transactionData: any }) {
    const messageId = await this.notificationService.sendTransactionConfirmed(data.email, data.transactionData)
    return { messageId, status: "queued" }
  }
}
