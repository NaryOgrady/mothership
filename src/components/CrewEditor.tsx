import type { CrewMember } from '../state/gameState';
import styles from './CrewEditor.module.css';

const CLASS_OPTIONS = ['Marine', 'Android', 'Scientist', 'Teamster'];

function makeCrewMember(): CrewMember {
  return {
    id: crypto.randomUUID(),
    name: '',
    className: '',
    portraitUrl: '',
    stress: 2,
    health: 10,
    maxHealth: 10,
    wounds: 0,
    maxWounds: 2,
    condition: '',
    status: 'active',
  };
}

interface CrewEditorProps {
  crew: CrewMember[];
  onChange: (crew: CrewMember[]) => void;
}

export function CrewEditor({ crew, onChange }: CrewEditorProps) {
  function updateMember(id: string, patch: Partial<CrewMember>) {
    onChange(crew.map((m) => (m.id === id ? { ...m, ...patch } : m)));
  }

  function removeMember(id: string) {
    onChange(crew.filter((m) => m.id !== id));
  }

  return (
    <div className={styles.editor}>
      {crew.map((member) => (
        <div className={styles.card} key={member.id}>
          {member.portraitUrl ? (
            <img src={member.portraitUrl} alt="" className={styles.portraitPreview} />
          ) : (
            <div className={styles.portraitPlaceholder} />
          )}

          <div className={styles.fields}>
            <label className={styles.fieldGroup}>
              Name
              <input
                type="text"
                value={member.name}
                onChange={(e) => updateMember(member.id, { name: e.target.value })}
              />
            </label>
            <label className={styles.fieldGroup}>
              Class
              <input
                type="text"
                list="crew-class-options"
                value={member.className}
                onChange={(e) => updateMember(member.id, { className: e.target.value })}
              />
            </label>
            <label className={styles.fieldGroup}>
              Stress
              <input
                type="number"
                value={member.stress}
                onChange={(e) => updateMember(member.id, { stress: Number(e.target.value) })}
              />
            </label>
            <label className={styles.fieldGroup}>
              HP
              <input
                type="number"
                value={member.health}
                onChange={(e) => updateMember(member.id, { health: Number(e.target.value) })}
              />
            </label>
            <label className={styles.fieldGroup}>
              Max HP
              <input
                type="number"
                value={member.maxHealth}
                onChange={(e) => updateMember(member.id, { maxHealth: Number(e.target.value) })}
              />
            </label>
            <label className={styles.fieldGroup}>
              Wounds
              <input
                type="number"
                value={member.wounds}
                onChange={(e) => updateMember(member.id, { wounds: Number(e.target.value) })}
              />
            </label>
            <label className={styles.fieldGroup}>
              Max Wounds
              <input
                type="number"
                value={member.maxWounds}
                onChange={(e) => updateMember(member.id, { maxWounds: Number(e.target.value) })}
              />
            </label>
            <label className={`${styles.fieldGroup} ${styles.span2}`}>
              Condition
              <input
                type="text"
                value={member.condition}
                onChange={(e) => updateMember(member.id, { condition: e.target.value })}
              />
            </label>
            <label className={`${styles.fieldGroup} ${styles.span2}`}>
              Portrait URL
              <input
                type="text"
                placeholder="https://..."
                value={member.portraitUrl}
                onChange={(e) => updateMember(member.id, { portraitUrl: e.target.value })}
              />
            </label>
            <label className={styles.fieldGroup}>
              Status
              <select
                value={member.status}
                onChange={(e) =>
                  updateMember(member.id, { status: e.target.value as CrewMember['status'] })
                }
              >
                <option value="active">Active</option>
                <option value="mia">MIA</option>
                <option value="deceased">Deceased</option>
              </select>
            </label>
          </div>

          <button
            type="button"
            className={styles.removeButton}
            onClick={() => removeMember(member.id)}
            aria-label={`Remove ${member.name || 'crew member'}`}
          >
            ×
          </button>
        </div>
      ))}

      <datalist id="crew-class-options">
        {CLASS_OPTIONS.map((c) => (
          <option key={c} value={c} />
        ))}
      </datalist>

      <button type="button" className={styles.addButton} onClick={() => onChange([...crew, makeCrewMember()])}>
        + Add crew member
      </button>
    </div>
  );
}
