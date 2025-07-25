import { Injectable } from "@nestjs/common"
import * as dns from "dns"
import { promisify } from "util"

@Injectable()
export class EmailValidatorUtil {
  private readonly resolveMx = promisify(dns.resolveMx)
  private readonly disposableEmailDomains = new Set([
    "10minutemail.com",
    "guerrillamail.com",
    "mailinator.com",
    "tempmail.org",
    "yopmail.com",
    "throwaway.email",
    "temp-mail.org",
    "fakeinbox.com",
  ])

  /**
   * Validates email format using RFC 5322 compliant regex
   */
  isValidFormat(email: string): boolean {
    const emailRegex =
      /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
    return emailRegex.test(email)
  }

  /**
   * Checks if email domain has valid MX records
   */
  async hasValidMxRecord(email: string): Promise<boolean> {
    try {
      const domain = email.split("@")[1]
      if (!domain) return false

      const mxRecords = await this.resolveMx(domain)
      return mxRecords && mxRecords.length > 0
    } catch (error) {
      return false
    }
  }

  /**
   * Checks if email is from a disposable email provider
   */
  isDisposableEmail(email: string): boolean {
    const domain = email.split("@")[1]?.toLowerCase()
    return domain ? this.disposableEmailDomains.has(domain) : false
  }

  /**
   * Checks if email is from a role-based account (info@, admin@, etc.)
   */
  isRoleBasedEmail(email: string): boolean {
    const localPart = email.split("@")[0]?.toLowerCase()
    const roleBasedPrefixes = [
      "admin",
      "administrator",
      "info",
      "support",
      "help",
      "sales",
      "marketing",
      "noreply",
      "no-reply",
      "postmaster",
      "webmaster",
      "hostmaster",
      "abuse",
      "security",
      "privacy",
      "legal",
      "billing",
      "accounts",
      "contact",
    ]

    return roleBasedPrefixes.some((prefix) => localPart === prefix)
  }

  /**
   * Normalizes email address (lowercase, trim)
   */
  normalizeEmail(email: string): string {
    return email.toLowerCase().trim()
  }

  /**
   * Comprehensive email validation
   */
  async validateEmail(
    email: string,
    options: {
      checkMx?: boolean
      allowDisposable?: boolean
      allowRoleBased?: boolean
    } = {},
  ): Promise<{
    isValid: boolean
    errors: string[]
    normalized: string
  }> {
    const errors: string[] = []
    const normalized = this.normalizeEmail(email)

    // Format validation
    if (!this.isValidFormat(normalized)) {
      errors.push("Invalid email format")
    }

    // Disposable email check
    if (!options.allowDisposable && this.isDisposableEmail(normalized)) {
      errors.push("Disposable email addresses are not allowed")
    }

    // Role-based email check
    if (!options.allowRoleBased && this.isRoleBasedEmail(normalized)) {
      errors.push("Role-based email addresses are not allowed")
    }

    // MX record check
    if (options.checkMx && errors.length === 0) {
      const hasValidMx = await this.hasValidMxRecord(normalized)
      if (!hasValidMx) {
        errors.push("Email domain does not have valid MX records")
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      normalized,
    }
  }

  /**
   * Extracts domain from email address
   */
  extractDomain(email: string): string | null {
    const parts = email.split("@")
    return parts.length === 2 ? parts[1].toLowerCase() : null
  }

  /**
   * Checks if two emails are the same after normalization
   */
  areEmailsEqual(email1: string, email2: string): boolean {
    return this.normalizeEmail(email1) === this.normalizeEmail(email2)
  }

  /**
   * Generates email suggestions for common typos
   */
  suggestCorrections(email: string): string[] {
    const suggestions: string[] = []
    const [localPart, domain] = email.split("@")

    if (!domain) return suggestions

    // Common domain typos
    const domainCorrections: Record<string, string> = {
      "gmail.co": "gmail.com",
      "gmail.cm": "gmail.com",
      "gmai.com": "gmail.com",
      "gmial.com": "gmail.com",
      "yahoo.co": "yahoo.com",
      "yahoo.cm": "yahoo.com",
      "yaho.com": "yahoo.com",
      "hotmai.com": "hotmail.com",
      "hotmial.com": "hotmail.com",
      "outlook.co": "outlook.com",
    }

    const correctedDomain = domainCorrections[domain.toLowerCase()]
    if (correctedDomain) {
      suggestions.push(`${localPart}@${correctedDomain}`)
    }

    return suggestions
  }
}
