import '@angular/compiler';

import { DOCUMENT } from '@angular/common';
import { Injector, PLATFORM_ID, runInInjectionContext } from '@angular/core';
import { AudioGuideService } from './audio-guide.service';

describe('AudioGuideService', () => {
  it('speaks in the selected language and clears the active item on completion', () => {
    const utterances: { text: string; lang: string; onend: (() => void) | null }[] = [];
    const speechSynthesis = {
      cancel: vi.fn(),
      speak: vi.fn((utterance: (typeof utterances)[number]) => utterances.push(utterance)),
    };
    class MockUtterance {
      lang = '';
      onend: (() => void) | null = null;
      onerror: (() => void) | null = null;

      constructor(readonly text: string) {}
    }
    const injector = Injector.create({
      providers: [
        {
          provide: DOCUMENT,
          useValue: {
            defaultView: {
              speechSynthesis,
              SpeechSynthesisUtterance: MockUtterance,
            },
          },
        },
        { provide: PLATFORM_ID, useValue: 'browser' },
      ],
    });
    const service = runInInjectionContext(injector, () => new AudioGuideService());

    service.toggle('story:test', 'Testo da leggere.', 'fr');

    expect(speechSynthesis.speak).toHaveBeenCalledOnce();
    expect(utterances[0]).toMatchObject({ text: 'Testo da leggere.', lang: 'fr-FR' });
    expect(service.activeContentId()).toBe('story:test');
    utterances[0].onend?.();
    expect(service.activeContentId()).toBeNull();
  });

  it('stops the current utterance when another item starts', () => {
    const speechSynthesis = { cancel: vi.fn(), speak: vi.fn() };
    class MockUtterance {
      lang = '';
      onend: (() => void) | null = null;
      onerror: (() => void) | null = null;

      constructor(readonly text: string) {}
    }
    const injector = Injector.create({
      providers: [
        {
          provide: DOCUMENT,
          useValue: {
            defaultView: {
              speechSynthesis,
              SpeechSynthesisUtterance: MockUtterance,
            },
          },
        },
        { provide: PLATFORM_ID, useValue: 'browser' },
      ],
    });
    const service = runInInjectionContext(injector, () => new AudioGuideService());

    service.toggle('story:first', 'Primo testo.', 'it');
    speechSynthesis.cancel.mockClear();
    service.toggle('place:second', 'Secondo testo.', 'en');

    expect(speechSynthesis.cancel).toHaveBeenCalledOnce();
    expect(service.activeContentId()).toBe('place:second');
  });

  it('reports unsupported speech synthesis and empty narration', () => {
    const injector = Injector.create({
      providers: [
        { provide: DOCUMENT, useValue: { defaultView: null } },
        { provide: PLATFORM_ID, useValue: 'browser' },
      ],
    });
    const service = runInInjectionContext(injector, () => new AudioGuideService());

    service.toggle('story:test', 'Testo.', 'it');
    expect(service.error()).toBe('unavailable');
    expect(service.errorContentId()).toBe('story:test');

    const emptyTextInjector = Injector.create({
      providers: [
        {
          provide: DOCUMENT,
          useValue: {
            defaultView: {
              speechSynthesis: { cancel: vi.fn(), speak: vi.fn() },
              SpeechSynthesisUtterance: class {
                constructor(readonly text: string) {}
              },
            },
          },
        },
        { provide: PLATFORM_ID, useValue: 'browser' },
      ],
    });
    const emptyTextService = runInInjectionContext(
      emptyTextInjector,
      () => new AudioGuideService(),
    );

    emptyTextService.toggle('story:empty', '  ', 'it');
    expect(emptyTextService.error()).toBe('empty');
  });
});
