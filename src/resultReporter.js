function formatConversation(conversation) {
  return [
    `  Nama pelanggan: ${conversation.customerName}`,
    `  Waktu masuk: ${conversation.receivedAt}`,
    `  Isi pesan: ${conversation.message}`,
  ].join("\n");
}

function formatCheckResult(result) {
  const accountName = result.accountName || result.accountId;

  switch (result.status) {
    case "ok": {
      const header = `[hasil] ${accountName}: ${result.unreadCount} chat belum dibaca.`;
      const conversations = result.unreadConversations || [];
      return conversations.length
        ? `${header}\n${conversations.map(formatConversation).join("\n\n")}`
        : header;
    }
    case "login_required":
      return `[hasil] ${accountName}: perlu login Facebook.`;
    case "marketplace_unavailable":
      return `[hasil] ${accountName}: Marketplace Inbox tidak tersedia.`;
    case "error":
      return `[hasil] ${accountName}: pemeriksaan gagal — ${result.error}`;
    default:
      return `[hasil] ${accountName}: status tidak dikenal (${result.status}).`;
  }
}

function printCycleResults(results, logger = console.log) {
  results.forEach((result) => logger(formatCheckResult(result)));
}

module.exports = { formatCheckResult, printCycleResults };
