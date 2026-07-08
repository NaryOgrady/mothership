import { Panel } from '../components/Panel';
import { CoursePlot } from '../components/CoursePlot';
import { ModeButton } from '../components/ModeButton';
import { InfoPage } from '../components/InfoPage';
import { CrewGrid } from '../components/CrewGrid';
import { ShipDisplay } from '../components/ShipDisplay';
import { ImageDisplay } from '../components/ImageDisplay';
import { useGameState } from '../state/useGameState';
import { flattenForNav, pageContainsId } from '../state/gameState';
import styles from './PlayerView.module.css';

function LogoMark() {
  return (
    <svg width="34" height="34" viewBox="0 0 34 34" fill="none">
      <circle cx="17" cy="17" r="16" stroke="currentColor" />
      <path d="M5 13 L17 21 L29 13" stroke="currentColor" strokeWidth={1.5} />
      <path d="M5 13 L17 5 L29 13" stroke="currentColor" strokeWidth={1.5} />
    </svg>
  );
}

function DiamondMark() {
  return (
    <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
      <rect x="1" y="1" width="28" height="28" stroke="currentColor" />
      <rect x="10" y="10" width="10" height="10" transform="rotate(45 15 15)" stroke="currentColor" />
    </svg>
  );
}

export function PlayerView() {
  const { state } = useGameState();
  const navEntries = flattenForNav(state.pages);
  const activePage = navEntries.find(({ page }) => page.id === state.activePageId)?.page ?? null;
  const contentFontScale =
    activePage && activePage.type !== 'menu' && activePage.type !== 'image'
      ? activePage.fontScale
      : state.fontScale;

  return (
    <div className={`crt-screen ${styles.screen} ${state.screenFlipped ? styles.flipped : ''}`}>
      <div className={styles.header}>
        <div className={styles.headerBar}>
          <div className={styles.logo}>
            <LogoMark />
          </div>
          <div className={`${styles.envName} crt-glow-text`}>{state.envName}</div>
        </div>
        <div className={styles.menu}>
          <span>1 Data</span>
          <span>3 Destination</span>
          <span>2 Course</span>
          <span>4 Freight</span>
        </div>
        <div className={styles.diamond}>
          <DiamondMark />
        </div>
      </div>

      {state.alertLevel !== 'none' && (
        <div
          className={`${styles.alertOverlay} ${
            state.alertLevel === 'red' ? styles.alertRed : styles.alertYellow
          }`}
        >
          <div className={styles.alertTitle}>{state.alertTitle}</div>
          {state.alertDescription && (
            <div className={styles.alertDescription}>{state.alertDescription}</div>
          )}
        </div>
      )}

      <div className={styles.body}>
        <Panel className={styles.leftPanel}>
          <div className={styles.navList}>
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
                <div
                  key={page.id}
                  className={`${styles.navSubItem} ${
                    state.activePageId === page.id ? styles.navSubItemActive : ''
                  }`}
                >
                  <span className={styles.treeConnector}>{connector}</span>
                  {page.title}
                </div>
              ) : (
                <ModeButton key={page.id} label={page.title} active={state.activePageId === page.id} />
              ),
            )}
          </div>
        </Panel>

        <Panel className={styles.centerPanel}>
          <div className={styles.contentScale} style={{ fontSize: `${contentFontScale}rem` }}>
            {activePage?.type === 'characterList' ? (
              <CrewGrid crew={activePage.crew} />
            ) : activePage?.type === 'ship' ? (
              <ShipDisplay ship={activePage.ship} info={activePage.body} />
            ) : activePage?.type === 'text' ? (
              <InfoPage title={activePage.title} body={activePage.body} />
            ) : activePage?.type === 'image' ? (
              <ImageDisplay imageUrl={activePage.imageUrl} greenFilter={activePage.greenFilter} />
            ) : state.mapImageUrl ? (
              <img src={state.mapImageUrl} alt="" className={styles.mapImage} />
            ) : (
              <CoursePlot />
            )}
          </div>
        </Panel>
      </div>
    </div>
  );
}
