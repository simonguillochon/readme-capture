import { beforeEach, describe, expect, it } from 'vitest';
import { fakeBrowser } from 'wxt/testing/fake-browser';
import { readNotionConfig, writeNotionConfig, type NotionConfig } from '@/config/notion-config';

const config: NotionConfig = {
  token: 'ntn_exemple123',
  databaseUrl: 'https://www.notion.so/exemple/Readme-center-0123456789abcdef0123456789abcdef',
  databaseId: '0123456789abcdef0123456789abcdef',
  databaseTitle: 'Readme center',
  dataSourceId: 'fedcba9876543210fedcba9876543210',
};

describe('configuration notionConfig', () => {
  beforeEach(() => {
    fakeBrowser.reset();
  });

  it('renvoie null quand aucune configuration n’est enregistrée', async () => {
    expect(await readNotionConfig()).toBeNull();
  });

  it('relit la configuration enregistrée sous la clé notionConfig du stockage local', async () => {
    await writeNotionConfig(config);

    expect(await readNotionConfig()).toEqual(config);
    expect(await fakeBrowser.storage.local.get('notionConfig')).toEqual({ notionConfig: config });
  });

  it('remplace la configuration précédente', async () => {
    await writeNotionConfig(config);
    const remplacement = { ...config, token: 'ntn_autre456' };

    await writeNotionConfig(remplacement);

    expect(await readNotionConfig()).toEqual(remplacement);
  });
});
