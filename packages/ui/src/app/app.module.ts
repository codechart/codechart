import { BrowserModule } from '@angular/platform-browser';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import {
    AutoCompleteModule,
    CheckboxModule,
    DataTableModule,
    DialogModule,
    DropdownModule,
    SharedModule,
    SliderModule,
    TooltipModule,
    TreeModule
} from 'primeng/primeng';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AceEditorModule } from 'ng2-ace-editor';
import { ContextMenuModule } from 'ngx-contextmenu';
import { CollapsibleModule } from 'angular2-collapsible';

import { AppComponent } from './app.component';
import { CodeViewerComponent } from './code-viewer/code-viewer.component';
import { NodeStylingComponent } from './node-styling/node-styling.component';
import { AppInterceptorsService } from './interceptors/app.interceptor.service';
import { SaveLoadService } from './services/SaveLoadService';
import { PropertiesPipe } from './pipes/appProperties';
import { PrettifyPipe } from './pipes/prettify';
import { SideMenuComponent } from './side-menu/side-menu.component';
import { TutorialOverlayComponent } from './tutorial/tutorial-overlay.component';
import { TutorialService } from './tutorial/tutorial.service';

@NgModule({
  declarations: [
    AppComponent,
    CodeViewerComponent,
    NodeStylingComponent,
    PropertiesPipe,
    PrettifyPipe,
    SideMenuComponent,
    TutorialOverlayComponent
  ],
  imports: [
    BrowserModule,
    CommonModule,
    HttpClientModule,
    FormsModule,
    DropdownModule,
    TooltipModule,
    BrowserAnimationsModule,
    DialogModule,
    DataTableModule,
    SharedModule,
    AutoCompleteModule,
    CheckboxModule,
    AceEditorModule,
    SliderModule,
    TreeModule,
    CollapsibleModule,
    ContextMenuModule
  ],
  providers: [
    AppInterceptorsService, 
    SaveLoadService,
    TutorialService,
    {
      provide: HTTP_INTERCEPTORS,
      useExisting: AppInterceptorsService,
      multi: true,
    }
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  bootstrap: [AppComponent]
})
export class AppModule { }
