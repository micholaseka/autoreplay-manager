import path from 'node:path';

export const PROJECT_ROOT = process.cwd();
const PROFILES_ROOT = path.join(PROJECT_ROOT, 'profiles');

const CHROME_EXECUTABLE =
  process.env.CHROME_EXECUTABLE ||
  (process.platform === 'win32'
    ? path.join(PROJECT_ROOT, 'GoogleChromePortable64', 'App', 'Chrome-bin', 'chrome.exe')
    : '');

export const CONFIG = {
  projectRoot: PROJECT_ROOT,
  accounts: {
    file: path.join(PROJECT_ROOT, 'config', 'accounts.json')
  },
  chrome: {
    profilesRoot: PROFILES_ROOT,
    executablePath: CHROME_EXECUTABLE
  },
  marketplace: {
    dashboardUrl: 'https://www.facebook.com/marketplace/you/dashboard',
    inboxUrlPrefix: 'https://www.facebook.com/marketplace/inbox/'
  },
  phase1: {
    maxAccountsPerCycle: 5,
    settleDelayMs: 2500,
    accountCooldownMs: 1000,
    pageTimeoutMs: 60000
  }
};
