import type { CrewMember } from '../state/gameState';
import styles from './CrewGrid.module.css';

function stressClass(stress: number) {
  if (stress >= 8) return styles.critical;
  if (stress >= 5) return styles.warning;
  return '';
}

function healthClass(health: number, maxHealth: number) {
  if (health <= 0) return styles.critical;
  if (health < maxHealth / 2) return styles.warning;
  return '';
}

function woundsClass(wounds: number, maxWounds: number) {
  if (wounds >= maxWounds) return styles.critical;
  if (wounds >= maxWounds / 2) return styles.warning;
  return '';
}

const STATUS_LABEL: Record<CrewMember['status'], string | null> = {
  active: null,
  mia: 'MIA',
  deceased: 'DECEASED',
};

export function CrewGrid({ crew }: { crew: CrewMember[] }) {
  if (crew.length === 0) {
    return <div className={styles.empty}>No crew registered.</div>;
  }

  return (
    <div className={styles.grid}>
      {crew.map((member) => {
        const statusLabel = STATUS_LABEL[member.status];
        return (
          <div
            key={member.id}
            className={`${styles.card} ${member.status === 'mia' ? styles.cardMia : ''} ${
              member.status === 'deceased' ? styles.cardDeceased : ''
            }`}
          >
            <div className="crt-glow-text">
              <div className={styles.name}>{member.name || 'Unnamed'}</div>
              <div className={styles.className}>{member.className}</div>
            </div>
            <div className={styles.body}>
              <div className={styles.portraitWrap}>
                {member.portraitUrl ? (
                  <img src={member.portraitUrl} alt="" className={styles.portrait} />
                ) : (
                  <div className={styles.portraitPlaceholder} />
                )}
                {statusLabel && (
                  <div
                    className={`${styles.statusOverlay} ${
                      member.status === 'mia' ? styles.statusMia : styles.statusDeceased
                    }`}
                  >
                    {statusLabel}
                  </div>
                )}
              </div>
              <div className={styles.stats}>
                <div className={styles.statRow}>
                  <span>Stress</span>
                  <span className={stressClass(member.stress)}>{member.stress}</span>
                </div>
                <div className={styles.statRow}>
                  <span>Health</span>
                  <span className={healthClass(member.health, member.maxHealth)}>
                    {member.health} / {member.maxHealth}
                  </span>
                </div>
                <div className={styles.statRow}>
                  <span>Wounds</span>
                  <span className={woundsClass(member.wounds, member.maxWounds)}>
                    {member.wounds} / {member.maxWounds}
                  </span>
                </div>
                {member.condition && (
                  <div className={styles.condition}>{member.condition}</div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
