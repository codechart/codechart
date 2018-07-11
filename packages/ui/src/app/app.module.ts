import {
  KlComponent,
  KlComponents,
  KlComponentsService
} from '../include/keylines/include/angular-keylines';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import {HttpClientModule} from "@angular/common/http";
import {FormsModule} from "@angular/forms";

@NgModule({
  declarations: [
    AppComponent,
    KlComponent,
    KlComponents,
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule
  ],
  exports: [
    KlComponent,
    KlComponents,
  ],
  providers: [KlComponentsService],
  bootstrap: [AppComponent]
})
export class AppModule { }
