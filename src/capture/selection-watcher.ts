import type { Browser } from 'wxt/browser';

export const SELECTION_PORT = 'readme-capture-selection';

/** Rendu du surlignage des extraits ajoutés, fixe quel que soit le mode (US-06, design.md, décision 9, hors DS). */
const HIGHLIGHT_CSS = '::highlight(readme-capture-extract) { background-color: #FDF1ED; color: #0F0E0D; }';

/** Message posté par l'écoute de la sélection (US-06, design.md, décision 2). */
export interface SelectionMessage {
  text: string | null;
  nearestHeading: string | null;
}

/** Commande postée par le panneau à l'écoute d'un onglet (US-06, design.md, décision 9). */
type WatcherCommand = { type: 'highlight'; text: string } | { type: 'pause' } | { type: 'resume' };

/**
 * Exécutée dans l'onglet actif par `scripting.executeScript` : autonome, sans import (US-06, design.md, décisions 2 et 9).
 * Poste la sélection sur un port au plus toutes les 200 ms, surligne les extraits ajoutés sans modifier le DOM,
 * et retire son écouteur et ses surlignages quand le port se déconnecte.
 * `browser` est lu sur `globalThis` : la fonction est sérialisée, aucun import ne peut y être résolu.
 */
export function installSelectionWatcher(): void {
  interface WatcherPort {
    postMessage(message: unknown): void;
    disconnect(): void;
    onMessage: { addListener(callback: (command: WatcherCommand) => void): void };
    onDisconnect: { addListener(callback: () => void): void };
  }
  const runtime = (globalThis as unknown as { browser: { runtime: { connect(info: { name: string }): WatcherPort } } })
    .browser.runtime;
  const key = '__readmeCaptureSelectionWatcher';
  const highlightName = 'readme-capture-extract';
  const registry = window as unknown as Record<string, { stop(): void } | undefined>;

  // Une installation précédente dans cet onglet est d'abord déconnectée.
  registry[key]?.stop();

  const port = runtime.connect({ name: 'readme-capture-selection' });
  let timer: ReturnType<typeof setTimeout> | undefined;
  // Plage et texte de la dernière sélection postée, pour surligner l'extrait une fois ajouté.
  let lastRange: Range | null = null;
  let lastText: string | null = null;

  const nearestHeading = (selection: Selection): string | null => {
    if (selection.rangeCount === 0) return null;
    const start = selection.getRangeAt(0).startContainer;
    const before = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6')).filter(
      (heading) => (heading.compareDocumentPosition(start) & Node.DOCUMENT_POSITION_FOLLOWING) !== 0,
    );
    const text = before.at(-1)?.textContent?.replace(/\s+/g, ' ').trim() ?? '';
    return text === '' ? null : text;
  };

  const send = () => {
    timer = undefined;
    const selection = window.getSelection();
    const raw = selection?.toString().trim() ?? '';
    const text = raw === '' ? null : raw;
    if (text !== null && selection && selection.rangeCount > 0) {
      lastRange = selection.getRangeAt(0).cloneRange();
      lastText = text;
    }
    port.postMessage({ text, nearestHeading: selection ? nearestHeading(selection) : null });
  };

  const onSelectionChange = () => {
    if (timer === undefined) timer = setTimeout(send, 200);
  };

  const listen = () => document.addEventListener('selectionchange', onSelectionChange);
  const pause = () => {
    document.removeEventListener('selectionchange', onSelectionChange);
    clearTimeout(timer);
    timer = undefined;
  };

  const highlight = (text: string) => {
    if (lastRange === null || lastText !== text) return;
    let extracts = CSS.highlights.get(highlightName);
    if (!extracts) {
      extracts = new Highlight();
      CSS.highlights.set(highlightName, extracts);
    }
    extracts.add(lastRange.cloneRange());
  };

  const stop = () => {
    pause();
    CSS.highlights.delete(highlightName);
    if (registry[key] === handle) delete registry[key];
  };
  const handle = {
    stop: () => {
      stop();
      port.disconnect();
    },
  };

  registry[key] = handle;
  port.onDisconnect.addListener(stop);
  port.onMessage.addListener((command) => {
    if (command.type === 'highlight') highlight(command.text);
    if (command.type === 'pause') pause();
    if (command.type === 'resume') {
      listen();
      send();
    }
  });
  listen();
  send();
}

export interface SelectionWatch {
  /** Surligne dans l'onglet actif l'extrait qui vient d'être ajouté (US-06, design.md, décision 9). */
  highlight(text: string): void;
  /** Arrête l'écoute et déconnecte tous les onglets. */
  stop(): void;
}

/**
 * Côté panneau : installe l'écoute dans l'onglet actif de la fenêtre du panneau, puis à chaque changement d'onglet
 * ou chargement de page (US-06, design.md, décisions 2 et 9). L'écoute d'un onglet qui n'est plus actif est mise
 * en pause s'il a un extrait surligné, déconnectée sinon. `onUnreadable` est appelé quand l'écoute ne peut pas être installée.
 */
export async function watchActiveTabSelection(
  onSelection: (message: SelectionMessage) => void,
  onUnreadable: () => void,
): Promise<SelectionWatch> {
  const { id: windowId } = await browser.windows.getCurrent();
  const ports = new Map<number, Browser.runtime.Port>();
  const highlighted = new Set<number>();
  let activeTabId: number | undefined;

  function post(tabId: number, command: WatcherCommand) {
    ports.get(tabId)?.postMessage(command);
  }

  function onConnect(port: Browser.runtime.Port) {
    if (port.name !== SELECTION_PORT) return;
    const tabId = port.sender?.tab?.id;
    if (tabId === undefined || tabId !== activeTabId) {
      port.disconnect();
      return;
    }
    ports.get(tabId)?.disconnect();
    ports.set(tabId, port);
    port.onMessage.addListener((message) => {
      if (tabId === activeTabId) onSelection(message as SelectionMessage);
    });
    port.onDisconnect.addListener(() => {
      if (ports.get(tabId) !== port) return;
      ports.delete(tabId);
      highlighted.delete(tabId);
    });
  }

  /** Met en pause ou déconnecte l'écoute de l'onglet qui n'est plus actif. */
  function leave(tabId: number) {
    if (highlighted.has(tabId)) {
      post(tabId, { type: 'pause' });
    } else {
      ports.get(tabId)?.disconnect();
      ports.delete(tabId);
    }
  }

  async function install(tabId: number) {
    try {
      await browser.scripting.insertCSS({ target: { tabId }, css: HIGHLIGHT_CSS });
      await browser.scripting.executeScript({ target: { tabId }, func: installSelectionWatcher });
    } catch {
      if (activeTabId === tabId) onUnreadable();
    }
  }

  function activate(tabId: number) {
    if (activeTabId !== undefined && activeTabId !== tabId) leave(activeTabId);
    activeTabId = tabId;
    if (ports.has(tabId)) post(tabId, { type: 'resume' });
    else void install(tabId);
  }

  function onActivated(activeInfo: { tabId: number; windowId: number }) {
    if (activeInfo.windowId === windowId) activate(activeInfo.tabId);
  }

  function onUpdated(tabId: number, changeInfo: { status?: string }, tab: { active: boolean; windowId?: number }) {
    if (tab.active && tab.windowId === windowId && changeInfo.status === 'complete') {
      activeTabId = tabId;
      void install(tabId);
    }
  }

  browser.runtime.onConnect.addListener(onConnect);
  browser.tabs.onActivated.addListener(onActivated);
  browser.tabs.onUpdated.addListener(onUpdated);

  const [tab] = await browser.tabs.query({ active: true, windowId });
  if (tab?.id !== undefined) activate(tab.id);
  else onUnreadable();

  return {
    highlight(text) {
      if (activeTabId === undefined || !ports.has(activeTabId)) return;
      post(activeTabId, { type: 'highlight', text });
      highlighted.add(activeTabId);
    },
    stop() {
      browser.runtime.onConnect.removeListener(onConnect);
      browser.tabs.onActivated.removeListener(onActivated);
      browser.tabs.onUpdated.removeListener(onUpdated);
      for (const port of ports.values()) port.disconnect();
      ports.clear();
      highlighted.clear();
    },
  };
}
