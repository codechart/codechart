import { Component } from '@angular/core';
import { filter,map,mergeMap } from 'rxjs/operators';
import {
  Router,
  Event as RouterEvent,
  NavigationStart,
  NavigationEnd,
  NavigationCancel,
  NavigationError,ActivatedRoute
} from '@angular/router'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  public showOverlay = true;
  visibility:boolean=false;
  delay = 500;
  constructor(private router:Router,private activatedRoute:ActivatedRoute){
    
    this.router.events.pipe(
      filter(events=>events instanceof NavigationEnd),
      map(evt =>this.activatedRoute),
      map(route => {
      while(route.firstChild) {
      route = route.firstChild;
      }
      return route;
      })).pipe(
      filter(route => route.outlet === 'primary'),
      mergeMap(route => route.data)
       ).subscribe(x=>x.header===true ?this.visibility=true:this.visibility=false);
       
       this.router.events.subscribe((event: RouterEvent) => {
        this.navigationInterceptor(event)
      })
      

  }
  ngOnInit(){
    }
     // Shows and hides the loading spinner during RouterEvent changes
  navigationInterceptor(event: RouterEvent): void {
    if (event instanceof NavigationStart) {
      this.showOverlay = true;
    }
    if (event instanceof NavigationEnd) {
      setTimeout(()=>{this.showOverlay = false;

      }, this.delay)
    }

    // Set loading state to false in both of the below events to hide the spinner in case a request fails
    if (event instanceof NavigationCancel) {
      setTimeout(()=>{this.showOverlay = false;

      }, this.delay)
    }
    if (event instanceof NavigationError) {
      setTimeout(()=>{this.showOverlay = false;

      }, this.delay)
    }
  }
}
