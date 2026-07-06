import { useState } from 'react';
import type { ShipInfo } from '../state/gameState';
import styles from './ShipDisplay.module.css';

interface ShipDisplayProps {
  ship: ShipInfo;
  info: string;
}

export function ShipDisplay({ ship, info }: ShipDisplayProps) {
  const [showMap, setShowMap] = useState(false);
  const meta = [ship.type, ship.shipId].filter(Boolean).join(' · ');

  return (
    <div className={styles.wrap}>
      <div className={`${styles.header} crt-glow-text`}>
        <div className={styles.headerRow}>
          <div>
            <div className={styles.shipName}>{ship.name || 'Unnamed Vessel'}</div>
            {meta && <div className={styles.shipMeta}>{meta}</div>}
          </div>
          {ship.mapUrl && (
            <button type="button" className={styles.mapButton} onClick={() => setShowMap(true)}>
              Ship Map
            </button>
          )}
        </div>
      </div>

      <div className={styles.systemsGrid}>
        {ship.systems.length === 0 ? (
          <div className={styles.empty}>No systems registered.</div>
        ) : (
          ship.systems.map((system) => (
            <div className={styles.systemCard} data-status={system.status} key={system.id}>
              <div className={`${styles.systemName} crt-glow-text`}>
                {system.name || 'Unnamed system'}
              </div>
              <div className={styles.statusBadge}>{system.status.toUpperCase()}</div>
              <div className={styles.energyBar}>
                <div className={styles.energyFill} style={{ width: `${system.energy}%` }} />
              </div>
              <div className={styles.energyValue}>{system.energy}%</div>
            </div>
          ))
        )}
      </div>

      {info && <div className={styles.info}>{info}</div>}

      {showMap && ship.mapUrl && (
        <div className={styles.mapOverlay} onClick={() => setShowMap(false)}>
          <div className={styles.mapModal} onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className={styles.mapClose}
              onClick={() => setShowMap(false)}
              aria-label="Close ship map"
            >
              ×
            </button>
            <img src={ship.mapUrl} alt="Ship map" className={styles.mapImage} />
          </div>
        </div>
      )}
    </div>
  );
}
