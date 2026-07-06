import { useState } from 'react';
import { ModeButton } from '../components/ModeButton';
import { CrewEditor } from '../components/CrewEditor';
import { ShipEditor } from '../components/ShipEditor';
import {
  PAGE_IDS,
  type CrewMember,
  type PageContent,
  type PageId,
  type ShipInfo,
} from '../state/gameState';
import { useGameState } from '../state/useGameState';
import styles from './GMPanel.module.css';

type GMTab = 'general' | PageId;

export function GMPanel() {
  const { state, update } = useGameState();
  const [activeTab, setActiveTab] = useState<GMTab>('general');

  function openPlayerWindow() {
    window.open('/player', 'mothership-player-view', 'width=1280,height=800');
  }

  function setActivePage(id: PageId) {
    update((prev) => ({ activePage: prev.activePage === id ? null : id }));
  }

  function updatePage(id: PageId, patch: Partial<PageContent>) {
    update((prev) => ({ pages: { ...prev.pages, [id]: { ...prev.pages[id], ...patch } } }));
  }

  function updateCrew(crew: CrewMember[]) {
    update({ crew });
  }

  function updateShip(ship: ShipInfo) {
    update({ ship });
  }

  const tabs: { id: GMTab; label: string }[] = [
    { id: 'general', label: 'General' },
    ...PAGE_IDS.map((id) => ({ id: id as GMTab, label: state.pages[id].title })),
  ];

  return (
    <div className={`${styles.wrap} crt-glow-text`}>
      <div className={styles.header}>
        <h1>GM CONSOLE</h1>
        <button type="button" className={styles.openButton} onClick={openPlayerWindow}>
          Open Player View
        </button>
      </div>

      <div className={styles.tabBar}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`${styles.tab} ${activeTab === tab.id ? styles.tabActive : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'general' && (
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
              {PAGE_IDS.map((id) => (
                <ModeButton
                  key={id}
                  label={state.pages[id].title}
                  active={state.activePage === id}
                  onClick={() => setActivePage(id)}
                />
              ))}
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

      {PAGE_IDS.map(
        (id) =>
          activeTab === id && (
            <div className={styles.pageEditor} key={id}>
              <div className={styles.field}>
                <label>Title</label>
                <input
                  type="text"
                  value={state.pages[id].title}
                  onChange={(e) => updatePage(id, { title: e.target.value })}
                />
              </div>
              <div className={styles.field}>
                <label>Font size ({Math.round(state.pages[id].fontScale * 100)}%)</label>
                <input
                  type="range"
                  min={0.75}
                  max={2}
                  step={0.05}
                  value={state.pages[id].fontScale}
                  onChange={(e) => updatePage(id, { fontScale: Number(e.target.value) })}
                />
              </div>
              {id === 'crew' ? (
                <CrewEditor crew={state.crew} onChange={updateCrew} />
              ) : id === 'ship' ? (
                <>
                  <ShipEditor ship={state.ship} onChange={updateShip} />
                  <div className={styles.field}>
                    <label>Info</label>
                    <textarea
                      rows={6}
                      value={state.pages[id].body}
                      onChange={(e) => updatePage(id, { body: e.target.value })}
                    />
                  </div>
                </>
              ) : (
                <div className={styles.field}>
                  <label>Body</label>
                  <textarea
                    rows={18}
                    value={state.pages[id].body}
                    onChange={(e) => updatePage(id, { body: e.target.value })}
                  />
                </div>
              )}
            </div>
          ),
      )}
    </div>
  );
}
