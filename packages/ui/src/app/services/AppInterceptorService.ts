import { Injectable } from '@angular/core';
import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse, HttpProgressEvent, HttpXsrfTokenExtractor } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/do';
import { Router } from '@angular/router';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs/Subject';
import {AppComponent} from '../app.component';

@Injectable()
export class AppInterceptorsService implements HttpInterceptor {
  loadingTimeout = 30000
  app: AppComponent = null
  constructor() {}
  counter = 0

  setAppComponent(appComponent: AppComponent) {this.app = appComponent}
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    this.counter++
    return next
      .handle(req).do(event => {
      }, (err: any) => {
        this.counter--
        this.app.addMessage('error occured', (err.error && err.error.message) ? err.error.message : "", 3000)
        console.log(err)
      }, () => {
        this.counter--
        clearTimeout(this.loadingTimeout);
      });
  }

}
