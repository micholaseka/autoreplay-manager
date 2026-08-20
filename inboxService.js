import { CONFIG } from './config.js';

export class InboxService {
  constructor(context) { this.context = context; }

  async getPage() {
    const pages = this.context.pages();
    return pages.length > 0 ? pages[0] : this.context.newPage();
  }

  async openMarketplaceInbox() {
    const page = await this.getPage();
    await page.goto(CONFIG.marketplace.dashboardUrl, {
      waitUntil: 'domcontentloaded',
      timeout: CONFIG.phase1.pageTimeoutMs
    });
    await page.waitForTimeout(CONFIG.phase1.settleDelayMs);

    const inboxLocator = page.locator('a[href*="/marketplace/inbox/"]');
    const linkCount = await inboxLocator.count();
    if (linkCount === 0) throw new Error('Link inbox Marketplace tidak ditemukan di dashboard.');

    await inboxLocator.first().scrollIntoViewIfNeeded();
    await inboxLocator.first().click();
    await page.waitForTimeout(CONFIG.phase1.settleDelayMs);
    return page;
  }

  async scanUnreadMessages() {
    const page = await this.getPage();
    const anchors = page.locator('a[href*="/marketplace/inbox/"]');
    const count = await anchors.count();
    const results = [];

    for (let index = 0; index < count; index += 1) {
      const anchor = anchors.nth(index);
      const href = await anchor.getAttribute('href');
      const text = (await anchor.innerText().catch(() => '')).trim();
      if (!href || !text) continue;

      const unreadSignal = await anchor.evaluate(element => {
        const nodes = [element, element.parentElement, element.parentElement?.parentElement, element.closest('[role="listitem"]')].filter(Boolean);
        return nodes.some(node => {
          const aria = node.getAttribute('aria-label') || '';
          const testId = node.getAttribute('data-testid') || '';
          const className = typeof node.className === 'string' ? node.className : '';
          return /unread|belum\s*dibaca/i.test(`${aria} ${testId} ${className}`);
        });
      });

      if (!unreadSignal) continue;
      results.push({
        sender: text.split('\n')[0]?.trim() || 'Unknown',
        text: text.slice(0, 2000),
        href: new URL(href, page.url()).href
      });
    }
    return results;
  }
}
