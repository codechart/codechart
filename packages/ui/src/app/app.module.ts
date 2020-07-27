import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import {HTTP_INTERCEPTORS, HttpClientModule} from '@angular/common/http';
import {FormsModule} from "@angular/forms";
import {AutoCompleteModule, CheckboxModule, DialogModule, DropdownModule, TooltipModule} from 'primeng/primeng';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import { AceEditorModule } from 'ng2-ace-editor';
import { CodeViewerComponent } from './code-viewer/code-viewer.component';
import {NodeStylingComponent} from './node-styling/node-styling.component';
import {AppInterceptorsService} from './services/AppInterceptorService';

@NgModule({
  declarations: [
    AppComponent,
    CodeViewerComponent,
    NodeStylingComponent,
    NodeStylingComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    DropdownModule,
    TooltipModule,
    BrowserModule,
    BrowserAnimationsModule,
    DialogModule,
    AutoCompleteModule,
    CheckboxModule,
    AceEditorModule
  ],
  exports: [
  ],
  providers: [AppInterceptorsService, {
    provide: HTTP_INTERCEPTORS,
    useExisting: AppInterceptorsService,
    multi: true,
  }],
  bootstrap: [AppComponent]
})
export class AppModule { }
