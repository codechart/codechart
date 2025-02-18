import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { TutorialService, TutorialStep } from './tutorial.service';
import { Subscription } from 'rxjs';

interface ElementPosition {
  top: number;
  left: number;
  width: number;
  height: number;
}

@Component({
  selector: 'app-tutorial-overlay',
  template: `
    <div class="tutorial-overlay" *ngIf="isVisible">
      <div class="overlay-background"></div>
      
      <!-- Highlight box -->
      <div class="highlight-box" 
           [style.top.px]="highlightPosition?.top"
           [style.left.px]="highlightPosition?.left"
           [style.width.px]="highlightPosition?.width"
           [style.height.px]="highlightPosition?.height">
      </div>
      
      <!-- Text box -->
      <div class="text-box">
        <h3>{{currentStep?.title}}</h3>
        <p>{{currentStep?.description}}</p>
        <div class="navigation">
          <button (click)="previous()" 
                  [disabled]="isNavigating || !canGoPrevious"
                  class="p-button">Previous</button>
          <button (click)="next()" 
                  [disabled]="isNavigating"
                  class="p-button p-button-primary">
            {{isLastStep ? 'Finish' : 'Next'}}
          </button>
          <button (click)="stop()" 
                  [disabled]="isNavigating"
                  class="p-button p-button-danger stop-button">
            Exit Tutorial
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .tutorial-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      z-index: 9999;
      pointer-events: none;
    }

    .overlay-background {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.1);
    }

    .highlight-box {
      position: absolute;
      box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.5);
      border: 2px solid #ffffff;
      border-radius: 4px;
      pointer-events: none;
      transition: all 0.3s ease;
    }

    .text-box {
      position: fixed;
      bottom: 20%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: white;
      padding: 20px;
      border-radius: 8px;
      width: 400px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      pointer-events: auto;

      h3 {
        margin: 0 0 10px 0;
        color: #333;
        font-size: 18px;
      }

      p {
        margin: 0 0 20px 0;
        color: black;
        font-size: 14px;
        line-height: 1.5;
      }

      .navigation {
        display: flex;
        gap: 10px;
        justify-content: flex-end;
        
        .stop-button {
          margin-left: auto;
        }

        button {
          padding: 8px 16px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;

          &:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }

          &.p-button-primary {
            background: #007bff;
            color: white;
          }

          &.p-button-danger {
            background: #dc3545;
            color: white;
          }
        }
      }
    }
  `]
})
export class TutorialOverlayComponent implements OnInit, OnDestroy {
  isVisible = false;
  currentStep: TutorialStep;
  highlightPosition: ElementPosition;
  canGoPrevious = false;
  isLastStep = false;
  isNavigating = false;

  private subscription: Subscription;

  constructor(private tutorialService: TutorialService) {}

  @HostListener('document:keydown.escape', ['$event'])
  handleEscapeKey(event: KeyboardEvent) {
    this.stop();
  }

  ngOnInit() {
    this.subscription = this.tutorialService.tutorialState$.subscribe(state => {
      if (!state) return;
      
      this.isVisible = state.isActive;
      if (this.isVisible) {
        // Get current step from service
        this.currentStep = this.tutorialService.getCurrentStep();
        // Update navigation state
        this.canGoPrevious = state.currentStepIndex > 0;
        this.isLastStep = this.tutorialService.isLastStep();
        this.isNavigating = false;
        // Update highlight position
        this.updateStep();
      }
    });
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  private updateStep() {
    if (!this.currentStep) return;

    const target = this.currentStep.target;
    console.log('puttin element', target);
    if (target.type === 'element') {
      const element = document.querySelector(target.selector);
      if (element) {
        const rect = element.getBoundingClientRect();
        this.highlightPosition = {
          left: rect.left + window.scrollX,
          top: rect.top + window.scrollY,
          width: rect.width,
          height: rect.height
        };
      } else {
        console.warn(`Element not found for selector: ${target.selector}`);
        this.highlightPosition = null;
      }
    } else if (target.type === 'position') {
      this.highlightPosition = {
        left: target.position.x,
        top: target.position.y,
        width: 100,
        height: 100
      };
    }
  }

  // Add window resize handler to update element positions
  @HostListener('window:resize')
  onResize() {
    this.updateStep();
  }

  // Add scroll handler to update element positions
  @HostListener('window:scroll')
  onScroll() {
    this.updateStep();
  }

  next() {
    this.tutorialService.next();
  }

  previous() {
    this.tutorialService.previous();
  }

  stop() {
    this.tutorialService.stop();
  }
} 