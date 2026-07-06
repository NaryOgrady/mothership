import type { ShipInfo, ShipSystem } from '../state/gameState';
import styles from './ShipEditor.module.css';

const STATUS_OPTIONS: ShipSystem['status'][] = ['active', 'inactive', 'damaged', 'unknown'];

function makeSystem(): ShipSystem {
  return { id: crypto.randomUUID(), name: '', energy: 100, status: 'active' };
}

interface ShipEditorProps {
  ship: ShipInfo;
  onChange: (ship: ShipInfo) => void;
}

export function ShipEditor({ ship, onChange }: ShipEditorProps) {
  function updateField(patch: Partial<ShipInfo>) {
    onChange({ ...ship, ...patch });
  }

  function updateSystem(id: string, patch: Partial<ShipSystem>) {
    onChange({
      ...ship,
      systems: ship.systems.map((s) => (s.id === id ? { ...s, ...patch } : s)),
    });
  }

  function removeSystem(id: string) {
    onChange({ ...ship, systems: ship.systems.filter((s) => s.id !== id) });
  }

  return (
    <div className={styles.editor}>
      <div className={styles.statsRow}>
        <label className={styles.fieldGroup}>
          Name
          <input
            type="text"
            value={ship.name}
            onChange={(e) => updateField({ name: e.target.value })}
          />
        </label>
        <label className={styles.fieldGroup}>
          Type
          <input
            type="text"
            value={ship.type}
            onChange={(e) => updateField({ type: e.target.value })}
          />
        </label>
        <label className={styles.fieldGroup}>
          Ship ID
          <input
            type="text"
            value={ship.shipId}
            onChange={(e) => updateField({ shipId: e.target.value })}
          />
        </label>
      </div>

      <label className={styles.fieldGroup}>
        Ship map image URL
        <input
          type="text"
          placeholder="https://... or /maps/ship-deck.png"
          value={ship.mapUrl}
          onChange={(e) => updateField({ mapUrl: e.target.value })}
        />
      </label>

      <div className={styles.systemsHeader}>Systems</div>

      {ship.systems.map((system) => (
        <div className={styles.systemRow} key={system.id}>
          <input
            type="text"
            placeholder="System name"
            value={system.name}
            onChange={(e) => updateSystem(system.id, { name: e.target.value })}
          />
          <input
            type="number"
            min={0}
            max={100}
            value={system.energy}
            onChange={(e) => updateSystem(system.id, { energy: Number(e.target.value) })}
          />
          <select
            value={system.status}
            onChange={(e) =>
              updateSystem(system.id, { status: e.target.value as ShipSystem['status'] })
            }
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s[0].toUpperCase() + s.slice(1)}
              </option>
            ))}
          </select>
          <button
            type="button"
            className={styles.removeButton}
            onClick={() => removeSystem(system.id)}
            aria-label={`Remove ${system.name || 'system'}`}
          >
            ×
          </button>
        </div>
      ))}

      <button
        type="button"
        className={styles.addButton}
        onClick={() => onChange({ ...ship, systems: [...ship.systems, makeSystem()] })}
      >
        + Add system
      </button>
    </div>
  );
}
