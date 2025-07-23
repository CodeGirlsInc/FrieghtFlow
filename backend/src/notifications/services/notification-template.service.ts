import { Injectable, NotFoundException, ConflictException } from "@nestjs/common"
import type { Repository } from "typeorm"
import type { NotificationTemplate } from "../entities/notification-template.entity"
import type { CreateNotificationTemplateDto } from "../dto/create-template.dto"
import type { NotificationType, NotificationChannel } from "../entities/notification.entity"

@Injectable()
export class NotificationTemplateService {
  constructor(private templateRepository: Repository<NotificationTemplate>) {}

  async create(createTemplateDto: CreateNotificationTemplateDto): Promise<NotificationTemplate> {
    const existingTemplate = await this.templateRepository.findOne({
      where: { name: createTemplateDto.name },
    })

    if (existingTemplate) {
      throw new ConflictException(`Template with name ${createTemplateDto.name} already exists`)
    }

    const template = this.templateRepository.create(createTemplateDto)
    return this.templateRepository.save(template)
  }

  async findAll(): Promise<NotificationTemplate[]> {
    return this.templateRepository.find({
      where: { isActive: true },
      order: { createdAt: "DESC" },
    })
  }

  async findByTypeAndChannel(type: NotificationType, channel: NotificationChannel): Promise<NotificationTemplate[]> {
    return this.templateRepository.find({
      where: { type, channel, isActive: true },
      order: { createdAt: "DESC" },
    })
  }

  async findByName(name: string): Promise<NotificationTemplate> {
    const template = await this.templateRepository.findOne({
      where: { name, isActive: true },
    })

    if (!template) {
      throw new NotFoundException(`Template with name ${name} not found`)
    }

    return template
  }

  async update(id: string, updateData: Partial<CreateNotificationTemplateDto>): Promise<NotificationTemplate> {
    const template = await this.templateRepository.findOne({ where: { id } })

    if (!template) {
      throw new NotFoundException(`Template with ID ${id} not found`)
    }

    Object.assign(template, updateData)
    return this.templateRepository.save(template)
  }

  async remove(id: string): Promise<void> {
    const template = await this.templateRepository.findOne({ where: { id } })

    if (!template) {
      throw new NotFoundException(`Template with ID ${id} not found`)
    }

    await this.templateRepository.remove(template)
  }

  async processTemplate(
    templateName: string,
    data: Record<string, any>,
  ): Promise<{ subject: string; message: string; htmlMessage?: string }> {
    const template = await this.findByName(templateName)

    let subject = template.subject
    let message = template.template
    let htmlMessage = template.htmlTemplate

    // Replace variables in template
    if (template.variables) {
      for (const variable of template.variables) {
        const value = data[variable] || template.defaultData?.[variable] || `{{${variable}}}`
        const regex = new RegExp(`{{${variable}}}`, "g")

        subject = subject.replace(regex, String(value))
        message = message.replace(regex, String(value))

        if (htmlMessage) {
          htmlMessage = htmlMessage.replace(regex, String(value))
        }
      }
    }

    return { subject, message, htmlMessage }
  }

  async getTemplateVariables(templateName: string): Promise<string[]> {
    const template = await this.findByName(templateName)
    return template.variables || []
  }

  async validateTemplate(
    templateName: string,
    data: Record<string, any>,
  ): Promise<{ valid: boolean; missingVariables: string[] }> {
    const template = await this.findByName(templateName)
    const requiredVariables = template.variables || []
    const missingVariables = requiredVariables.filter(
      (variable) => !(variable in data) && !(variable in (template.defaultData || {})),
    )

    return {
      valid: missingVariables.length === 0,
      missingVariables,
    }
  }
}
