import { Panel } from '../components/Panel';
import { CoursePlot } from '../components/CoursePlot';
import { ModeButton } from '../components/ModeButton';
import { InfoPage } from '../components/InfoPage';
import { CrewGrid } from '../components/CrewGrid';
import { ShipDisplay } from '../components/ShipDisplay';
import { useGameState } from '../state/useGameState';
import { PAGE_IDS } from '../state/gameState';
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
  const contentFontScale = state.activePage ? state.pages[state.activePage].fontScale : state.fontScale;

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
            {PAGE_IDS.map((id) => (
              <ModeButton key={id} label={state.pages[id].title} active={state.activePage === id} />
            ))}
          </div>
        </Panel>

        <Panel className={styles.centerPanel}>
          <div className={styles.contentScale} style={{ fontSize: `${contentFontScale}rem` }}>
            {state.activePage === 'crew' ? (
              <CrewGrid crew={state.crew} />
            ) : state.activePage === 'ship' ? (
              <ShipDisplay ship={state.ship} info={state.pages.ship.body} />
            ) : state.activePage ? (
              <InfoPage {...state.pages[state.activePage]} />
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
