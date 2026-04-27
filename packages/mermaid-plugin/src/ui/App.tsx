import { useEffect, useMemo, useRef, useState } from 'react';
import mermaid from 'mermaid';
import { Clipboard, Download, FileText, Upload } from 'lucide-react';
import happyPath from '../fixtures/happy-path.mmd?raw';
import { parseMermaid } from '../domain/parser';
import { serializeMermaid } from '../domain/serializer';
import type { DiagramEntity, DiagramModel } from '../domain/types';

mermaid.initialize({
  startOnLoad: false,
  securityLevel: 'loose',
  flowchart: { htmlLabels: true },
  theme: 'base',
});

type PanelTab = 'details' | 'info' | 'issues' | 'export';

const STORAGE_PREFIX = 'mermaid-plugin:basePath:';

export function App() {
  const [source, setSource] = useState(happyPath);
  const [renderedSvg, setRenderedSvg] = useState('');
  const [renderError, setRenderError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [tab, setTab] = useState<PanelTab>('details');
  const [promptRequest, setPromptRequest] = useState('Refine this diagram using my latest notes.');
  const [descriptionDrafts, setDescriptionDrafts] = useState<Record<string, string>>({});
  const renderCounter = useRef(0);

  const parsed = useMemo(() => parseMermaid(source), [source]);
  const model = useMemo(() => applyLocalBasePathOverrides(parsed), [parsed]);
  const selected = selectedId ? findEntity(model, selectedId) : null;
  const exportSource = useMemo(() => serializeMermaid(model), [model]);

  useEffect(() => {
    let cancelled = false;
    const renderId = `diagram-${renderCounter.current++}`;
    mermaid
      .render(renderId, source)
      .then(({ svg }) => {
        if (!cancelled) {
          setRenderedSvg(svg);
          setRenderError(null);
        }
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setRenderedSvg('');
          setRenderError(error instanceof Error ? error.message : String(error));
        }
      });
    return () => {
      cancelled = true;
    };
  }, [source]);

  useEffect(() => {
    setDescriptionDrafts(Object.fromEntries([
      ...Object.values(model.nodes).map((node) => [node.id, node.description ?? '']),
      ...Object.values(model.files).map((file) => [file.id, file.description ?? '']),
    ]));
  }, [model]);

  function importFile(file: File | undefined) {
    if (!file) return;
    file.text().then(setSource).catch((error: unknown) => {
      setRenderError(error instanceof Error ? error.message : String(error));
    });
  }

  function handleDiagramClick(event: React.MouseEvent<HTMLDivElement>) {
    const target = event.target as Element;
    const clickable = target.closest('g.node,g.cluster,[id^="flowchart-"]');
    const mermaidId = clickable ? extractMermaidId(clickable.id, model) : null;
    if (!mermaidId) return;
    setSelectedId((current) => (current === mermaidId ? null : mermaidId));
    setTab('details');
  }

  function updateBasePath(name: string, value: string) {
    localStorage.setItem(`${STORAGE_PREFIX}${name}`, value);
    setSource((current: string) => `${current}`);
  }

  function saveDescription(id: string) {
    const value = limitDescription(descriptionDrafts[id] ?? '');
    setSource((current: string) => upsertDescription(current, id, value));
  }

  function copyPrompt() {
    const prompt = [
      'You are editing a Mermaid flowchart for an interactive code-diagram webapp.',
      'Use <br/> between code-node label fields and " | " between file-subgraph title fields.',
      'Files must be subgraphs with IDs prefixed file_. Do not emit JSON or click directives.',
      '',
      `User request: ${promptRequest}`,
      '',
      'Current diagram:',
      '```mermaid',
      exportSource,
      '```',
    ].join('\n');
    void navigator.clipboard.writeText(prompt);
  }

  return (
    <main className="app-shell">
      <section className="workspace">
        <header className="topbar">
          <div>
            <h1>Mermaid Code Diagrams</h1>
            <p>Import Claude-authored flowcharts, inspect code nodes, edit light metadata, and export back to Mermaid.</p>
          </div>
          <div className="topbar-actions">
            <label className="icon-button" title="Upload Mermaid or Markdown">
              <Upload size={18} />
              <input type="file" accept=".md,.mmd,.txt" onChange={(event) => importFile(event.target.files?.[0])} />
            </label>
            <button className="icon-button" title="Copy exported Mermaid" onClick={() => navigator.clipboard.writeText(exportSource)}>
              <Clipboard size={18} />
            </button>
            <button className="icon-button" title="Download Markdown" onClick={() => downloadText('diagram.md', `\`\`\`mermaid\n${exportSource}\n\`\`\`\n`)}>
              <Download size={18} />
            </button>
          </div>
        </header>

        <div className="main-grid">
          <section className="source-pane">
            <div className="pane-title">
              <FileText size={16} />
              <span>Mermaid Source</span>
            </div>
            <textarea value={source} spellCheck={false} onChange={(event) => setSource(event.target.value)} />
          </section>

          <section className="diagram-pane">
            {renderError ? (
              <pre className="render-error">{renderError}</pre>
            ) : (
              <div className="diagram-surface" onClick={handleDiagramClick} dangerouslySetInnerHTML={{ __html: renderedSvg }} />
            )}
          </section>
        </div>
      </section>

      <aside className="side-panel">
        <nav className="panel-tabs">
          <button className={tab === 'details' ? 'active' : ''} onClick={() => setTab('details')}>Details</button>
          <button className={tab === 'info' ? 'active' : ''} onClick={() => setTab('info')}>Info</button>
          <button className={tab === 'issues' ? 'active' : ''} onClick={() => setTab('issues')}>Issues {model.issues.length}</button>
          <button className={tab === 'export' ? 'active' : ''} onClick={() => setTab('export')}>Export</button>
        </nav>

        {tab === 'details' && (
          <DetailsPanel
            entity={selected}
            model={model}
            descriptionDrafts={descriptionDrafts}
            setDescriptionDrafts={setDescriptionDrafts}
            saveDescription={saveDescription}
          />
        )}

        {tab === 'info' && (
          <InfoPanel model={model} updateBasePath={updateBasePath} />
        )}

        {tab === 'issues' && (
          <IssuesPanel model={model} />
        )}

        {tab === 'export' && (
          <ExportPanel
            exportSource={exportSource}
            promptRequest={promptRequest}
            setPromptRequest={setPromptRequest}
            copyPrompt={copyPrompt}
          />
        )}
      </aside>
    </main>
  );
}

function DetailsPanel(props: {
  entity: DiagramEntity | null;
  model: DiagramModel;
  descriptionDrafts: Record<string, string>;
  setDescriptionDrafts: (value: Record<string, string>) => void;
  saveDescription: (id: string) => void;
}) {
  const { entity, model, descriptionDrafts, setDescriptionDrafts, saveDescription } = props;
  if (!entity) {
    return <div className="empty-state">Click a rendered node, file subgraph, or group to inspect it.</div>;
  }

  const isCode = entity.type === 'code';
  const isFile = entity.type === 'file';
  const code = isCode ? entity.code : undefined;
  const file = isFile ? entity : null;
  const groupIds = 'groupIds' in entity ? entity.groupIds : [];

  return (
    <section className="panel-section">
      <h2>{entity.id}</h2>
      <dl className="metadata-list">
        <dt>Type</dt>
        <dd>{entity.type}</dd>
        {(code || file) && (
          <>
            <dt>Path</dt>
            <dd>{code?.path ?? file?.path}</dd>
            <dt>Full Path</dt>
            <dd>{resolveFullPath(model, code?.basePathName ?? file?.basePathName, code?.relativePath ?? file?.relativePath ?? '')}</dd>
            {code && (
              <>
                <dt>Lines</dt>
                <dd>{code.startLine}-{code.endLine}</dd>
              </>
            )}
            <dt>Identifier</dt>
            <dd>{code?.identifier ?? file?.identifier}</dd>
            <dt>Git URL</dt>
            <dd>{code?.gitUrl || file?.gitUrl || '(empty)'}</dd>
          </>
        )}
        {'note' in entity && entity.note && (
          <>
            <dt>Note</dt>
            <dd>{entity.note}</dd>
          </>
        )}
        <dt>Groups</dt>
        <dd>{groupIds.length ? groupIds.join(', ') : '(none)'}</dd>
      </dl>

      <div className="button-row">
        {code && <button onClick={() => navigator.clipboard.writeText(`${resolveFullPath(model, code.basePathName, code.relativePath)}:${code.startLine}`)}>Copy path:line</button>}
        {file && <button onClick={() => navigator.clipboard.writeText(resolveFullPath(model, file.basePathName, file.relativePath))}>Copy filepath</button>}
      </div>

      {'description' in entity && (
        <label className="field-block">
          Description
          <textarea
            value={descriptionDrafts[entity.id] ?? ''}
            onChange={(event) => setDescriptionDrafts({ ...descriptionDrafts, [entity.id]: event.target.value })}
            rows={4}
          />
          <button onClick={() => saveDescription(entity.id)}>Save description</button>
        </label>
      )}

      {'overlaps' in entity && entity.overlaps.length > 0 && (
        <div className="warning-box">
          <strong>Overlaps</strong>
          {entity.overlaps.map((overlap) => (
            <p key={overlap.nodeId}>{overlap.nodeId} on lines {overlap.startLine}-{overlap.endLine}</p>
          ))}
        </div>
      )}
    </section>
  );
}

function InfoPanel({ model, updateBasePath }: { model: DiagramModel; updateBasePath: (name: string, value: string) => void }) {
  return (
    <section className="panel-section">
      <h2>Diagram</h2>
      <p className="description-text">{model.diagramDescription?.replaceAll('<br/>', '\n') || '(no description)'}</p>

      <h2>Base Paths</h2>
      {Object.values(model.basePaths).map((basePath) => (
        <label className="field-block" key={basePath.name}>
          @{basePath.name}
          <input defaultValue={basePath.localPath} onBlur={(event) => updateBasePath(basePath.name, event.target.value)} />
        </label>
      ))}

      <h2>Legend</h2>
      <div className="legend-list">
        {model.legend.map((entry) => (
          <div className="legend-row" key={`${entry.color}-${entry.meaning}`}>
            <span style={{ background: entry.color }} />
            <p>{entry.meaning}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function IssuesPanel({ model }: { model: DiagramModel }) {
  const text = model.issues.map((issue) => `${issue.severity.toUpperCase()} ${issue.nodeId ?? 'Diagram'}: ${issue.message}`).join('\n');
  return (
    <section className="panel-section">
      <div className="button-row">
        <button onClick={() => navigator.clipboard.writeText(text)}>Copy issues</button>
      </div>
      {model.issues.length === 0 ? (
        <div className="empty-state">No parser issues.</div>
      ) : (
        <ul className="issue-list">
          {model.issues.map((issue) => (
            <li key={issue.id} className={issue.severity}>
              <strong>{issue.severity}</strong>
              <span>{issue.nodeId ?? 'Diagram'}</span>
              <p>{issue.message}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function ExportPanel(props: {
  exportSource: string;
  promptRequest: string;
  setPromptRequest: (value: string) => void;
  copyPrompt: () => void;
}) {
  return (
    <section className="panel-section">
      <div className="button-row">
        <button onClick={() => navigator.clipboard.writeText(props.exportSource)}>Copy Mermaid</button>
        <button onClick={() => downloadText('diagram.mmd', props.exportSource)}>Download .mmd</button>
      </div>
      <textarea className="export-text" value={props.exportSource} readOnly />
      <label className="field-block">
        Claude request
        <textarea value={props.promptRequest} onChange={(event) => props.setPromptRequest(event.target.value)} rows={3} />
      </label>
      <button onClick={props.copyPrompt}>Copy prompt for Claude</button>
    </section>
  );
}

function applyLocalBasePathOverrides(model: DiagramModel): DiagramModel {
  const copy: DiagramModel = {
    ...model,
    basePaths: Object.fromEntries(
      Object.entries(model.basePaths).map(([name, value]) => [
        name,
        { ...value, localPath: localStorage.getItem(`${STORAGE_PREFIX}${name}`) ?? value.localPath },
      ]),
    ),
  };
  return copy;
}

function findEntity(model: DiagramModel, id: string): DiagramEntity | null {
  return model.nodes[id] ?? model.files[id] ?? model.groups[id] ?? null;
}

function extractMermaidId(rawId: string, model: DiagramModel): string | null {
  const ids = [...Object.keys(model.nodes), ...Object.keys(model.files), ...Object.keys(model.groups)];
  if (ids.includes(rawId)) return rawId;
  return ids.find((id) => rawId.includes(id)) ?? null;
}

function resolveFullPath(model: DiagramModel, basePathName: string | undefined, relativePath: string): string {
  const local = basePathName ? model.basePaths[basePathName]?.localPath : undefined;
  return local ? `${local.replace(/[\\/]+$/, '')}/${relativePath}` : relativePath;
}

function upsertDescription(source: string, id: string, value: string): string {
  const lines = source.split(/\r?\n/);
  const descLine = `%% desc:${id} = ${value}`;
  const existingIndex = lines.findIndex((line) => line.match(new RegExp(`^%%\\s*desc:${escapeRegExp(id)}\\s*=`)));
  if (existingIndex >= 0) {
    lines[existingIndex] = descLine;
    return lines.join('\n');
  }
  const entityIndex = lines.findIndex((line) => new RegExp(`^\\s*${escapeRegExp(id)}(?:\\[|>|::|\\s|$)`).test(line) || new RegExp(`^\\s*subgraph\\s+${escapeRegExp(id)}\\b`).test(line));
  lines.splice(entityIndex >= 0 ? entityIndex : 0, 0, descLine);
  return lines.join('\n');
}

function limitDescription(value: string): string {
  return value.split(/\r?\n|<br\/>/).slice(0, 3).map((part) => part.trim()).filter(Boolean).join('<br/>');
}

function downloadText(filename: string, text: string): void {
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
