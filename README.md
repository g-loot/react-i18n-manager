# react-i18n-manager
A system to auto manage your react intl extractedMessages, into language files in a seperate repo, with added support for mozilla pontoon

- this library requires: `babel-plugin-react-intl` installed and configured
  https://github.com/formatjs/formatjs/tree/master/packages/babel-plugin-react-intl

- it stores your language files in a seperate public repository that you depend on that should be setup like this repo           https://github.com/g-loot/gll-play-localization
  basic configuration is a messages folder and an index.js folder
  
- add your localization repo as a dependency of your frontend client, and import the locales with messages objects like so
```javascript
import locales from 'gll-play-localization';

export default locales;
```

- As of now it only supports .properties lang files which get parsed as json in runtime using `propson` package so you need to configure RawPlugin for fusebox to import .properties as string

- pass down your locales configured like this

```json
[
  {
    "name": "English",
    "codeName": "en",
    "locale": "en-US",
    "contentfulLocale": "en-US",
    "defaultLocale": true
  },
  {
    "name": "Vietnamese",
    "codeName": "vi",
    "locale": "vi",
    "contentfulLocale": "vi"
  },
  ...etc
]
```


Example Configuration for the node script you need to run
```javascript
const syncTranslations = require('react-i18n-manager');
const supportedLocales = require('../supportedLocales.json');

syncTranslations({
  supportedLocales,
  srcDirectory: 'src',
  extractedMessagesDir: 'src/i18n/locales/extracted-messages',
  locallyGeneratedMessagesDir: 'src/i18n/locales/generated-messages',
  REPO_SSH_URL: 'git@github.com:g-loot/gll-play-localization.git',
  REPO_EXTRL_DIR: 'gll-play-localization',
});
```
