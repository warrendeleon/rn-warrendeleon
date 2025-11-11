import en from '../locales/en.json';
import es from '../locales/es.json';

type AnyRecord = Record<string, unknown>;

const collectKeys = (obj: AnyRecord, prefix = ''): string[] =>
  Object.entries(obj).flatMap(([key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key;

    if (value && typeof value === 'object' && !Array.isArray(value)) {
      return collectKeys(value as AnyRecord, path);
    }

    return [path];
  });

describe('i18n locales', () => {
  it('en and es have the same keys', () => {
    const enKeys = collectKeys(en as AnyRecord).sort();
    const esKeys = collectKeys(es as AnyRecord).sort();

    expect(esKeys).toEqual(enKeys);
  });
});
