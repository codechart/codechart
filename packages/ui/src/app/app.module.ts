import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import {HttpClientModule} from "@angular/common/http";
import {FormsModule} from "@angular/forms";
import {AutoCompleteModule, CheckboxModule, DialogModule, DropdownModule, TooltipModule} from 'primeng/primeng';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import { AceEditorModule } from 'ng2-ace-editor';
import { CodeViewerComponent } from './code-viewer/code-viewer.component';
import { NodeStylingComponent } from './src/app/node-styling/node-styling.component';

@NgModule({
  declarations: [
    AppComponent,
    CodeViewerComponent,
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
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
