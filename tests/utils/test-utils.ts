// Test utilities and helper functions
export class TestUtils {
  static generateRandomString(length: number = 10): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  static generateRandomEmail(): string {
    return `test${this.generateRandomString(8)}@example.com`;
  }

  static async wait(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  static formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }
}
