const TelegramBot = require("node-telegram-bot-api");
const config = require("./config");
const { formatCheckResult } = require("./resultReporter");

function notificationText(result) {
  if (result.status === "ok") return formatCheckResult(result);

  const accountName = result.accountName || result.accountId;
  if (result.status === "login_required") {
    return `⚠️ Login Facebook diperlukan untuk akun ${accountName}.`;
  }

  return `⚠️ Marketplace Inbox tidak dapat dibuka untuk akun ${accountName}. Periksa browser.`;
}

class TelegramNotifier {
  constructor({ botToken = config.telegram.botToken, chatId = config.telegram.chatId } = {}) {
    this.chatId = chatId;
    this.bot = botToken && chatId
      ? new TelegramBot(botToken, { polling: false })
      : null;
  }

  async notifyInbox(result) {
    if (!this.bot) return false;
    await this.bot.sendMessage(this.chatId, notificationText(result));
    return true;
  }
}

module.exports = { TelegramNotifier, notificationText };
