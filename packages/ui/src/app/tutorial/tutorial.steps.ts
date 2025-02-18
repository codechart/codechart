import { AppComponent } from '../app.component';
import { TutorialStep } from './tutorial.service';

export const TUTORIAL_STEPS: TutorialStep[] = [
  // {
  //   title: 'Welcome to CodeChart',
  //   description: 'This tutorial will guide you through creating your first code visualization. Let\'s get started!',
  //   target: {
  //     type: 'element',
  //     selector: '.topbox'
  //   }
  // },
  // {
  //   title: 'Project Selection',
  //   description: 'First, select a project to analyze. Click here to choose your project from the dropdown.',
  //   target: {
  //     type: 'element',
  //     selector: '.select-path'
  //   }
  // },
  // {
  //   title: 'Manage Projects',
  //   description: 'You can add or edit project paths here. Click the custom path button to manage your projects.',
  //   target: {
  //     type: 'element',
  //     selector: '.custom-path button'
  //   }
  // },
  // {
  //   title: 'Add File Node',
  //   description: 'Click here to add a file node to your diagram. You can select files from your project to analyze.',
  //   target: {
  //     type: 'element',
  //     selector: '.add.file button'
  //   },
  //   startScript: (component: AppComponent) => {
  //     component.chart.setSelection({ nodes: [component.chart.getAllFileNodes()[0].id], edges: [] })
  //     component.selectedNode = component.chart.getAllFileNodes()[0]
  //     return new Promise((resolve) => {
  //       setTimeout(resolve, 200)
  //     })
  //   }
  // },
  // {
  //   title: 'click node to see code',
  //   description: 'select node to see code',
  //   target: {
  //     type: 'element',
  //     selector: '#chart'
  //   },
  //   startScript: (component: AppComponent) => {
  //     component.chart.setSelection({ nodes: [component.chart.getAllMatchNodes()[0].id], edges: [] })
  //     component.selectedNode = component.chart.getAllMatchNodes()[0]
  //     return new Promise((resolve) => {
  //       setTimeout(resolve, 200)
  //     })
  //   },
  // },
  {
    title: 'Text Context Menu',
    description: 'Right-click on text to access search and node creation options. You can search in files, create nodes from selections, and more.',
    target: {
      type: 'element',
      selector: '#createMatchFromSelection'
    },
    startScript: (component) => {
      // Create a proper MouseEvent
      const mockEvent = new MouseEvent('contextmenu', {
        bubbles: true,
        cancelable: true,
        view: window,
        clientX: 300,
        clientY: 200,
        altKey: false,
        ctrlKey: false,
        shiftKey: false,
        metaKey: false,
        button: 2,  // Right click
        buttons: 2
      });

      // Use the component's existing context menu handler
      component.onContextMenu(mockEvent, null, component.textMenu);

      // Ensure the menu is positioned correctly
      setTimeout(() => {
        const menuElement = document.querySelector('.ngx-contextmenu') as HTMLElement;
        if (menuElement) {
          menuElement.style.position = 'absolute';
          menuElement.style.left = '300px';
          menuElement.style.top = '200px';
          menuElement.style.zIndex = '1000';
        }
      }, 200);

      return null;
    }
  },
  {
    title: 'Search Options',
    description: 'You can search in different scopes: project folder, current file, or selected context. Click the search button to see these options.',
    target: {
      type: 'element',
      selector: '.search-actions'
    }
  },
  {
    title: 'Set Direction',
    description: 'Choose where new nodes will appear relative to the selected node. Use these arrows to set the direction (up, down, left, or right). This affects where new search results and nodes will be positioned.',
    target: {
      type: 'element',
      selector: '.direction-button'
    }
  }
]; 