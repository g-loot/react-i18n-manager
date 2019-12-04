# react-i18n-manager
A system to auto manage your react intl extractedMessages, into language files in a seperate repo, with added support for mozilla pontoon

this library requires: `babel-preset-react-app` installed and configured
https://github.com/formatjs/formatjs/tree/master/packages/babel-plugin-react-intl

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
