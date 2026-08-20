import fs from 'node:fs';
import path from 'node:path';
import { CONFIG } from './config.js';

export class AccountManager {
  constructor() {
    this.accountsFile = CONFIG.accounts.file;
    this.accounts = [];
  }

  loadAccounts() {
    if (!fs.existsSync(this.accountsFile)) {
      throw new Error(`File accounts.json tidak ditemukan: ${this.accountsFile}`);
    }

    let data;
    try {
      data = JSON.parse(fs.readFileSync(this.accountsFile, 'utf8'));
    } catch (error) {
      throw new Error(`Gagal membaca accounts.json: ${error.message}`);
    }

    if (!Array.isArray(data.accounts)) {
      throw new Error('Format accounts.json tidak valid. "accounts" harus berupa array.');
    }

    this.accounts = data.accounts.map((account, index) => this.normalizeAccount(account, index));
    this.validateUniqueIds();
    return this.accounts;
  }

  normalizeAccount(account, index) {
    if (!account || typeof account !== 'object') throw new Error(`Account index ${index} tidak valid.`);
    if (!account.id) throw new Error(`Account index ${index} tidak memiliki id.`);
    if (!account.profile) throw new Error(`Account ${account.id} tidak memiliki profile.`);

    return {
      id: String(account.id),
      name: account.name || String(account.id),
      profile: String(account.profile),
      enabled: account.enabled !== false,
      status: account.status || 'unknown',
      lastCheckedAt: account.lastCheckedAt || null,
      lastError: account.lastError || null,
      lastUnreadCount: Number.isInteger(account.lastUnreadCount) ? account.lastUnreadCount : 0
    };
  }

  validateUniqueIds() {
    const seen = new Set();
    for (const account of this.accounts) {
      if (seen.has(account.id)) throw new Error(`ID akun duplikat: ${account.id}`);
      seen.add(account.id);
    }
  }

  getAllAccounts() { return [...this.accounts]; }
  getEnabledAccounts() { return this.accounts.filter(account => account.enabled === true); }
  getAccountById(id) { return this.accounts.find(account => account.id === String(id)); }

  markSuccess(id, unreadCount = 0) {
    const account = this.getAccountById(id);
    if (!account) return;
    account.status = 'ok';
    account.lastCheckedAt = new Date().toISOString();
    account.lastError = null;
    account.lastUnreadCount = unreadCount;
  }

  markError(id, error) {
    const account = this.getAccountById(id);
    if (!account) return;
    account.status = 'error';
    account.lastCheckedAt = new Date().toISOString();
    account.lastError = error instanceof Error ? error.message : String(error);
  }

  saveAccounts() {
    fs.mkdirSync(path.dirname(this.accountsFile), { recursive: true });
    fs.writeFileSync(this.accountsFile, JSON.stringify({ accounts: this.accounts }, null, 2) + '\n', 'utf8');
  }
}
