//
//     Angular components KeyLines v3.5.3-3431
//
//     Copyright © 2011-2017 Cambridge Intelligence Limited.
//     All rights reserved.
//

import {
  Component,
  ElementRef,
  Input,
  Output,
  EventEmitter,
  Injectable,
  AfterViewInit,
  OnDestroy,
  OnChanges,
  SimpleChange,
  ContentChildren,
  HostListener,
  ViewChild
} from '@angular/core';

// allow KeyLines global
declare const KeyLines: KeyLines.KeyLines;
// Promisify Keylines
KeyLines.promisify(Promise);

@Injectable()
export class KlComponentsService {
  private _klPaths(base: string = '', images: string) {
    const paths: KeyLines.PathsOptions = {
      assets: base + 'assets/keylines/',
      images: base // default if not separately defined
    };
    if (images) {
      paths.images = images;
    }
    return paths;
  }

  create(
    klComponents: KeyLines.Component[],
    klBasePath: string,
    klImagesPath: string
  ) {
    // KeyLines paths configuration
    const paths = this._klPaths(klBasePath, klImagesPath);
    KeyLines.paths(paths);

    // KeyLines create components
    return KeyLines.create(klComponents);
  }
}

@Component({
  selector: 'kl-component',
  template:
    '<div><div #container><div [id]="id" [ngStyle]="style"></div></div></div>'
})
export class KlComponent implements OnChanges, OnDestroy {
  @Input() id: string;
  @Input('ngStyle') style: any; //optional

  @Input('klType') type: 'chart' | 'timebar' = 'chart'; // optional
  @Input('klOptions')
  options: KeyLines.ChartOptions | KeyLines.TimeBarOptions = {}; // optional
  @Input('klContainerClass') containerClass: string = ''; // optional

  @Output('klReady') klReady = new EventEmitter(); // optional
  @Output('klEvents') klEvents = new EventEmitter(); // optional

  // Save the reference of the container element: see #container in the template
  @ViewChild('container') private containerElement: ElementRef;
  // The KeyLines component
  private component: KeyLines.Chart | KeyLines.TimeBar;
  // constructor
  constructor(el: ElementRef) {
    // Remove KL id to the parent
    el.nativeElement.removeAttribute('id');
  }

  isChart(
    component: KeyLines.Chart | KeyLines.TimeBar
  ): component is KeyLines.Chart {
    return this.type === 'chart';
  }
  // lifecycle hooks
  ngOnChanges(changes: { [propertyName: string]: SimpleChange }) {
    const { options } = changes;
    // Refresh the options when necessary
    if (options && !options.isFirstChange()) {
      this.refreshOptions(options.currentValue);
    }
  }
  ngOnDestroy() {
    // unbind all the events
    this.component.unbind('all', null);
  }

  // Kl instructions
  getHeader(): KeyLines.Component {
    const { id, type, options } = this;
    return { id, type, options };
  }

  setUpComponent(component: KeyLines.Chart | KeyLines.TimeBar) {
    // save the reference of the component
    this.component = component;
    // resize the component
    this.onResize(false /* don't fit to the chart */);
    // trigger a klReady event with the component reference
    this.klReady.emit(component);
    // bind the component events
    this.registerEvent();
  }
  registerEvent() {
    this.component.bind('all', (name: string, ...args: string[]) => {
      if (name !== 'redraw') {
        // define the event
        const klEvent = { name, args, preventDefault: false };
        // dispatch the event to the parent
        this.klEvents.emit(klEvent);
        // return the preventDefault value
        return klEvent.preventDefault;
      }
    });
  }

  refreshOptions(options: KeyLines.ChartOptions | KeyLines.TimeBarOptions) {
    // Use type guard to allow TypeScript to infer type and prevent errors
    if (this.isChart(this.component)) {
      this.component.options(options);
    } else {
      this.component.options(options);
    }
  }
  onResize(doFit: boolean = true) {
    if (this.component) {
      // find containing dimensions
      const w = this.containerElement.nativeElement.offsetWidth;
      const h = this.containerElement.nativeElement.offsetHeight;
      const { width, height } = this.containerElement.nativeElement.children[0];
      if (w > 0 && h > 0 && (w !== width || h !== height)) {
        KeyLines.setSize(this.id, w, h);
        if (doFit && this.isChart(this.component)) {
          this.component.zoom('fit');
        }
      }
    }
  }
}

@Component({
  selector: 'kl-components',
  template: '<ng-content></ng-content>'
})
export class KlComponents implements AfterViewInit {
  @Input('klBasePath') basePath: string = ''; // optional
  @Input('klImagesPath') imagesPath: string = ''; // optional

  @Output('klReady') klReady = new EventEmitter(); // optional

  // save the KeyLines service
  private KlComponentsService: KlComponentsService;
  // get the list of the children components
  // http://blog.thoughtram.io/angular/2015/09/03/forward-references-in-angular-2.html
  @ContentChildren(KlComponent) private components: KlComponent[];

  // constructor
  constructor(KlComponentsService: KlComponentsService) {
    this.KlComponentsService = KlComponentsService;
  }

  // lifecycle hooks
  ngAfterViewInit() {
    // iterate over the list of children components to create the KeyLines definition of components
    const toCreate: KeyLines.Component[] = this.components.map(
      (component: KlComponent) => component.getHeader()
    );
    this.makeComponents(toCreate);
  }

  // KL instructions
  makeComponents(componentsToCreate: KeyLines.Component[]) {
    // use the KeyLines service to create the components
    this.KlComponentsService.create(
      componentsToCreate,
      this.basePath,
      this.imagesPath
    )
      .then((components: (KeyLines.Chart | KeyLines.TimeBar)[]) =>
        this.notifyComponents(components)
      )
      .catch((error: any) => error);
  }

  notifyComponents(components: (KeyLines.Chart | KeyLines.TimeBar)[]) {
    // ensure that we have an array of components
    if (!Array.isArray(components)) {
      components = [components];
    }
    // emit the ready events
    this.klReady.emit(components);
    // for each components registered as children
    // we finalise the set up of the component
    this.components.forEach((component: KlComponent, index: number) =>
      component.setUpComponent(components[index])
    );
  }
}
