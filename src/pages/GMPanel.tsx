import { useRef, useState } from 'react';
import { ModeButton } from '../components/ModeButton';
import { CrewEditor } from '../components/CrewEditor';
import { ShipEditor } from '../components/ShipEditor';
import {
  PAGE_TYPE_LABELS,
  addChildPage,
  createPage,
  findPage,
  flattenForNav,
  pageContainsId,
  removePageFromTree,
  updatePageInTree,
  type GamePage,
  type PageType,
} from '../state/gameState';
import { useGameState } from '../state/useGameState';
import styles from './GMPanel.module.css';

const PAGE_TYPES = Object.keys(PAGE_TYPE_LABELS) as PageType[];

function isGameStateLike(value: unknown): value is Record<string, unknown> {
  if (!value || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  return Array.isArray(v.pages) || Array.isArray(v.crew);
}

function AddPageSelect({ onAdd, label }: { onAdd: (type: PageType) => void; label: string }) {
  return (
    <select
      className={styles.addPageSelect}
      value=""
      onChange={(e) => {
        const type = e.target.value as PageType;
        if (type) onAdd(type);
      }}
    >
      <option value="">{label}</option>
      {PAGE_TYPES.map((type) => (
        <option key={type} value={type}>
          {PAGE_TYPE_LABELS[type]}
        </option>
      ))}
    </select>
  );
}

interface PageLevel {
  level: number;
  pages: GamePage[];
  selected: GamePage | null;
}

export function GMPanel() {
  const { state, update, replace } = useGameState();
  // One entry per nesting depth: activePath[0] is the root-level tab
  // ('general' or a top-level page id), activePath[1] is the selected
  // tab inside that page's own sub-tab bar (if it's a menu), and so on.
  const [activePath, setActivePath] = useState<string[]>(['general']);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function openPlayerWindow() {
    window.open('/player', 'mothership-player-view', 'width=1280,height=800');
  }

  function exportData() {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mothership-save-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function triggerImport() {
    fileInputRef.current?.click();
  }

  async function handleImportFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      if (!isGameStateLike(parsed)) {
        window.alert('That file doesn\'t look like a Mothership save.');
        return;
      }
      if (!window.confirm('Import will overwrite all current data. Continue?')) return;
      replace(parsed);
      setActivePath(['general']);
    } catch {
      window.alert('Could not read that file. Make sure it\'s a valid save JSON.');
    }
  }

  function setActivePage(id: string) {
    update((prev) => ({ activePageId: prev.activePageId === id ? null : id }));
  }

  function updatePage(id: string, patch: Partial<GamePage>) {
    update((prev) => ({ pages: updatePageInTree(prev.pages, id, patch) }));
  }

  function selectAt(level: number, id: string) {
    setActivePath((prev) => [...prev.slice(0, level), id]);
  }

  function addPageAt(level: number, type: PageType) {
    const page = createPage(type);
    if (level === 0) {
      update((prev) => ({ pages: [...prev.pages, page] }));
    } else {
      const parentId = activePath[level - 1];
      update((prev) => ({ pages: addChildPage(prev.pages, parentId, page) }));
    }
    setActivePath((prev) => [...prev.slice(0, level), page.id]);
  }

  function removePageAt(level: number, id: string) {
    update((prev) => {
      const pages = removePageFromTree(prev.pages, id);
      const activePageId = prev.activePageId && findPage(pages, prev.activePageId) ? prev.activePageId : null;
      return { pages, activePageId };
    });
    setActivePath((prev) => (level === 0 ? ['general'] : prev.slice(0, level)));
  }

  const navEntries = flattenForNav(state.pages);

  // Walk down the tree following activePath, collecting one PageLevel per
  // depth until we hit a leaf (non-menu) page or run out of selections.
  const levels: PageLevel[] = [];
  {
    let levelPages = state.pages;
    let level = 0;
    while (true) {
      const selectedId = activePath[level];
      const selected = (selectedId && levelPages.find((p) => p.id === selectedId)) || null;
      levels.push({ level, pages: levelPages, selected });
      if (!selected || selected.type !== 'menu') break;
      levelPages = selected.children;
      level += 1;
    }
  }

  return (
    <div className={`${styles.wrap} crt-glow-text`}>
      <div className={styles.header}>
        <h1>GM CONSOLE</h1>
        <div className={styles.headerActions}>
          <button type="button" className={styles.secondaryButton} onClick={exportData}>
            Export JSON
          </button>
          <button type="button" className={styles.secondaryButton} onClick={triggerImport}>
            Import JSON
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json"
            hidden
            onChange={handleImportFile}
          />
          <button type="button" className={styles.openButton} onClick={openPlayerWindow}>
            Open Player View
          </button>
        </div>
      </div>

      {levels.map(({ level, pages, selected }) => (
        <div key={level} className={level === 0 ? styles.rootLevel : styles.nestedLevel}>
          <div className={styles.tabBar}>
            {level === 0 && (
              <button
                type="button"
                className={`${styles.tab} ${activePath[0] === 'general' ? styles.tabActive : ''}`}
                onClick={() => setActivePath(['general'])}
              >
                General
              </button>
            )}
            {pages.map((page) => (
              <button
                key={page.id}
                type="button"
                className={`${styles.tab} ${activePath[level] === page.id ? styles.tabActive : ''} ${
                  page.type === 'menu' ? styles.tabMenu : ''
                }`}
                onClick={() => selectAt(level, page.id)}
              >
                {page.title}
              </button>
            ))}
            <AddPageSelect label="+ Add page" onAdd={(type) => addPageAt(level, type)} />
          </div>

          {level === 0 && activePath[0] === 'general' && (
            <div className={styles.grid}>
              <div className={styles.section}>
                <h2>Environment</h2>
                <div className={styles.field}>
                  <label>Screen title</label>
                  <input
                    type="text"
                    value={state.envName}
                    onChange={(e) => update({ envName: e.target.value })}
                  />
                </div>
              </div>

              <div className={styles.section}>
                <h2>Alert Banner</h2>
                <div className={styles.field}>
                  <label>Level</label>
                  <select
                    value={state.alertLevel}
                    onChange={(e) =>
                      update({ alertLevel: e.target.value as 'none' | 'yellow' | 'red' })
                    }
                  >
                    <option value="none">None</option>
                    <option value="yellow">Yellow</option>
                    <option value="red">Red</option>
                  </select>
                </div>
                <div className={styles.field}>
                  <label>Title</label>
                  <input
                    type="text"
                    value={state.alertTitle}
                    onChange={(e) => update({ alertTitle: e.target.value })}
                  />
                </div>
                <div className={styles.field}>
                  <label>Description</label>
                  <textarea
                    rows={3}
                    value={state.alertDescription}
                    onChange={(e) => update({ alertDescription: e.target.value })}
                  />
                </div>
              </div>

              <div className={styles.section}>
                <h2>Navigation</h2>
                <div className={styles.navButtons}>
                  {navEntries.map(({ page, depth, connector }) =>
                    page.type === 'menu' ? (
                      <div
                        key={page.id}
                        className={`${styles.navMenuHeader} ${
                          state.activePageId && pageContainsId(page, state.activePageId)
                            ? styles.navMenuHeaderActive
                            : ''
                        }`}
                      >
                        {connector && <span className={styles.treeConnector}>{connector}</span>}
                        {page.title}
                      </div>
                    ) : depth > 0 ? (
                      <button
                        key={page.id}
                        type="button"
                        className={`${styles.navSubItem} ${
                          state.activePageId === page.id ? styles.navSubItemActive : ''
                        }`}
                        onClick={() => setActivePage(page.id)}
                      >
                        <span className={styles.treeConnector}>{connector}</span>
                        {page.title}
                      </button>
                    ) : (
                      <ModeButton
                        key={page.id}
                        label={page.title}
                        active={state.activePageId === page.id}
                        onClick={() => setActivePage(page.id)}
                      />
                    ),
                  )}
                </div>
              </div>

              <div className={styles.section}>
                <h2>Display</h2>
                <div className={styles.field}>
                  <label>Default screen font size ({Math.round(state.fontScale * 100)}%)</label>
                  <input
                    type="range"
                    min={0.75}
                    max={2}
                    step={0.05}
                    value={state.fontScale}
                    onChange={(e) => update({ fontScale: Number(e.target.value) })}
                  />
                </div>
                <div className={styles.field}>
                  <label>Player screen orientation</label>
                  <ModeButton
                    label={state.screenFlipped ? 'Flipped 180°' : 'Normal'}
                    active={state.screenFlipped}
                    onClick={() => update((prev) => ({ screenFlipped: !prev.screenFlipped }))}
                  />
                </div>
              </div>

              <div className={styles.section} style={{ gridColumn: '1 / -1' }}>
                <h2>Map</h2>
                <div className={styles.field}>
                  <label>Image URL (leave blank to show default course plot)</label>
                  <input
                    type="text"
                    placeholder="https://... or /maps/deck-b.png"
                    value={state.mapImageUrl}
                    onChange={(e) => update({ mapImageUrl: e.target.value })}
                  />
                </div>
              </div>
            </div>
          )}

          {selected && (
            <div className={styles.pageEditor}>
              <div className={styles.pageEditorHeader}>
                <div className={styles.field} style={{ flex: 1 }}>
                  <label>Title</label>
                  <input
                    type="text"
                    value={selected.title}
                    onChange={(e) => updatePage(selected.id, { title: e.target.value })}
                  />
                </div>
                <button
                  type="button"
                  className={styles.removePageButton}
                  onClick={() => {
                    if (window.confirm(`Remove page "${selected.title}"?`)) {
                      removePageAt(level, selected.id);
                    }
                  }}
                >
                  Remove page
                </button>
              </div>

              {selected.type !== 'menu' && selected.type !== 'image' && (
                <div className={styles.field}>
                  <label>Font size ({Math.round(selected.fontScale * 100)}%)</label>
                  <input
                    type="range"
                    min={0.75}
                    max={2}
                    step={0.05}
                    value={selected.fontScale}
                    onChange={(e) => updatePage(selected.id, { fontScale: Number(e.target.value) })}
                  />
                </div>
              )}

              {selected.type === 'characterList' ? (
                <CrewEditor crew={selected.crew} onChange={(crew) => updatePage(selected.id, { crew })} />
              ) : selected.type === 'ship' ? (
                <>
                  <ShipEditor ship={selected.ship} onChange={(ship) => updatePage(selected.id, { ship })} />
                  <div className={styles.field}>
                    <label>Info</label>
                    <textarea
                      rows={6}
                      value={selected.body}
                      onChange={(e) => updatePage(selected.id, { body: e.target.value })}
                    />
                  </div>
                </>
              ) : selected.type === 'text' ? (
                <div className={styles.field}>
                  <label>Body</label>
                  <textarea
                    rows={18}
                    value={selected.body}
                    onChange={(e) => updatePage(selected.id, { body: e.target.value })}
                  />
                </div>
              ) : selected.type === 'image' ? (
                <>
                  <div className={styles.field}>
                    <label>Image URL</label>
                    <input
                      type="text"
                      placeholder="https://..."
                      value={selected.imageUrl}
                      onChange={(e) => updatePage(selected.id, { imageUrl: e.target.value })}
                    />
                  </div>
                  <div className={styles.field}>
                    <label>Green CRT filter</label>
                    <ModeButton
                      label={selected.greenFilter ? 'On' : 'Off'}
                      active={selected.greenFilter}
                      onClick={() => updatePage(selected.id, { greenFilter: !selected.greenFilter })}
                    />
                  </div>
                </>
              ) : null}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
