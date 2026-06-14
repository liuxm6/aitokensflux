# Customer i18n

Customer frontend translations live in `locales/` and use the English copy as
the lookup key.

Files:

- `locales/en.ts` - English source strings
- `locales/zh.ts` - Simplified Chinese translations
- `locales/zh-TW.ts` - Traditional Chinese translations
- `locales/ru.ts` - Russian translations and dynamic pattern translations

Use the key-based form for UI copy:

```tsx
<T id="English" />;
<T id="Quota ({{unit}})" values={{ unit: quotaUnit }} />;
```

For dynamic values from backend records, use `localizeText(language, zh, en)`
until the data model can provide stable translation keys.
