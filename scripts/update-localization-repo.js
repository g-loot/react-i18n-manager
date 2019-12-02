require("colors");
const { exec } = require("shelljs");
const manageTranslations = require("./manageTranslations");

const syncTranslations = ({
  srcDirectory = "src",
  supportedLocales,
  extractedMessagesDir = "src/i18n/locales/extracted-messages",
  REPO_SSH_URL = "git@github.com:g-loot/gll-play-localization.git",
  REPO_EXTRL_DIR = "gll-play-localization",
  locallyGeneratedMessagesDir = "src/i18n/locales/generated-messages",
  options: { allowEmptyTranslations = false } = {}
} = {}) => {
  const REPO_DIR = `../${REPO_EXTRL_DIR}`;
  const EXTRACTED_MESSAGES_DIR = `${locallyGeneratedMessagesDir}/*`;

  console.info(`executing: ${`rm -rf ${REPO_DIR}`.blue}`);
  exec(`rm -rf ${REPO_DIR}`);

  console.info(`executing: ${`git clone ${REPO_SSH_URL} ${REPO_DIR}`.blue}`);
  exec(`git clone ${REPO_SSH_URL} ${REPO_DIR}`);
  console.info(`executing: ${`git pull`.blue}`);
  exec(`git pull`, { cwd: REPO_DIR });

  console.info(`executing: ${`rm -rf ${locallyGeneratedMessagesDir}/`.blue}`);
  exec(`rm -rf ${locallyGeneratedMessagesDir}/`);
  console.info(
    `executing: ${`cp -r ${REPO_DIR}/ ${locallyGeneratedMessagesDir}/`.blue}`
  );
  exec(`mkdir ${locallyGeneratedMessagesDir}`);
  exec(`cp -r ${REPO_DIR}/ ${locallyGeneratedMessagesDir}/`);
  console.info(`executing: ${"npm run update-translations".blue}`);
  // exec('npm run update-translations');
  exec(
    `NODE_ENV=production babel ./${srcDirectory} --ignore '${EXTRACTED_MESSAGES_DIR}'  --out-file /dev/null `
  );
  manageTranslations({
    supportedLocales,
    extractedMessagesDir,
    locallyGeneratedMessagesDir,
    allowEmptyTranslations
  });
  console.info(
    `executing: ${`cp -r ${locallyGeneratedMessagesDir}/ ${REPO_DIR}/`.blue}`
  );
  exec(`cp -r ${locallyGeneratedMessagesDir}/ ${REPO_DIR}/`);
  console.info(`executing: ${"git add .".blue}`);
  exec("git add .", { cwd: REPO_DIR });
  // console.info(
  //   `executing: ${`git commit -a -m "Automated translation ids update"`.blue}`
  // );
  // exec(`git commit -a -m "Automated translation ids update"`, {
  //   cwd: REPO_DIR
  // });
  // console.info(`executing: ${`git push`.blue}`);
  // exec(`git push`, { cwd: REPO_DIR });
  // exec(`npm run publish`, { cwd: REPO_DIR });
  // exec(`npm up gll-play-localization`);
  // console.info(`executing: ${`rm -rf ${REPO_DIR}`.blue}`);
  // // exec(`rm -rf ${REPO_DIR}`);
  // exec(`rm -rf ${locallyGeneratedMessagesDir}`);
  // exec("rm -rf src/i18n/locales/extracted-messages");
};

module.exports = syncTranslations;
