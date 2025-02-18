import { AppComponent } from '../app.component';
import { NodeTypes } from '../chart/chart.consts';
import { VisiNode } from '../types.nodejs';
import { TutorialStep } from './tutorial.service';
import { Node } from 'vis';

// Helper function to create context menu events
const createContextMenuEvent = (component: AppComponent, menu: any, xPercent: number, yPercent: number) => {
  // Convert percentages to actual pixels based on window size
  const x = (window.innerWidth * xPercent) / 100;
  const y = (window.innerHeight * yPercent) / 100;

  // Create a proper MouseEvent
  const mockEvent = new MouseEvent('contextmenu', {
    bubbles: true,
    cancelable: true,
    view: window,
    clientX: x,
    clientY: y,
    altKey: false,
    ctrlKey: false,
    shiftKey: false,
    metaKey: false,
    button: 2,  // Right click
    buttons: 2
  });

  // Use the component's existing context menu handler
  component.onContextMenu(mockEvent, null, menu);

  // Position the menu correctly
  return new Promise((resolve) => {
    setTimeout(() => {
      const menuElement = document.querySelector('.ngx-contextmenu') as HTMLElement;
      if (menuElement) {
        menuElement.style.position = 'absolute';
        menuElement.style.left = `${x}px`;
        menuElement.style.top = `${y}px`;
        menuElement.style.zIndex = '1000';
      }
      setTimeout(() => resolve(null), 100);
    }, 100);
  });
};

// Helper function to focus on a node
const focusOnNode = (component: AppComponent, node: Node, delay: number = 200) => {
  component.chart.setSelection({ nodes: [node.id], edges: [] });
  component.selectedNode = node as VisiNode;
  component.chart.zoomToElement(node);
  return new Promise((resolve) => {
    setTimeout(resolve, delay);
  });
};

export const TUTORIAL_STEPS: TutorialStep[] = [
  {
    "title": "Welcome to CodeChart",
    "description": "Learn how to visualize your code. Let's begin!",
    "target": { "type": "element", "selector": ".topbox" }
  },
  {
    "title": "Select a Project",
    "description": "Choose a project to analyze from the dropdown.",
    "target": { "type": "element", "selector": ".select-path" }
  },
  {
    "title": "Manage Projects",
    "description": "Add or edit project paths by clicking here.",
    "target": { "type": "element", "selector": ".custom-path button" }
  },
  {
    "title": "Add a File Node",
    "description": "Click to add a file node. Select it to open the file.",
    "target": { "type": "element", "selector": ".add.file button" }
  },
  {
    "title": "View Code",
    "description": "Click a node to see its code.",
    "target": { "type": "element", "selector": "#chart" }
  },
  {
    "title": "Create a Node from Text",
    "description": "Right-click and select to create a node.",
    "target": { "type": "element", "selector": "#createMatchFromSelection" }
  },
  {
    "title": "Add Info Nodes",
    "description": "Right-click to add markers or documentation.",
    "target": { "type": "element", "selector": "#createToDoNode" }
  },
  {
    "title": "Search Code",
    "description": "Search within a project, file, or selected area.",
    "target": { "type": "element", "selector": ".search-actions" }
  },
  {
    "title": "Use Regex Search",
    "description": "Enable regex for advanced searches.",
    "target": { "type": "element", "selector": "#toggleRegexButton" }
  },
  {
    "title": "Quick Navigation",
    "description": "Use the side menu to move between nodes.",
    "target": { "type": "element", "selector": "#sideMenuButton" }
  },
  {
    "title": "Set Node Direction",
    "description": "Use arrows to choose where new nodes appear.",
    "target": { "type": "element", "selector": ".direction-button" }
  },
  {
    "title": "Copy Diagram for LLM",
    "description": "Export the diagram as JSON for LLM processing.",
    "target": { "type": "element", "selector": "#copyDiagramForLlm" }
  },
  {
    "title": "Copy LLM Prompt",
    "description": "Copy a prompt, paste the response to generate a diagram.",
    "target": { "type": "element", "selector": "#copyLlmPrompt" }
  },
  {
    "title": "Save Diagram",
    "description": "Save your diagram, export JSON, or generate a shareable link.",
    "target": { "type": "element", "selector": "#saveSection" }
  },
  {
    "title": "Check for Similar Diagrams",
    "description": "Avoid duplicates by reviewing similar charts before saving.",
    "target": { "type": "element", "selector": "#similarCharts" }
  },
  {
    "title": "Save Options",
    "description": "Manage save, upload, and sync settings.",
    "target": { "type": "element", "selector": ".save-options button[data-toggle=\"dropdown\"]" }
  },
  {
    "title": "Sync with Disk",
    "description": "Sync nodes with disk, marking any failed syncs.",
    "target": { "type": "element", "selector": ".dropdown-menu div[pTooltip=\"sync with disk\"]" }
  }
]
; 