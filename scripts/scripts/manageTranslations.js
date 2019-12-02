/* eslint-disable */
const fs = require('fs');
const path = require('path');
const { exec } = require('shelljs');
const { sync: globSync } = require('glob');
const { sync: mkdirpSync } = require('mkdirp');
const { convertPropsToFlatJson } = require('propson');

function manageTranslations({
  supportedLocales,
  localGeneratedMessagesDir,
  extractedMessagesDir,
}) {
  const i18n = supportedLocales;

  const MESSAGES_PATTERN = `${extractedMessagesDir}/**/*.json`;
  const LANG_DIR = `${localGeneratedMessagesDir}/messages`;
  const FRONTEND_EXPORT_FILE = `${localGeneratedMessagesDir}/index.js`;
  const getLocaleFilePath = lang => `${lang.locale}/strings.properties`;

  const emptyTranslations = false;

  mkdirpSync(LANG_DIR);
  const duplicateKeys = [];
  // Aggregates the default messages that were extracted from the example app's
  // React components via the React Intl Babel plugin. An error will be thrown if
  // there are messages in different components that use the same `id`. The result
  // is a flat collection of `id: message` pairs for the app's default locale.
  let defaultMessages = globSync(MESSAGES_PATTERN)
    .map(filename => fs.readFileSync(filename, 'utf8'))
    .map(file => JSON.parse(file))
    .reduce((collection, descriptors) => {
      descriptors.forEach(({ id, defaultMessage, description }) => {
        if (Object.prototype.hasOwnProperty.call(collection, id))
          duplicateKeys.push(id);
        // throw new Error(`Duplicate message id: ${id}`);

        collection[id] = {
          defaultMessage,
          description,
        };
      });
      return collection;
    }, {});

  // Sort keys by name
  const messageKeys = Object.keys(defaultMessages);
  messageKeys.sort();
  defaultMessages = messageKeys.reduce((acc, key) => {
    acc[key] = defaultMessages[key];
    return acc;
  }, {});

  // Build the JSON document for the available languages
  const defaultMessagesObj = messageKeys.reduce((acc, key) => {
    acc[key] = defaultMessages[key].defaultMessage;
    return acc;
  }, {});

  i18n.forEach(lang => {
    let langFile;
    try {
      langFile = fs.readFileSync(`${LANG_DIR}/${getLocaleFilePath(lang)}`, {
        encoding: 'utf-8',
      });
      function returnMessagesFromPropertiesFile(rawPropertiesString) {
        const translationsContent = rawPropertiesString.split('\n');
        const parsedTranslations = convertPropsToFlatJson(translationsContent);

        return parsedTranslations;
      }
      langDoc = returnMessagesFromPropertiesFile(langFile);
    } catch (e) {}
    const units = Object.keys(defaultMessages)
      .map(id => [id, defaultMessages[id]])
      .reduce((collection, [id]) => {
        if (lang.defaultLocale) {
          collection[id] = defaultMessagesObj[id].split('\n').join('\\n');
        } else {
          // Filter out empty translations or include them, pontoon detects that translations are done if there's an empty one.
          if (emptyTranslations) {
            collection[id] = (langDoc && langDoc[id]) || '';
          } else {
            if (langDoc && langDoc[id]) {
              collection[id] = langDoc && langDoc[id];
            }
          }
        }
        return collection;
      }, {});

    mkdirpSync(path.dirname(`${LANG_DIR}/${getLocaleFilePath(lang)}`));

    const propertiesContent = Object.keys(units)
      .map(id => `${id}=${units[id] ? units[id] : ''}`)
      .join('\n');

    fs.writeFileSync(
      `${LANG_DIR}/${getLocaleFilePath(lang)}`,
      propertiesContent
    );
  });

  fs.writeFileSync(
    `${FRONTEND_EXPORT_FILE}`,
    `
    /* eslint-disable import/no-unresolved */
    import { convertPropsToFlatJson } from "propson";
    // This is imported using Fusebox's raw plugin, make sure to include .properties in your fusebox config
    ${i18n
      .map(
        lang =>
          `import * as ${
            lang.codeName
          }Messages from './messages/${getLocaleFilePath(lang)}';`
      )
      .join('\n')}


    function returnMessagesFromPropertiesFile(rawPropertiesString) {
      const translationsContent = rawPropertiesString.split("\\n");
      const parsedTranslations = convertPropsToFlatJson(translationsContent);

      return parsedTranslations;
    }

    export default [
      ${i18n
        .map(
          lang => `{
        name: '${lang.name}',
        locale: '${lang.locale}',
        contentfulLocale: '${lang.contentfulLocale}',
        ${lang.defaultLocale ? `defaultLocale: true, ` : ''}
        messages: returnMessagesFromPropertiesFile(${`${lang.codeName}Messages`}),
      }`
        )
        .join(',\n')}
    ];
    
  `
  );
  exec('npm run format');
}
module.exports = manageTranslations;
