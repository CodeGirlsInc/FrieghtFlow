import { Injectable, NotFoundException, Logger } from "@nestjs/common"
import type { Repository } from "typeorm"
import type { EmailTemplateEntity } from "../entities/email-template.entity"
import type { EmailTemplate, EmailCategory } from "../interfaces/email.interface"
import * as Handlebars from "handlebars"
import type { Cache } from "cache-manager"
import type { HandlebarsTemplateDelegate } from "handlebars"

@Injectable()
export class TemplateService {
  private readonly logger = new Logger(TemplateService.name)
  private compiledTemplates = new Map<string, HandlebarsTemplateDelegate>()

  constructor(
    private templateRepository: Repository<EmailTemplateEntity>,
    private cacheManager: Cache,
  ) {
    this.registerHelpers()
  }

  async createTemplate(templateData: Partial<EmailTemplate>): Promise<EmailTemplate> {
    const template = this.templateRepository.create(templateData)
    const savedTemplate = await this.templateRepository.save(template)

    // Clear cache for this template
    await this.cacheManager.del(`template:${savedTemplate.id}`)

    this.logger.log(`Created email template: ${savedTemplate.name}`)
    return savedTemplate
  }

  async updateTemplate(id: string, templateData: Partial<EmailTemplate>): Promise<EmailTemplate> {
    const template = await this.templateRepository.findOne({ where: { id } })
    if (!template) {
      throw new NotFoundException(`Template with ID ${id} not found`)
    }

    Object.assign(template, templateData)
    const updatedTemplate = await this.templateRepository.save(template)

    // Clear cache
    await this.cacheManager.del(`template:${id}`)
    this.compiledTemplates.delete(id)

    this.logger.log(`Updated email template: ${updatedTemplate.name}`)
    return updatedTemplate
  }

  async getTemplate(id: string): Promise<EmailTemplate> {
    // Try cache first
    const cached = await this.cacheManager.get<EmailTemplate>(`template:${id}`)
    if (cached) {
      return cached
    }

    const template = await this.templateRepository.findOne({
      where: { id, isActive: true },
    })

    if (!template) {
      throw new NotFoundException(`Template with ID ${id} not found`)
    }

    // Cache the template
    await this.cacheManager.set(`template:${id}`, template, 3600) // 1 hour TTL

    return template
  }

  async getTemplateByName(name: string): Promise<EmailTemplate> {
    const template = await this.templateRepository.findOne({
      where: { name, isActive: true },
    })

    if (!template) {
      throw new NotFoundException(`Template with name ${name} not found`)
    }

    return template
  }

  async getTemplatesByCategory(category: EmailCategory): Promise<EmailTemplate[]> {
    return this.templateRepository.find({
      where: { category, isActive: true },
      order: { createdAt: "DESC" },
    })
  }

  async renderTemplate(
    templateId: string,
    data: Record<string, any>,
  ): Promise<{ subject: string; htmlContent: string; textContent: string }> {
    const template = await this.getTemplate(templateId)

    // Get or compile template
    let compiledHtml = this.compiledTemplates.get(`${templateId}:html`)
    let compiledText = this.compiledTemplates.get(`${templateId}:text`)
    let compiledSubject = this.compiledTemplates.get(`${templateId}:subject`)

    if (!compiledHtml) {
      compiledHtml = Handlebars.compile(template.htmlContent)
      this.compiledTemplates.set(`${templateId}:html`, compiledHtml)
    }

    if (!compiledText) {
      compiledText = Handlebars.compile(template.textContent)
      this.compiledTemplates.set(`${templateId}:text`, compiledText)
    }

    if (!compiledSubject) {
      compiledSubject = Handlebars.compile(template.subject)
      this.compiledTemplates.set(`${templateId}:subject`, compiledSubject)
    }

    // Render with data
    const renderedData = this.enrichTemplateData(data)

    return {
      subject: compiledSubject(renderedData),
      htmlContent: compiledHtml(renderedData),
      textContent: compiledText(renderedData),
    }
  }

  async deleteTemplate(id: string): Promise<void> {
    const result = await this.templateRepository.delete(id)
    if (result.affected === 0) {
      throw new NotFoundException(`Template with ID ${id} not found`)
    }

    // Clear cache
    await this.cacheManager.del(`template:${id}`)
    this.compiledTemplates.delete(`${id}:html`)
    this.compiledTemplates.delete(`${id}:text`)
    this.compiledTemplates.delete(`${id}:subject`)

    this.logger.log(`Deleted email template: ${id}`)
  }

  async validateTemplate(
    htmlContent: string,
    textContent: string,
    variables: string[],
  ): Promise<{ isValid: boolean; errors: string[] }> {
    const errors: string[] = []

    try {
      // Compile templates to check for syntax errors
      Handlebars.compile(htmlContent)
      Handlebars.compile(textContent)
    } catch (error) {
      errors.push(`Template compilation error: ${error.message}`)
    }

    // Check for required variables
    const htmlVariables = this.extractVariables(htmlContent)
    const textVariables = this.extractVariables(textContent)
    const allVariables = [...new Set([...htmlVariables, ...textVariables])]

    const missingVariables = variables.filter((v) => !allVariables.includes(v))
    if (missingVariables.length > 0) {
      errors.push(`Missing variables in template: ${missingVariables.join(", ")}`)
    }

    return {
      isValid: errors.length === 0,
      errors,
    }
  }

  private extractVariables(content: string): string[] {
    const variableRegex = /\{\{\s*([^}]+)\s*\}\}/g
    const variables: string[] = []
    let match

    while ((match = variableRegex.exec(content)) !== null) {
      const variable = match[1].split(".")[0].split(" ")[0] // Handle nested properties and helpers
      if (!variables.includes(variable)) {
        variables.push(variable)
      }
    }

    return variables
  }

  private enrichTemplateData(data: Record<string, any>): Record<string, any> {
    return {
      ...data,
      currentYear: new Date().getFullYear(),
      currentDate: new Date().toLocaleDateString(),
      companyName: "FreightFlow",
      supportEmail: "support@freightflow.com",
      websiteUrl: "https://freightflow.com",
      unsubscribeUrl: data.unsubscribeUrl || "https://freightflow.com/unsubscribe",
      // Add more global variables as needed
    }
  }

  private registerHelpers(): void {
    // Date formatting helper
    Handlebars.registerHelper("formatDate", (date: Date, format: string) => {
      if (!date) return ""

      const options: Intl.DateTimeFormatOptions = {}
      switch (format) {
        case "short":
          options.dateStyle = "short"
          break
        case "medium":
          options.dateStyle = "medium"
          break
        case "long":
          options.dateStyle = "long"
          break
        case "full":
          options.dateStyle = "full"
          break
        default:
          options.dateStyle = "medium"
      }

      return new Date(date).toLocaleDateString("en-US", options)
    })

    // Currency formatting helper
    Handlebars.registerHelper("formatCurrency", (amount: number, currency = "USD") => {
      if (typeof amount !== "number") return amount

      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: currency,
      }).format(amount)
    })

    // Conditional helper
    Handlebars.registerHelper("ifEquals", function (arg1, arg2, options) {
      return arg1 == arg2 ? options.fn(this) : options.inverse(this)
    })

    // Truncate helper
    Handlebars.registerHelper("truncate", (str: string, length: number) => {
      if (!str || str.length <= length) return str
      return str.substring(0, length) + "..."
    })

    // Capitalize helper
    Handlebars.registerHelper("capitalize", (str: string) => {
      if (!str) return ""
      return str.charAt(0).toUpperCase() + str.slice(1)
    })

    // URL helper for tracking links
    Handlebars.registerHelper("trackingUrl", (url: string, messageId: string) => {
      if (!url || !messageId) return url
      const trackingUrl = new URL(url)
      trackingUrl.searchParams.set("utm_source", "freightflow")
      trackingUrl.searchParams.set("utm_medium", "email")
      trackingUrl.searchParams.set("message_id", messageId)
      return trackingUrl.toString()
    })
  }
}
