import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';
import { CONFIG } from './config.js';

export class BrowserManager {
  constructor() {
    this.context = null;
    this.accountId = null;
    this.profilePath = null;
  }

  resolveProfilePath(profile) {
    const raw = String(profile);
    return path.isAbsolute(raw) ? raw : path.resolve(CONFIG.chrome.profilesRoot, raw);
  }

  async launchProfile(accountOrProfile) {
    if (this.context) throw new Error(`Browser masih aktif untuk akun ${this.accountId}.`);

    const account = typeof accountOrProfile === 'string'
      ? { id: accountOrProfile, profile: accountOrProfile }
      : accountOrProfile;

    if (!account?.profile) throw new Error('Profile akun tidak ditemukan.');

    const profilePath = this.resolveProfilePath(account.profile);
    fs.mkdirSync(profilePath, { recursive: true });

    const launchOptions = { headless: false, timeout: 60000 };
    if (CONFIG.chrome.executablePath) launchOptions.executablePath = CONFIG.chrome.executablePath;

    console.log('=== BROWSER MANAGER ===');
    console.log(`Account : ${account.id ?? account.profile}`);
    console.log(`Profile : ${profilePath}`);

    this.context = await chromium.launchPersistentContext(profilePath, launchOptions);
    this.accountId = account.id ?? account.profile;
    this.profilePath = profilePath;
    return this.context;
  }

  async close() {
    if (!this.context) return;
    try { await this.context.close(); }
    finally {
      this.context = null;
      this.accountId = null;
      this.profilePath = null;
    }
  }
}
