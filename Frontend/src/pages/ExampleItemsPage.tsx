import { useEffect, useState } from 'react';
import { ApiError, errorMessage, getJson, postJson } from '../api';

type TemplateItem = {
  uuid: string;
  rollingId: number;
  name: string;
  summary: string;
  status: 'draft' | 'active' | 'archived';
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  updatedAt: string;
};

type ItemForm = {
  name: string;
  summary: string;
  status: TemplateItem['status'];
  priority: TemplateItem['priority'];
};

const EMPTY_FORM: ItemForm = {
  name: '',
  summary: '',
  status: 'draft',
  priority: 'medium',
};

const formOf = (item: TemplateItem): ItemForm => ({
  name: item.name,
  summary: item.summary,
  status: item.status,
  priority: item.priority,
});

const fetchItems = () => getJson<TemplateItem[]>('/api/template-items?limit=100');

/** Validation errors carry field-level `details`; show them, else the message. */
const describeError = (err: unknown): string => {
  if (err instanceof ApiError && err.code === 'invalid_request' && Array.isArray(err.details)) {
    const fields = (err.details as Array<{ field: string; message: string }>).map((d) => d.message);
    if (fields.length) return fields.join(' · ');
  }
  return errorMessage(err);
};

export default function ExampleItemsPage() {
  const [items, setItems] = useState<TemplateItem[]>([]);
  const [selectedUuid, setSelectedUuid] = useState<string | null>(null);
  const [form, setForm] = useState<ItemForm>(EMPTY_FORM);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const selectedItem = items.find((item) => item.uuid === selectedUuid) || null;

  const selectItem = (item: TemplateItem) => {
    setSelectedUuid(item.uuid);
    setForm(formOf(item));
  };

  const showItems = (rows: TemplateItem[]) => {
    setItems(rows);
    setLoading(false);
    if (rows.length > 0 && !selectedUuid) {
      selectItem(rows[0]);
    }
  };

  const showLoadError = (err: unknown) => {
    setError(describeError(err));
    setItems([]);
    setLoading(false);
  };

  const loadItems = () => {
    setLoading(true);
    setError('');
    fetchItems().then(showItems, showLoadError);
  };

  // Initial load. State is only set in the promise callbacks (not synchronously
  // in the effect body), and the result is ignored if the page unmounted.
  useEffect(() => {
    let active = true;
    fetchItems().then(
      (rows) => {
        if (!active) return;
        setItems(rows);
        setLoading(false);
        if (rows.length > 0) {
          setSelectedUuid(rows[0].uuid);
          setForm(formOf(rows[0]));
        }
      },
      (err: unknown) => {
        if (!active) return;
        setError(describeError(err));
        setLoading(false);
      },
    );
    return () => {
      active = false;
    };
  }, []);

  const saveNewItem = async () => {
    if (!form.name.trim()) {
      setError('Name is required.');
      return;
    }

    setSaving(true);
    setError('');
    setMessage('');

    try {
      const created = await postJson<TemplateItem>('/api/template-items', form);
      setItems((current) => [created, ...current]);
      selectItem(created);
      setMessage('Created a new example item. Replace this flow with your own domain create action.');
    } catch (err) {
      setError(describeError(err));
    } finally {
      setSaving(false);
    }
  };

  const updateItem = async () => {
    if (!selectedUuid) {
      setError('Choose an item before saving changes.');
      return;
    }

    setSaving(true);
    setError('');
    setMessage('');

    try {
      // Update is POST /:uuid — the API is GET + POST only.
      const updated = await postJson<TemplateItem>(`/api/template-items/${selectedUuid}`, form);
      setItems((current) => current.map((item) => item.uuid === updated.uuid ? updated : item));
      setMessage('Updated the selected example item.');
    } catch (err) {
      setError(describeError(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="page-stack">
      <article className="panel panel-header-row">
        <div>
          <p className="eyebrow">Example feature</p>
          <h2>Template Items</h2>
          <p className="muted-copy">
            This page demonstrates the full-stack path: React form state, NestJS API routes, a TypeORM entity, and DB seed data.
          </p>
        </div>
        <button className="secondary-btn" onClick={loadItems} disabled={loading}>
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </article>

      {error ? <p className="message error">{error}</p> : null}
      {message ? <p className="message success">{message}</p> : null}

      <section className="workspace-grid">
        <article className="panel">
          <p className="eyebrow">Seeded records</p>
          <h3>Available items</h3>
          {loading ? <p className="muted-copy">Loading items...</p> : null}
          {!loading && items.length === 0 ? (
            <p className="muted-copy">No items found. Enable the database and run the seed script to populate examples.</p>
          ) : null}
          <div className="item-list">
            {items.map((item) => (
              <button
                key={item.uuid}
                className={item.uuid === selectedUuid ? 'item-card active' : 'item-card'}
                onClick={() => selectItem(item)}
              >
                <strong>{item.name}</strong>
                <span>{item.summary || 'No summary yet.'}</span>
                <div className="pill-row compact">
                  <span className="pill">#{item.rollingId}</span>
                  <span className="pill">{item.status}</span>
                  <span className="pill">{item.priority}</span>
                </div>
              </button>
            ))}
          </div>
        </article>

        <article className="panel">
          <p className="eyebrow">Editor</p>
          <h3>{selectedItem ? `Edit item #${selectedItem.rollingId}` : 'Create an item'}</h3>

          <label className="field">
            <span>Name</span>
            <input
              value={form.name}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
              placeholder="Add your feature or model name"
            />
          </label>

          <label className="field">
            <span>Summary</span>
            <textarea
              value={form.summary}
              onChange={(event) => setForm((current) => ({ ...current, summary: event.target.value }))}
              rows={5}
              placeholder="Describe what this example represents in the template"
            />
          </label>

          <div className="field-row">
            <label className="field">
              <span>Status</span>
              <select
                value={form.status}
                onChange={(event) => setForm((current) => ({ ...current, status: event.target.value as ItemForm['status'] }))}
              >
                <option value="draft">draft</option>
                <option value="active">active</option>
                <option value="archived">archived</option>
              </select>
            </label>

            <label className="field">
              <span>Priority</span>
              <select
                value={form.priority}
                onChange={(event) => setForm((current) => ({ ...current, priority: event.target.value as ItemForm['priority'] }))}
              >
                <option value="low">low</option>
                <option value="medium">medium</option>
                <option value="high">high</option>
              </select>
            </label>
          </div>

          <div className="button-row">
            <button className="primary-btn" onClick={() => void saveNewItem()} disabled={saving}>
              {saving ? 'Saving...' : 'Create new item'}
            </button>
            <button className="secondary-btn" onClick={() => void updateItem()} disabled={saving || !selectedUuid}>
              {saving ? 'Saving...' : 'Update selected item'}
            </button>
          </div>
        </article>
      </section>
    </section>
  );
}
