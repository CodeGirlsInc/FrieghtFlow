import { Injectable, Logger } from "@nestjs/common"
import type { Repository } from "typeorm"
import type { EmailTemplateEntity } from "../entities/email-template.entity"
import { DEFAULT_EMAIL_TEMPLATES } from "../templates/default-templates"
import type { LoggerService } from "../../logger/services/logger.service"

@Injectable()
export class TemplateSeederService {
  private readonly logger = new Logger(TemplateSeederService.name)

  constructor(
    private templateRepository: Repository<EmailTemplateEntity>,
    private loggerService: LoggerService,
  ) {}

  async seedDefaultTemplates(): Promise<void> {
    try {
      this.logger.log("Starting email template seeding...")

      let createdCount = 0
      let updatedCount = 0
      let skippedCount = 0

      for (const templateData of DEFAULT_EMAIL_TEMPLATES) {
        const existingTemplate = await this.templateRepository.findOne({
          where: { name: templateData.name },
        })

        if (existingTemplate) {
          // Update existing template if it's different
          const hasChanges =
            existingTemplate.subject !== templateData.subject ||
            existingTemplate.htmlContent !== templateData.htmlContent ||
            existingTemplate.textContent !== templateData.textContent ||
            JSON.stringify(existingTemplate.variables) !== JSON.stringify(templateData.variables)

          if (hasChanges) {
            Object.assign(existingTemplate, {
              ...templateData,
              updatedAt: new Date(),
            })
            await this.templateRepository.save(existingTemplate)
            updatedCount++
            this.logger.log(`Updated template: ${templateData.name}`)
          } else {
            skippedCount++
            this.logger.debug(`Skipped template (no changes): ${templateData.name}`)
          }
        } else {
          // Create new template
          const newTemplate = this.templateRepository.create({
            ...templateData,
            isActive: true,
            version: "1.0.0",
            description: `Default ${templateData.category} template`,
            createdBy: "system",
          })
          await this.templateRepository.save(newTemplate)
          createdCount++
          this.logger.log(`Created template: ${templateData.name}`)
        }
      }

      this.loggerService.info("Email template seeding completed", {
        module: "TemplateSeederService",
        operation: "seedDefaultTemplates",
        created: createdCount,
        updated: updatedCount,
        skipped: skippedCount,
        total: DEFAULT_EMAIL_TEMPLATES.length,
      })

      this.logger.log(
        `Template seeding completed: ${createdCount} created, ${updatedCount} updated, ${skippedCount} skipped`,
      )
    } catch (error) {
      this.loggerService.error("Failed to seed email templates", error, {
        module: "TemplateSeederService",
        operation: "seedDefaultTemplates",
      })
      throw error
    }
  }

  async validateAllTemplates(): Promise<{ valid: number; invalid: number; errors: string[] }> {
    const templates = await this.templateRepository.find({ where: { isActive: true } })
    const errors: string[] = []
    let validCount = 0
    let invalidCount = 0

    for (const template of templates) {
      try {
        // Basic validation
        if (!template.subject || !template.htmlContent || !template.textContent) {
          errors.push(`Template ${template.name}: Missing required content`)
          invalidCount++
          continue
        }

        // Check for required variables
        const htmlVariables = this.extractVariables(template.htmlContent)
        const textVariables = this.extractVariables(template.textContent)
        const subjectVariables = this.extractVariables(template.subject)
        const allVariables = [...new Set([...htmlVariables, ...textVariables, ...subjectVariables])]

        const missingVariables = template.variables.filter((v) => !allVariables.includes(v))
        if (missingVariables.length > 0) {
          errors.push(`Template ${template.name}: Declared variables not used: ${missingVariables.join(", ")}`)
        }

        const undeclaredVariables = allVariables.filter((v) => !template.variables.includes(v))
        if (undeclaredVariables.length > 0) {
          errors.push(`Template ${template.name}: Undeclared variables used: ${undeclaredVariables.join(", ")}`)
        }

        if (missingVariables.length === 0 && undeclaredVariables.length === 0) {
          validCount++
        } else {
          invalidCount++
        }
      } catch (error) {
        errors.push(`Template ${template.name}: Validation error - ${error.message}`)
        invalidCount++
      }
    }

    this.loggerService.info("Template validation completed", {
      module: "TemplateSeederService",
      operation: "validateAllTemplates",
      valid: validCount,
      invalid: invalidCount,
      totalErrors: errors.length,
    })

    return { valid: validCount, invalid: invalidCount, errors }
  }

  private extractVariables(content: string): string[] {
    const variableRegex = /\{\{\s*([^}]+)\s*\}\}/g
    const variables: string[] = []
    let match

    while ((match = variableRegex.exec(content)) !== null) {
      const variable = match[1].split(".")[0].split(" ")[0] // Handle nested properties and helpers
      if (!variables.includes(variable) && !this.isHelper(variable)) {
        variables.push(variable)
      }
    }

    return variables
  }

  private isHelper(variable: string): boolean {
    const helpers = ["formatDate", "formatCurrency", "ifEquals", "truncate", "capitalize", "trackingUrl"]
    return helpers.includes(variable)
  }
}
