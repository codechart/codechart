import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { FormsModule } from "@angular/forms";
import {
    AutoCompleteModule,
    CheckboxModule,
    DataTableModule,
    DialogModule,
    DropdownModule,
    SharedModule,
    SliderModule,
    TooltipModule
} from 'primeng/primeng';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AceEditorModule } from 'ng2-ace-editor';
import { CodeViewerComponent } from './code-viewer/code-viewer.component';
import { NodeStylingComponent } from './node-styling/node-styling.component';
import { AppInterceptorsService } from './services/AppInterceptorService';
import { SaveLoadService } from './services/SaveLoadService';
import { PropertiesPipe } from './pipes/appProperties';
import {PrettifyPipe} from './pipes/prettify';
import {TreeModule,TreeNode} from 'primeng/primeng'
import { ContextMenuModule } from "ngx-contextmenu/lib";
import { CollapsibleModule } from 'angular2-collapsible'; // <-- import the module
import { SideMenuComponent } from './side-menu/side-menu.component';

@NgModule({
  declarations: [
    AppComponent,
    CodeViewerComponent,
    NodeStylingComponent,
    NodeStylingComponent,
    PropertiesPipe,
    PrettifyPipe,
    SideMenuComponent
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
  exports: [
  ],
  providers: [AppInterceptorsService, SaveLoadService, {
    provide: HTTP_INTERCEPTORS,
    useExisting: AppInterceptorsService,
    multi: true,
  }],
  bootstrap: [AppComponent]
})
export class AppModule { }
