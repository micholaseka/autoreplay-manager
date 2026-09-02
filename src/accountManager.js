// Membaca dan memvalidasi daftar akun sebelum browser dijalankan.
const fs = require("fs");
const config = require("./config");

function validateAccounts(accounts) {
  if (!Array.isArray(accounts)) throw new Error("[accountManager] accounts.json harus berupa daftar (array).");
  const errors = [], seenIds = new Set(), seenUsernames = new Set(), validAccounts = [];
  accounts.forEach((account, index) => {
    const number = index + 1;
    if (!account || typeof account !== "object" || Array.isArray(account)) { errors.push(`Akun #${number}: harus berupa objek.`); return; }
    const id = typeof account.id === "string" ? account.id.trim() : "";
    const username = typeof account.username === "string" ? account.username.trim() : "";
    if (!id) errors.push(`Akun #${number}: tidak punya "id" yang valid.`);
    if (!username) errors.push(`Akun #${number}${id ? ` (id: ${id})` : ""}: tidak punya "username" yang valid.`);
    if (!id || !username) return;
    if (seenIds.has(id)) { errors.push(`Akun #${number}: id "${id}" dobel.`); return; }
    if (seenUsernames.has(username)) { errors.push(`Akun #${number}: username "${username}" dobel.`); return; }
    seenIds.add(id); seenUsernames.add(username); validAccounts.push({ ...account, id, username });
  });
  if (errors.length) throw new Error(`[accountManager] accounts.json ada masalah (${errors.length}):\n${errors.map((error) => `  - ${error}`).join("\n")}`);
  return validAccounts;
}

function loadAccounts(file = config.paths.accounts) {
  if (!fs.existsSync(file)) throw new Error(`[accountManager] File accounts.json tidak ditemukan di: ${file}\nSalin accounts.example.json menjadi accounts.json, lalu isi datanya.`);
  let accounts;
  try { accounts = JSON.parse(fs.readFileSync(file, "utf8")); }
  catch (error) { throw new Error(`[accountManager] accounts.json tidak valid: ${error.message}`); }
  const semua = validateAccounts(accounts), aktif = semua.filter((account) => account.aktif !== false);
  console.log(`[accountManager] OK: ${semua.length} akun terdaftar, ${aktif.length} aktif.`);
  return { semua, aktif };
}
module.exports = { loadAccounts, validateAccounts };
