// Comprehensive error handling utility
export class ErrorHandler {
  static handleSplitError(value: string | null | undefined, fallback: string = "U"): string {
    try {
      if (!value || typeof value !== 'string') {
        return fallback
      }
      return value
        .split(" ")
        .map((n) => n[0])
        .join("")
    } catch (error) {
      console.error("Split error:", error)
      return fallback
    }
  }

  static handleNullValue(value: any, fallback: string = "N/A"): string {
    if (value === null || value === undefined || value === "") {
      return fallback
    }
    return String(value)
  }

  static safeStringOperation(operation: () => string, fallback: string = "N/A"): string {
    try {
      return operation()
    } catch (error) {
      console.error("String operation error:", error)
      return fallback
    }
  }

  static safeNumberOperation(operation: () => number, fallback: number = 0): number {
    try {
      return operation()
    } catch (error) {
      console.error("Number operation error:", error)
      return fallback
    }
  }

  static safeArrayOperation<T>(operation: () => T[], fallback: T[] = []): T[] {
    try {
      return operation()
    } catch (error) {
      console.error("Array operation error:", error)
      return fallback
    }
  }
}


