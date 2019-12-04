require("colors");
const { exec } = require("shelljs");
const manageTranslations = require("./manageTranslations");
let verboseLogging = false;
const execute = (...args) => {
  if (verboseLogging) {
    console.info(`executing: ${`${command}`.blue}`);
  }
  exec(...args);
};

const syncTranslations = ({
  srcDirectory = "src",
  supportedLocales,
  extractedMessagesDir = "src/i18n/locales/extracted-messages",
  REPO_SSH_URL = "git@github.com:g-loot/gll-play-localization.git",
  REPO_EXTRL_DIR = "gll-play-localization",
  locallyGeneratedMessagesDir = "src/i18n/locales/generated-messages",
  options: { allowEmptyTranslations = false, allowVerboseLogging = false } = {}
} = {}) => {
  verboseLogging = allowVerboseLogging;

  const REPO_DIR = `../${REPO_EXTRL_DIR}`;
  const EXTRACTED_MESSAGES_DIR = `${locallyGeneratedMessagesDir}/*`;

  console.info("Cloning localization files repository".magenta);
  execute(`rm -rf ${REPO_DIR}`);
  execute(`git clone ${REPO_SSH_URL} ${REPO_DIR}`);
  execute(`git pull`, { cwd: REPO_DIR });
  execute(`rm -rf ${locallyGeneratedMessagesDir}/`);
  execute(`mkdir ${locallyGeneratedMessagesDir}`);
  execute(
    `cp -r ${REPO_DIR}/messages/ ${locallyGeneratedMessagesDir}/messages/`
  );
  execute(`cp -r ${REPO_DIR}/index.js ${locallyGeneratedMessagesDir}/index.js`);
  console.info(
    `Extracting Messages from Source code path ${
      `${srcDirectory} into ${EXTRACTED_MESSAGES_DIR}`.blue
    }`.magenta
  );
  // Fails on windows, unexpected behavior, generates a file called null of the entire project transpiled down
  execute(
    `NODE_ENV=production babel ./${srcDirectory} --ignore '${EXTRACTED_MESSAGES_DIR}'  --out-file /dev/null `
  );
  console.info(
    "Generating language files and export file from extracted messages and merging them into localization repository"
      .magenta
  );
  manageTranslations({
    supportedLocales,
    extractedMessagesDir,
    locallyGeneratedMessagesDir,
    allowEmptyTranslations
  });
  console.log(
    `Copying results back to original repository and pushing changes.`.magenta
  );
  execute(
    `cp -r ${locallyGeneratedMessagesDir}/messages/ ${REPO_DIR}/messages/`
  );
  execute(`cp -r ${locallyGeneratedMessagesDir}/index.js ${REPO_DIR}/index.js`);
  execute("git add .", { cwd: REPO_DIR });
  execute(`git commit -a -m "Automated translation ids update"`, {
    cwd: REPO_DIR
  });
  execute(`git push`, { cwd: REPO_DIR });
  execute(`npm run publish`, { cwd: REPO_DIR });
  execute(`npm up gll-play-localization`);
  execute(`rm -rf ${REPO_DIR}`);
  execute(`rm -rf ${locallyGeneratedMessagesDir}`);
  execute("rm -rf src/i18n/locales/extracted-messages");
};

module.exports = syncTranslations;
