// Validation utilities to ensure data integrity
export class Validation {
  static isValidString(value: any): boolean {
    return typeof value === 'string' && value.trim().length > 0
  }

  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  static isValidUser(user: any): boolean {
    return user && 
           typeof user === 'object' && 
           this.isValidString(user.id) && 
           this.isValidString(user.fullName) && 
           this.isValidEmail(user.email)
  }

  static sanitizeString(value: any): string {
    if (!this.isValidString(value)) {
      return ""
    }
    return String(value).trim()
  }

  static safeDateParse(dateString: any): Date {
    try {
      if (!dateString) return new Date()
      const date = new Date(dateString)
      return isNaN(date.getTime()) ? new Date() : date
    } catch {
      return new Date()
    }
  }

  static safeNumberParse(value: any, fallback: number = 0): number {
    try {
      const num = Number(value)
      return isNaN(num) ? fallback : num
    } catch {
      return fallback
    }
  }
}


