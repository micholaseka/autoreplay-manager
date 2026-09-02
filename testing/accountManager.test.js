const test = require("node:test");
const assert = require("node:assert/strict");
const { validateAccounts } = require("../src/accountManager");
const {
  InboxWatcher,
  extractConversationFromText,
} = require("../src/inboxWatcher");
const { formatCheckResult } = require("../src/resultReporter");

test("menerima akun unik", () => {
  const accounts = validateAccounts([{ id: " a ", username: "user" }]);
  assert.deepEqual(accounts, [{ id: "a", username: "user" }]);
});

test("melaporkan field invalid dan duplikasi", () => {
  assert.throws(
    () => validateAccounts([
      { id: "", username: "" },
      { id: "a", username: "u" },
      { id: "a", username: "u2" },
    ]),
    /tidak punya "id"[\s\S]*tidak punya "username"[\s\S]*id "a" dobel/,
  );
});

test("mengubah redirect loop menjadi status login yang jelas", async () => {
  let currentUrl = "https://www.facebook.com/marketplace/inbox/";
  const visitedUrls = [];
  const page = {
    goto: async (url) => {
      visitedUrls.push(url);
      if (url.includes("marketplace")) {
        throw new Error("net::ERR_TOO_MANY_REDIRECTS");
      }
      currentUrl = "https://www.facebook.com/login/";
    },
    waitForTimeout: async () => {},
    url: () => currentUrl,
    locator: () => ({
      first: () => ({ isVisible: async () => false }),
      count: async () => 0,
    }),
  };

  const result = await new InboxWatcher().check(page, {
    id: "akun1",
    username: "marketplace",
  });

  assert.equal(result.status, "login_required");
  assert.deepEqual(visitedUrls, [
    "https://www.facebook.com/marketplace/inbox/",
    "https://www.facebook.com/",
  ]);
});

test("memformat hasil pemeriksaan per akun", () => {
  assert.equal(
    formatCheckResult({
      status: "ok",
      accountName: "Akun 1",
      unreadCount: 2,
    }),
    "[hasil] Akun 1: 2 chat belum dibaca.",
  );
});

test("mengekstrak nama, waktu, dan isi dari preview percakapan", () => {
  const conversation = extractConversationFromText({
    text: "Rina Putri\nApakah barangnya masih ada?\nSel, 10.30",
    ariaLabel: "Unread conversation",
    dateTime: "",
  });

  assert.deepEqual(conversation, {
    customerName: "Rina Putri",
    receivedAt: "Sel, 10.30",
    message: "Apakah barangnya masih ada?",
  });
});

test("menampilkan detail setiap percakapan unread", () => {
  const output = formatCheckResult({
    status: "ok",
    accountName: "Akun 1",
    unreadCount: 1,
    unreadConversations: [{
      customerName: "Rina Putri",
      receivedAt: "Sel, 10.30",
      message: "Apakah barangnya masih ada?",
    }],
  });

  assert.match(output, /Nama pelanggan: Rina Putri/);
  assert.match(output, /Waktu masuk: Sel, 10\.30/);
  assert.match(output, /Isi pesan: Apakah barangnya masih ada\?/);
});
