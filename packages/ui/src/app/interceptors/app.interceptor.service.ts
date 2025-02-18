import { Injectable } from '@angular/core';
import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse, HttpProgressEvent, HttpXsrfTokenExtractor } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/do';
import { Router } from '@angular/router';
import { finalize, takeUntil, tap } from 'rxjs/operators'
import { Subject } from 'rxjs/Subject';
import { AppComponent } from '../app.component';
import { EndPoints } from '../types.nodejs'

@Injectable()
export class AppInterceptorsService implements HttpInterceptor {
  public counter = 0
  private _isIde = false
  
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if(this.isIde && req.url.indexOf(EndPoints.reloadFiles)!==-1) return next.handle(req)

    this.counter++
    return next.handle(req).pipe(finalize(()=>{ this.counter-- }))
  }

  set isIde(isIde) {
    this._isIde = isIde
  }

  get isIde() {
    return this._isIde
  }
} 