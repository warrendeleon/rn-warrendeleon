import ca from '../locales/ca.json';
import en from '../locales/en.json';
import es from '../locales/es.json';
import pl from '../locales/pl.json';
import tl from '../locales/tl.json';

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
  const enKeys = collectKeys(en as AnyRecord).sort();

  it('en and es have the same keys', () => {
    const esKeys = collectKeys(es as AnyRecord).sort();
    expect(esKeys).toEqual(enKeys);
  });

  it('en and ca have the same keys', () => {
    const caKeys = collectKeys(ca as AnyRecord).sort();
    expect(caKeys).toEqual(enKeys);
  });

  it('en and pl have the same keys', () => {
    const plKeys = collectKeys(pl as AnyRecord).sort();
    expect(plKeys).toEqual(enKeys);
  });

  it('en and tl have the same keys', () => {
    const tlKeys = collectKeys(tl as AnyRecord).sort();
    expect(tlKeys).toEqual(enKeys);
  });
});
