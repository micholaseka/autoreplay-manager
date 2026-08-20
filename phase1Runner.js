import { AccountManager } from './accountManager.js';
import { BrowserManager } from './browserManager.js';
import { InboxService } from './inboxService.js';
import { CONFIG } from './config.js';

async function run() {
  const accountManager = new AccountManager();
  const browserManager = new BrowserManager();
  accountManager.loadAccounts();

  const accounts = accountManager.getEnabledAccounts().slice(0, CONFIG.phase1.maxAccountsPerCycle);
  if (accounts.length === 0) throw new Error('Tidak ada akun aktif di config/accounts.json.');

  console.log('========================================');
  console.log('       FB MARKETPLACE - PHASE 1');
  console.log('========================================');
  console.log(`Akun aktif yang diproses: ${accounts.length}`);
  console.log('Mode: single worker');
  console.log('Action: scan inbox only (TIDAK mengirim pesan)');

  for (const account of accounts) {
    console.log(`\n[ACCOUNT] ${account.id} | ${account.name} | ${account.profile}`);
    try {
      const context = await browserManager.launchProfile(account);
      const inbox = new InboxService(context);
      console.log('[1/3] Membuka Marketplace Inbox...');
      await inbox.openMarketplaceInbox();
      console.log('[2/3] Mendeteksi pesan unread...');
      const unread = await inbox.scanUnreadMessages();
      console.log(`[3/3] Selesai. Unread terdeteksi: ${unread.length}`);

      for (const message of unread) {
        console.log(`  [UNREAD] ${message.sender}`);
        console.log(`  Text: ${message.text.slice(0, 500)}`);
        console.log(`  URL : ${message.href}`);
      }
      accountManager.markSuccess(account.id, unread.length);
    } catch (error) {
      console.error(`[ERROR] Akun ${account.id}: ${error.message}`);
      accountManager.markError(account.id, error);
    } finally {
      await browserManager.close();
    }

    accountManager.saveAccounts();
    await new Promise(resolve => setTimeout(resolve, CONFIG.phase1.accountCooldownMs));
  }

  console.log('\nPHASE 1 SELESAI');
}

run().catch(error => {
  console.error('FATAL:', error.message);
  process.exitCode = 1;
});
