require('colors');
const { exec } = require('shelljs');
const manageTranslations = require('./manageTranslations');
const supportedLocales = require('../supportedLocales.json');

const run = ({
  REPO_SSH_URL = 'git@github.com:g-loot/gll-play-localization.git',
  REPO_EXTRL_DIR = 'gll-play-localization',
}) => {
  const REPO_DIR = `../${REPO_EXTRL_DIR}`;
  const LOCAL_DIR = 'src/i18n/locales/generated-messages';
  const EXTRACTED_MESSAGES_DIR = 'i18n/locales/generated-messages/*';

  console.info(`executing: ${`rm -rf ${REPO_DIR}`.blue}`);
  exec(`rm -rf ${REPO_DIR}`);

  console.info(`executing: ${`git clone ${REPO_SSH_URL} ${REPO_DIR}`.blue}`);
  exec(`git clone ${REPO_SSH_URL} ${REPO_DIR}`);
  console.info(`executing: ${`git pull`.blue}`);
  exec(`git pull`, { cwd: REPO_DIR });

  console.info(`executing: ${`rm -rf ${LOCAL_DIR}/`.blue}`);
  exec(`rm -rf ${LOCAL_DIR}/`);
  console.info(`executing: ${`cp -r ${REPO_DIR}/ ${LOCAL_DIR}/`.blue}`);
  exec(`cp -r ${REPO_DIR}/ ${LOCAL_DIR}/`);
  console.info(`executing: ${'npm run update-translations'.blue}`);
  // exec('npm run update-translations');
  exec(
    `NODE_ENV=production babel ./src --ignore '${EXTRACTED_MESSAGES_DIR}'  --out-file /dev/null `
  );
  manageTranslations({
    supportedLocales,
    extractedMessagesDir: 'src/i18n/locales/extracted-messages',
    localGeneratedMessagesDir: LOCAL_DIR,
  });
  console.info(`executing: ${`rm -rf ${REPO_DIR}/`.blue}`);
  exec(`rm -rf ${REPO_DIR}/`);
  console.info(`executing: ${`cp -r ${LOCAL_DIR}/ ${REPO_DIR}/`.blue}`);
  exec(`cp -r ${LOCAL_DIR}/ ${REPO_DIR}/`);
  console.info(`executing: ${'git add .'.blue}`);
  exec('git add .', { cwd: REPO_DIR });
  console.info(
    `executing: ${`git commit -a -m "Automated translation ids update"`.blue}`
  );
  exec(`git commit -a -m "Automated translation ids update"`, {
    cwd: REPO_DIR,
  });
  console.info(`executing: ${`git push`.blue}`);
  exec(`git push`, { cwd: REPO_DIR });
  exec(`npm run publish`, { cwd: REPO_DIR });
  exec(`npm up gll-play-localization`);
  console.info(`executing: ${`rm -rf ${REPO_DIR}`.blue}`);
  // exec(`rm -rf ${REPO_DIR}`);
  exec(`rm -rf ${LOCAL_DIR}`);
  exec('rm -rf src/i18n/locales/extracted-messages');
};

run();
