// Base page class for common functionality
export class BasePage {
  constructor(public page: any) {}

  async navigate(url: string) {
    await this.page.goto(url);
  }

  async waitForElement(selector: string) {
    await this.page.waitForSelector(selector);
  }

  async clickElement(selector: string) {
    await this.page.click(selector);
  }

  async fillInput(selector: string, text: string) {
    await this.page.fill(selector, text);
  }

  async getText(selector: string): Promise<string> {
    return await this.page.textContent(selector);
  }
}
