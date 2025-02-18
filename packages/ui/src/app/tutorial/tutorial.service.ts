import { Injectable, ComponentRef, ComponentFactoryResolver, ApplicationRef, Injector } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { TUTORIAL_DIAGRAM } from './tutorial.diagram';
import { AppComponent } from '../app.component';

export interface TutorialStep {
  title: string;
  description: string;
  target: {
    type: 'element' | 'position';
    selector?: string;
    position?: { x: number; y: number };
  };
  startScript?: (component: AppComponent) => Promise<any>;
  endScript?: (component: AppComponent) => Promise<any>;
}

interface ElementPosition {
  top: number;
  left: number;
  width: number;
  height: number;
}

interface TextBoxPosition {
  top: number;
  left: number;
}

interface TutorialState {
  isActive: boolean;
  currentStepIndex: number;
  originalStates: Map<string, any>;
}

@Injectable()
export class TutorialService {
  private state: TutorialState = {
    isActive: false,
    currentStepIndex: 0,
    originalStates: new Map()
  };
  private steps: TutorialStep[] = [];
  private overlayRef: ComponentRef<any>;
  private appComponent: any; // Reference to AppComponent instance

  private tutorialStateSubject = new BehaviorSubject<TutorialState>({
    isActive: false,
    currentStepIndex: 0,
    originalStates: new Map()
  });
  tutorialState$ = this.tutorialStateSubject.asObservable();

  constructor(
    private componentFactoryResolver: ComponentFactoryResolver,
    private appRef: ApplicationRef,
    private injector: Injector
  ) {
  }

  // Add method to set AppComponent reference
  setAppComponentRef(ref: any) {
    this.appComponent = ref;
  }

  async start(steps: TutorialStep[]) {
    if (!this.appComponent) {
      console.error('AppComponent reference not set. Please ensure setAppComponentRef is called.');
      return;
    }
  
    // Load the tutorial diagram first
    this.appComponent.chart.simpleLoadFromJson(TUTORIAL_DIAGRAM, {fitToAll: true, selectLoaded: false, styleOnLoad: true});
  
    // Wait for the diagram to load before starting the tutorial
    await new Promise(resolve => setTimeout(resolve, 500));
    
    this.steps = steps;
    this.state.isActive = true;
    this.state.currentStepIndex = 0;
    
    // Wait for state changes to complete before notifying subscribers
    await this.applyStateChanges(this.steps[0]);
    this.tutorialStateSubject.next(this.state);
  }

  async stop() {
    if (!this.state.isActive) return;
    
    // Restore any state changes
    await this.restoreStepStates();
    
    this.state = {
      isActive: false,
      currentStepIndex: 0,
      originalStates: new Map()
    };
    
    this.tutorialStateSubject.next({ ...this.state });
  }

async next() {
  if (!this.state.isActive) return;
  
  // If we're at the last step, stop the tutorial
  if (this.state.currentStepIndex === this.steps.length - 1) {
    await this.stop();
    return;
  }

  // Restore current step's states before moving to next
  await this.restoreStepStates();
  
  // Move to next step
  this.state.currentStepIndex++;
  
  // Apply new step's state changes
  const nextStep = this.steps[this.state.currentStepIndex];
  await this.applyStateChanges(nextStep);
  
  this.tutorialStateSubject.next({ ...this.state });
}

async previous() {
  if (this.state.currentStepIndex > 0) {
    await this.goToStep(this.state.currentStepIndex - 1);
  }
}

private async goToStep(index: number) {
  // Restore states from previous step if needed
  await this.restoreStepStates();
  
  this.state.currentStepIndex = index;
  const step = this.steps[index];
  
  // Apply new state changes
  await this.applyStateChanges(step);
  
  this.tutorialStateSubject.next({ ...this.state });
}
  calculateHighlightPosition(target: string | HTMLElement): ElementPosition {
    let element: HTMLElement;
    if (typeof target === 'string') {
      element = document.querySelector(target) as HTMLElement;
    } else {
      element = target;
    }
    
    if (!element) {
      console.error('Target element not found');
      return null;
    }

    const rect = element.getBoundingClientRect();
    const padding = 5;
    
    return {
      top: rect.top - padding + window.scrollY,
      left: rect.left - padding + window.scrollX,
      width: rect.width + (padding * 2),
      height: rect.height + (padding * 2)
    };
  }

  calculateTextBoxPosition(highlightPos: ElementPosition): TextBoxPosition {
    const padding = 20;
    const textBoxWidth = 300;
    const textBoxHeight = 150;
    const bottomOffset = 100; // Space from bottom of screen

    // Position the box above the bottom of the screen
    let top = window.innerHeight - textBoxHeight - bottomOffset;
    let left = (window.innerWidth - textBoxWidth) / 2; // Center horizontally

    // If there's a highlighted element, try to position near it while staying within bounds
    if (highlightPos) {
      left = highlightPos.left + highlightPos.width + padding;
      
      // If the textbox would go off the right edge, position it to the left of the highlight
      if (left + textBoxWidth > window.innerWidth) {
        left = highlightPos.left - textBoxWidth - padding;
      }
      
      // If still outside bounds, center it
      if (left < 0 || left + textBoxWidth > window.innerWidth) {
        left = (window.innerWidth - textBoxWidth) / 2;
      }
    }

    return { top, left };
  }

  private async applyStateChanges(step: TutorialStep) {
    if (!step.startScript) return;
    if (!this.appComponent) {
      console.error('AppComponent reference not set. Please ensure setAppComponentRef is called.');
      return;
    }
    await step.startScript(this.appComponent);
  }

  private restoreStepStates() {
    const currentStep = this.steps[this.state.currentStepIndex];
    if (!currentStep || !currentStep.endScript) return;
    if (!this.appComponent) {
      console.error('AppComponent reference not set. Please ensure setAppComponentRef is called.');
      return;
    }
    currentStep.endScript(this.appComponent);
  }

  private getVariableValue(path: string): any {
    if (!this.appComponent) {
      console.warn('AppComponent reference not set');
      return null;
    }

    // Handle nested paths (e.g. 'chart.visible')
    const parts = path.split('.');
    let value = this.appComponent;
    
    for (const part of parts) {
      if (value && typeof value === 'object' && part in value) {
        value = value[part];
      } else {
        console.warn(`Property ${part} not found in path ${path}`);
        return null;
      }
    }
    
    return value;
  }

  private setVariableValue(path: string, value: any) {
    if (!this.appComponent) {
      console.warn('AppComponent reference not set');
      return;
    }

    // Handle nested paths
    const parts = path.split('.');
    let target = this.appComponent;
    
    // Navigate to the parent object of the property we want to set
    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (target && typeof target === 'object' && part in target) {
        target = target[part];
      } else {
        console.warn(`Property ${part} not found in path ${path}`);
        return;
      }
    }

    // Set the value on the last property
    const lastPart = parts[parts.length - 1];
    if (target && typeof target === 'object') {
      target[lastPart] = value;
    }
  }

  getCurrentStep(): TutorialStep {
    return this.steps[this.state.currentStepIndex];
  }

  isLastStep(): boolean {
    return this.state.currentStepIndex === this.steps.length - 1;
  }
} 