import { Injectable } from '@angular/core';
import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse, HttpProgressEvent, HttpXsrfTokenExtractor } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/do';
import { Router } from '@angular/router';
import { finalize, takeUntil, tap } from 'rxjs/operators'
import { Subject } from 'rxjs/Subject';
import {AppComponent} from '../app.component';

@Injectable()
export class AppInterceptorsService implements HttpInterceptor {
  app: AppComponent = null
  public counter = 0
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    console.log(this.counter, req.url, '++')
    this.counter++
    return next.handle(req).pipe(finalize(()=>{ this.counter-- }))
  }

}
