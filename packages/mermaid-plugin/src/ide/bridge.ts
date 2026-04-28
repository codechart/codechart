export interface IdeBridgeState {
  isInIde: boolean;
  projectPath: string;
}

export type IdeMessageHandler = (message: unknown) => void;

export function isRunningInIde(): boolean {
  return window.parent !== window;
}

export function requestProjectPath(): void {
  window.parent.postMessage({ action: 'getProjectPath_webviewEvent' }, '*');
}

export function goToLineInIde(projectPath: string, filePath: string, lineNumber: number): void {
  console.log('[MermaidPlugin][IDE] goToLineInIde_webviewEvent', { projectPath, filePath, lineNumber });
  window.parent.postMessage({
    action: 'goToLineInIde_webviewEvent',
    data: {
      projectPath,
      filePath,
      lineNumber,
    },
  }, '*');
}

export function displayReadmeInIde(content: string): void {
  window.parent.postMessage({
    action: 'displayReadmeInIde_webviewEvent',
    data: { content },
  }, '*');
}

export function addIdeMessageListener(handler: IdeMessageHandler): () => void {
  const listener = (event: MessageEvent) => handler(event.data);
  window.addEventListener('message', listener, false);
  return () => window.removeEventListener('message', listener, false);
}

export function extractIncomingText(message: unknown): string | null {
  if (!isIdeMessage(message)) return null;

  if (message.action === 'displayContentInReadmeElement') {
    return typeof message.data?.readmeText === 'string' ? message.data.readmeText : null;
  }

  if (message.action === 'clickedOnDiagram_ideEvent') {
    return typeof message.data?.jsonContent === 'string' ? message.data.jsonContent : null;
  }

  return null;
}

export function extractProjectPath(message: unknown): string | null {
  if (!isIdeMessage(message)) return null;
  if (message.action !== 'setProjectPath_ideEvent') return null;
  return typeof message.data?.projectPath === 'string' ? message.data.projectPath : null;
}

function isIdeMessage(value: unknown): value is { action: string; data?: Record<string, unknown> } {
  if (!value || typeof value !== 'object') return false;
  return 'action' in value && typeof (value as { action?: unknown }).action === 'string';
}
