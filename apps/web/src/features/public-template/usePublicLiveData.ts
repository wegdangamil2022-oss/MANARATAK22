import { useCallback, useEffect, useState } from 'react';
import { loadPublicLiveSnapshot, type PublicLiveLoadResult, type PublicLiveLocale } from './publicLiveDataSource';
import { loadPublicPrototypeSnapshot } from './publicPrototypeDataSource';
import { resolvePublicTemplateDataMode, type PublicTemplateDataMode } from './publicScholarshipDataSource';

export function usePublicLiveData(value: unknown, locale: PublicLiveLocale = 'ar') {
  const mode: PublicTemplateDataMode = resolvePublicTemplateDataMode(value);
  const [result, setResult] = useState<PublicLiveLoadResult>(() => loadPublicPrototypeSnapshot());
  const [reloadVersion, setReloadVersion] = useState(0);
  const reload = useCallback(() => setReloadVersion((v) => v + 1), []);

  useEffect(() => {
    let active = true;
    if (mode === 'prototype') {
      setResult(loadPublicPrototypeSnapshot());
      return () => { active = false; };
    }
    let generation = 0;
    const load = async (force = false) => {
      const request = ++generation;
      try {
        const next = await (force ? loadPublicLiveSnapshot(locale, true) : loadPublicLiveSnapshot(locale));
        if (active && request === generation) setResult(next);
      } catch {
        if (active && request === generation) setResult(loadPublicPrototypeSnapshot());
      }
    };
    void load(reloadVersion > 0);
    return () => {
      active = false;
      generation++;
    };
  }, [mode, locale, reloadVersion]);

  return { mode, ...result, reload };
}
