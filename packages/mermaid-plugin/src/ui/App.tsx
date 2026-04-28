import { useEffect, useMemo, useRef, useState } from 'react';
import mermaid from 'mermaid';
import { Clipboard, Download, FileText, PanelLeftClose, PanelLeftOpen, PanelRightClose, PanelRightOpen, RotateCcw, Upload, ZoomIn, ZoomOut } from 'lucide-react';
import happyPath from '../fixtures/happy-path.mmd?raw';
import cochart2AgentPrompt from '../prompts/cochart2-agent.md?raw';
import { parseMermaid } from '../domain/parser';
import { serializeMermaid } from '../domain/serializer';
import type { DiagramEntity, DiagramModel } from '../domain/types';
import {
  addIdeMessageListener,
  displayReadmeInIde,
  extractIncomingText,
  extractProjectPath,
  goToLineInIde,
  isRunningInIde,
  requestProjectPath,
} from '../ide/bridge';

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
  const [ideState, setIdeState] = useState(() => ({ isInIde: isRunningInIde(), projectPath: '' }));
  const [isSourceCollapsed, setIsSourceCollapsed] = useState(true);
  const [isSideCollapsed, setIsSideCollapsed] = useState(true);
  const [viewport, setViewport] = useState({ x: 0, y: 0, scale: 1 });
  const [dragStart, setDragStart] = useState<{ pointerId: number; x: number; y: number; originX: number; originY: number } | null>(null);
  const [didDrag, setDidDrag] = useState(false);
  const renderCounter = useRef(0);

  const parsed = useMemo(() => parseMermaid(source), [source]);
  const model = useMemo(() => applyLocalBasePathOverrides(parsed), [parsed]);
  const selected = selectedId ? findEntity(model, selectedId) : null;
  const exportSource = useMemo(() => serializeMermaid(model), [model]);
  const processedSvg = useMemo(() => postProcessRenderedSvg(renderedSvg, model), [renderedSvg, model]);

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

  useEffect(() => {
    const removeListener = addIdeMessageListener((message) => {
      const projectPath = extractProjectPath(message);
      if (projectPath) {
        setIdeState({ isInIde: true, projectPath });
        return;
      }

      const incomingText = extractIncomingText(message);
      if (incomingText) {
        setSource(incomingText);
      }
    });

    if (isRunningInIde()) {
      window.setTimeout(() => requestProjectPath(), 300);
    }

    return removeListener;
  }, []);

  function importFile(file: File | undefined) {
    if (!file) return;
    file.text().then(setSource).catch((error: unknown) => {
      setRenderError(error instanceof Error ? error.message : String(error));
    });
  }

  async function pasteSourceFromClipboard() {
    const text = await navigator.clipboard.readText();
    if (text) setSource(text);
  }

  function handleDiagramClick(event: React.MouseEvent<HTMLDivElement>) {
    if (didDrag) {
      setDidDrag(false);
      return;
    }
    const target = event.target as Element;
    const clickable = target.closest('g.node,g.cluster');
    const mermaidId = clickable ? extractMermaidId(clickable.id, model) : null;
    if (!mermaidId) return;
    const entity = findEntity(model, mermaidId);
    if (!entity || (entity.type !== 'code' && entity.type !== 'file')) return;
    setSelectedId((current) => (current === mermaidId ? null : mermaidId));
    setTab('details');
    openEntityInIde(entity, model, ideState);
  }

  function handleWheel(event: React.WheelEvent<HTMLDivElement>) {
    if (!event.ctrlKey) return;
    event.preventDefault();
    const bounds = event.currentTarget.getBoundingClientRect();
    const pointerX = event.clientX - bounds.left;
    const pointerY = event.clientY - bounds.top;

    setViewport((current) => {
      const nextScale = clamp(current.scale + (event.deltaY > 0 ? -0.08 : 0.08), 0.35, 10);
      if (nextScale === current.scale) return current;

      const diagramX = (pointerX - current.x) / current.scale;
      const diagramY = (pointerY - current.y) / current.scale;

      return {
        x: pointerX - diagramX * nextScale,
        y: pointerY - diagramY * nextScale,
        scale: nextScale,
      };
    });
  }

  function startPan(event: React.PointerEvent<HTMLDivElement>) {
    if ((event.target as Element).closest('g.node,g.cluster')) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    setDragStart({ pointerId: event.pointerId, x: event.clientX, y: event.clientY, originX: viewport.x, originY: viewport.y });
    setDidDrag(false);
  }

  function movePan(event: React.PointerEvent<HTMLDivElement>) {
    if (!dragStart || dragStart.pointerId !== event.pointerId) return;
    const dx = event.clientX - dragStart.x;
    const dy = event.clientY - dragStart.y;
    if (Math.abs(dx) + Math.abs(dy) > 4) setDidDrag(true);
    setViewport((current) => ({ ...current, x: dragStart.originX + dx, y: dragStart.originY + dy }));
  }

  function endPan(event: React.PointerEvent<HTMLDivElement>) {
    if (dragStart?.pointerId === event.pointerId) {
      setDragStart(null);
    }
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
    void navigator.clipboard.writeText(buildAgentPrompt(cochart2AgentPrompt, promptRequest, exportSource));
  }

  return (
    <main className={`app-shell ${isSourceCollapsed ? 'source-collapsed' : ''} ${isSideCollapsed ? 'side-collapsed' : ''}`}>
      <section className="workspace">
        <header className="topbar">
          <div>
            <span className={ideState.isInIde ? 'ide-status connected' : 'ide-status'}>
              {ideState.isInIde ? `VS Code: ${ideState.projectPath || 'connected'}` : 'Browser mode'}
            </span>
          </div>
          <div className="topbar-actions">
            <button className="icon-button" title={isSourceCollapsed ? 'Show source' : 'Hide source'} onClick={() => setIsSourceCollapsed((value) => !value)}>
              {isSourceCollapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
            </button>
            <button className="icon-button" title={isSideCollapsed ? 'Show details panel' : 'Hide details panel'} onClick={() => setIsSideCollapsed((value) => !value)}>
              {isSideCollapsed ? <PanelRightOpen size={18} /> : <PanelRightClose size={18} />}
            </button>
            <button className="text-button" onClick={pasteSourceFromClipboard}>
              <Clipboard size={16} />
              <span>Paste from clipboard</span>
            </button>
            <button className="text-button" onClick={copyPrompt}>
              <Clipboard size={16} />
              <span>Copy prompt for agent</span>
            </button>
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
              <div className="pane-title-label">
                <FileText size={16} />
                <span>Mermaid Source</span>
              </div>
              <div className="pane-actions">
                <button title="Paste from clipboard" onClick={pasteSourceFromClipboard}>
                  <Clipboard size={15} />
                </button>
                <button title="Collapse source" onClick={() => setIsSourceCollapsed(true)}>
                  <PanelLeftClose size={15} />
                </button>
              </div>
            </div>
            <textarea value={source} spellCheck={false} onChange={(event) => setSource(event.target.value)} />
          </section>

          <section className="diagram-pane">
            <LegendOverlay model={model} />
            <div className="viewport-toolbar">
              <button title="Zoom out" onClick={() => setViewport((current) => ({ ...current, scale: clamp(current.scale - 0.15, 0.35, 10) }))}>
                <ZoomOut size={16} />
              </button>
              <span>{Math.round(viewport.scale * 100)}%</span>
              <button title="Zoom in" onClick={() => setViewport((current) => ({ ...current, scale: clamp(current.scale + 0.15, 0.35, 10) }))}>
                <ZoomIn size={16} />
              </button>
              <button title="Reset view" onClick={() => setViewport({ x: 0, y: 0, scale: 1 })}>
                <RotateCcw size={16} />
              </button>
            </div>
            {renderError ? (
              <pre className="render-error">{renderError}</pre>
            ) : (
              <div
                className={`diagram-viewport ${dragStart ? 'panning' : ''}`}
                onWheel={handleWheel}
                onPointerDown={startPan}
                onPointerMove={movePan}
                onPointerUp={endPan}
                onPointerCancel={endPan}
              >
                <div
                  className="diagram-surface"
                  style={{ transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.scale})` }}
                  onClick={handleDiagramClick}
                  dangerouslySetInnerHTML={{ __html: processedSvg }}
                />
              </div>
            )}
          </section>
        </div>
      </section>

      <aside className="side-panel">
        <button className="panel-expand" title="Show details panel" onClick={() => setIsSideCollapsed(false)}>
          <PanelRightOpen size={18} />
        </button>
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
            ideState={ideState}
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
            sendToIde={() => displayReadmeInIde(`\`\`\`mermaid\n${exportSource}\n\`\`\`\n`)}
            isInIde={ideState.isInIde}
          />
        )}
      </aside>
      <button className="source-expand" title="Show source" onClick={() => setIsSourceCollapsed(false)}>
        <PanelLeftOpen size={18} />
      </button>
    </main>
  );
}

function LegendOverlay({ model }: { model: DiagramModel }) {
  if (!model.legend.length) return null;

  return (
    <div className="diagram-legend" aria-label="Diagram legend">
      {model.legend.map((entry) => (
        <div className="diagram-legend-row" key={`${entry.color}-${entry.meaning}`}>
          <span style={{ background: entry.color }} />
          <p>{entry.meaning}</p>
        </div>
      ))}
    </div>
  );
}

function DetailsPanel(props: {
  entity: DiagramEntity | null;
  model: DiagramModel;
  descriptionDrafts: Record<string, string>;
  setDescriptionDrafts: (value: Record<string, string>) => void;
  saveDescription: (id: string) => void;
  ideState: { isInIde: boolean; projectPath: string };
}) {
  const { entity, model, descriptionDrafts, setDescriptionDrafts, saveDescription, ideState } = props;
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
        {code && ideState.isInIde && (
          <button onClick={() => goToLineInIde(ideState.projectPath, resolveFullPath(model, code.basePathName, code.relativePath), Math.max(0, code.startLine - 1))}>
            Open in VS Code
          </button>
        )}
        {file && ideState.isInIde && (
          <button onClick={() => goToLineInIde(ideState.projectPath, resolveFullPath(model, file.basePathName, file.relativePath), 0)}>
            Open in VS Code
          </button>
        )}
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
  sendToIde: () => void;
  isInIde: boolean;
}) {
  return (
    <section className="panel-section">
      <div className="button-row">
        <button onClick={() => navigator.clipboard.writeText(props.exportSource)}>Copy Mermaid</button>
        <button onClick={() => downloadText('diagram.mmd', props.exportSource)}>Download .mmd</button>
        {props.isInIde && <button onClick={props.sendToIde}>Send to IDE file</button>}
      </div>
      <textarea className="export-text" value={props.exportSource} readOnly />
      <label className="field-block">
        Claude request
        <textarea value={props.promptRequest} onChange={(event) => props.setPromptRequest(event.target.value)} rows={3} />
      </label>
      <button onClick={props.copyPrompt}>Copy prompt for agent</button>
    </section>
  );
}

function buildAgentPrompt(promptTemplate: string, request: string, currentDiagram: string): string {
  return [
    promptTemplate.replace('$ARGUMENTS', request.trim() || 'Refine or generate the requested cochart2 diagram.'),
    '',
    '## Current diagram',
    '',
    '```mermaid',
    currentDiagram,
    '```',
  ].join('\n');
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

function postProcessRenderedSvg(svg: string, model: DiagramModel): string {
  if (!svg) return svg;

  const document = new DOMParser().parseFromString(svg, 'image/svg+xml');
  for (const node of Object.values(model.nodes)) {
    if (node.type !== 'code' || !node.code) continue;
    const renderedNode = findRenderedGroup(document, 'g.node', node.id);
    if (!renderedNode) continue;
    renderedNode.classList.add('cochart-code-node');
    hideRenderedLineRange(renderedNode, `${node.code.startLine}-${node.code.endLine}`);
  }

  for (const file of Object.values(model.files)) {
    findRenderedGroup(document, 'g.cluster', file.id)?.classList.add('cochart-file-cluster');
  }

  return new XMLSerializer().serializeToString(document.documentElement);
}

function findRenderedGroup(document: Document, selector: string, id: string): Element | null {
  return Array.from(document.querySelectorAll(selector)).find((element) => {
    const renderedId = element.id;
    return renderedId === id || renderedId.includes(`-${id}-`) || renderedId.endsWith(`-${id}`);
  }) ?? null;
}

function hideRenderedLineRange(root: Element, lineRange: string): void {
  for (const element of Array.from(root.querySelectorAll('tspan'))) {
    if (element.textContent?.trim() === lineRange) {
      element.classList.add('cochart-hidden-line-range');
      return;
    }
  }

  const walker = root.ownerDocument.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const textNodes: Text[] = [];
  while (walker.nextNode()) {
    const node = walker.currentNode;
    if (node.textContent?.trim() === lineRange) {
      textNodes.push(node as Text);
    }
  }

  for (const textNode of textNodes) {
    const span = root.ownerDocument.createElement('span');
    span.setAttribute('class', 'cochart-hidden-line-range');
    span.textContent = textNode.textContent;
    textNode.parentNode?.replaceChild(span, textNode);
  }
}

function openEntityInIde(entity: DiagramEntity | null, model: DiagramModel, ideState: { isInIde: boolean; projectPath: string }): void {
  if (!entity || !ideState.isInIde) return;

  if (entity.type === 'code' && entity.code) {
    goToLineInIde(
      ideState.projectPath,
      resolveFullPath(model, entity.code.basePathName, entity.code.relativePath),
      Math.max(0, entity.code.startLine - 1),
    );
  }

  if (entity.type === 'file') {
    goToLineInIde(
      ideState.projectPath,
      resolveFullPath(model, entity.basePathName, entity.relativePath),
      0,
    );
  }
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

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
