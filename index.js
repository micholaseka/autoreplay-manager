const config = require("./src/config");
const { loadAccounts } = require("./src/accountManager");
const { BrowserEngine } = require("./src/browserEngine");
const { InboxWatcher } = require("./src/inboxWatcher");
const { printCycleResults } = require("./src/resultReporter");
const { TelegramNotifier } = require("./src/telegram");

function wait(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

async function main() {
  const { aktif: activeAccounts } = loadAccounts();
  const engine = new BrowserEngine({
    watcher: new InboxWatcher(),
    notifier: new TelegramNotifier(),
  });
  let stopping = false;

  const stop = async () => {
    if (stopping) return;

    stopping = true;
    console.log("\n[main] Menutup browser dengan aman...");
    await engine.close();
    process.exit(0);
  };

  process.once("SIGINT", stop);
  process.once("SIGTERM", stop);

  while (!stopping) {
    console.log(`[main] Memeriksa ${activeAccounts.length} akun...`);
    const results = await engine.runCycle(activeAccounts);
    printCycleResults(results);

    if (!stopping) await wait(config.watcher.cycleIntervalMs);
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
