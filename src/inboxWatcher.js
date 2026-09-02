const selectors = require("./selectors");

const FACEBOOK_HOME_URL = "https://www.facebook.com/";
const MARKETPLACE_INBOX_URL = "https://www.facebook.com/marketplace/inbox/";
const LOGIN_URL_PATTERN = /\/login|checkpoint/i;
const REDIRECT_LOOP_CODE = "ERR_TOO_MANY_REDIRECTS";
const TIME_LINE_PATTERN = /\b(\d{1,2}[:.]\d{2}|hari ini|kemarin|today|yesterday|sen|sel|rab|kam|jum|sab|min|mon|tue|wed|thu|fri|sat|sun|\d{1,2}\s+(jan|feb|mar|apr|mei|jun|jul|agu|sep|okt|nov|des))/i;

function accountName(account) {
  return account.nama || account.username || account.id;
}

function isRedirectLoop(error) {
  return error.message.includes(REDIRECT_LOOP_CODE);
}

function cleanLine(line) {
  return line.replace(/\s+/g, " ").trim();
}

function extractConversationFromText({ text, ariaLabel, dateTime }) {
  const lines = text
    .split("\n")
    .map(cleanLine)
    .filter((line) => line && !/^(unread|belum dibaca)$/i.test(line));
  const timestamp = dateTime || lines.find((line) => TIME_LINE_PATTERN.test(line)) || "Tidak tersedia";
  const contentLines = lines.filter((line) => line !== timestamp);
  const customerName = contentLines[0] || ariaLabel || "Tidak diketahui";
  const message = contentLines.slice(1).join(" ") || "Preview pesan tidak tersedia";

  return {
    customerName,
    receivedAt: timestamp,
    message,
  };
}

function deduplicateConversations(conversations) {
  const seen = new Set();

  return conversations.filter((conversation) => {
    const key = [
      conversation.customerName,
      conversation.receivedAt,
      conversation.message,
    ].join("|");

    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

async function hasVisibleLocator(page, selectorList) {
  for (const selector of selectorList) {
    const isVisible = await page.locator(selector).first().isVisible().catch(() => false);
    if (isVisible) return true;
  }

  return false;
}

async function requiresLogin(page) {
  return LOGIN_URL_PATTERN.test(page.url()) || hasVisibleLocator(page, selectors.login);
}

async function extractUnreadConversations(page) {
  const unreadSelector = selectors.unreadConversation.join(", ");
  const rawConversations = await page.locator(unreadSelector).evaluateAll((badges, containerSelector) => {
    return badges.map((badge) => {
      const container = badge.closest(containerSelector) || badge.parentElement;
      const timestampElement = container?.querySelector("time");

      return {
        text: container?.innerText || badge.getAttribute("aria-label") || "",
        ariaLabel: badge.getAttribute("aria-label") || "",
        dateTime: timestampElement?.getAttribute("datetime") || timestampElement?.textContent || "",
      };
    });
  }, selectors.conversationContainer);

  return deduplicateConversations(rawConversations.map(extractConversationFromText));
}

class InboxWatcher {
  async check(page, account) {
    const resultBase = {
      accountId: account.id,
      accountName: accountName(account),
    };

    try {
      await page.goto(MARKETPLACE_INBOX_URL, {
        waitUntil: "domcontentloaded",
        timeout: 45_000,
      });
    } catch (error) {
      if (!isRedirectLoop(error)) throw error;
      return this.handleRedirectLoop(page, resultBase);
    }

    await page.waitForTimeout(1_000);
    if (await requiresLogin(page)) {
      return { ...resultBase, status: "login_required", unreadCount: 0 };
    }

    const unreadConversations = await extractUnreadConversations(page);

    return {
      ...resultBase,
      status: "ok",
      unreadCount: unreadConversations.length,
      unreadConversations,
      url: page.url(),
    };
  }

  async handleRedirectLoop(page, resultBase) {
    await page.goto(FACEBOOK_HOME_URL, {
      waitUntil: "domcontentloaded",
      timeout: 45_000,
    });
    await page.waitForTimeout(500);

    if (await requiresLogin(page)) {
      return { ...resultBase, status: "login_required", unreadCount: 0 };
    }

    return {
      ...resultBase,
      status: "marketplace_unavailable",
      unreadCount: 0,
      url: page.url(),
    };
  }
}

module.exports = {
  FACEBOOK_HOME_URL,
  InboxWatcher,
  MARKETPLACE_INBOX_URL,
  extractConversationFromText,
};
