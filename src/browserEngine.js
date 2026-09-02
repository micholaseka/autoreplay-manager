const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");
const config = require("./config");

class BrowserEngine {
  constructor({
    watcher,
    notifier,
    profilesPath = config.paths.profiles,
    headless = process.env.HEADLESS === "true",
  } = {}) {
    if (!watcher) throw new Error("[browserEngine] watcher wajib diisi.");

    this.watcher = watcher;
    this.notifier = notifier;
    this.profilesPath = profilesPath;
    this.headless = headless;
    this.contexts = new Map();
    this.lastNotified = new Map();
  }

  async getPage(account) {
    let context = this.contexts.get(account.id);

    if (!context) {
      const profileDir = path.join(this.profilesPath, account.id);
      fs.mkdirSync(profileDir, { recursive: true });
      context = await chromium.launchPersistentContext(profileDir, {
        headless: this.headless,
        viewport: null,
        args: ["--start-maximized"],
      });
      this.contexts.set(account.id, context);
    }

    return context.pages()[0] || context.newPage();
  }

  async checkAccount(account) {
    try {
      const page = await this.getPage(account);
      const result = await this.watcher.check(page, account);
      await this.notifyIfActionable(account.id, result);
      return result;
    } catch (error) {
      console.error(`[browserEngine] Akun ${account.id} gagal dicek: ${error.message}`);
      return { status: "error", accountId: account.id, error: error.message };
    }
  }

  async notifyIfActionable(accountId, result) {
    const isActionable = result.status !== "ok" || result.unreadCount > 0;
    const signature = `${result.status}:${result.unreadCount}`;

    if (!isActionable || !this.notifier || this.lastNotified.get(accountId) === signature) {
      return;
    }

    const sent = await this.notifier.notifyInbox(result);
    if (sent) this.lastNotified.set(accountId, signature);
  }

  async runCycle(accounts) {
    return Promise.all(accounts.map((account) => this.checkAccount(account)));
  }

  async close() {
    await Promise.all([...this.contexts.values()].map((context) => context.close()));
    this.contexts.clear();
  }
}

module.exports = { BrowserEngine };
