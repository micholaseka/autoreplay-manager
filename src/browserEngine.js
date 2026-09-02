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

    return context.newPage();
  }

  async checkAccount(account) {
    try {
      const page = await this.getPage(account);
      const result = await this.watcher.check(page, account);
      await this.notifyIfActionable(account.id, result);
      return result;
    } catch (error) {
      console.error(
        `[browserEngine] Akun ${account.id} gagal dicek: ${error.message}`,
      );
      return { status: "error", accountId: account.id, error: error.message };
    }
  }

  async notifyIfActionable(accountId, result) {
    const isError = result.status === "error";
    const isActionable = isError || result.unreadCount > 0;
    const signature = `result.status:{result.status}:result.status:{result.unreadCount}`;

    if (!isActionable || !this.notifier) return;
    if (!isError && this.lastNotified.get(accountId) === signature) return; // dedup cuma untuk inbox normal
    // ...

    const sent = await this.notifier.notifyInbox(result);
    if (sent) this.lastNotified.set(accountId, signature);
  }

  async runCycle(accounts) {
    const results = [];
    for (const account of accounts) {
      results.push(await this.checkAccount(account));
      // jeda acak antar akun biar gak kelihatan robot
      const jeda = 2000 + Math.random() * 4000;
      await new Promise((r) => setTimeout(r, jeda));
    }
    return results;
  }

  async close() {
    await Promise.all(
      [...this.contexts.values()].map((context) => context.close()),
    );
    this.contexts.clear();
  }
}

module.exports = { BrowserEngine };
