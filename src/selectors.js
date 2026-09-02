// Verifikasi ulang selector ini dengan Playwright codegen bila UI Facebook berubah.
module.exports = {
  login: [
    'input[name="email"]',
    'input[name="pass"]',
    '[data-testid="royal_login_form"]',
  ],
  unreadConversation: [
    '[aria-label*="unread" i]',
    '[aria-label*="belum dibaca" i]',
    '[data-testid="mwthreadlist-item-unread"]',
  ],
  conversationContainer: [
    '[role="row"]',
    '[role="link"]',
    'li',
  ].join(", "),
};
