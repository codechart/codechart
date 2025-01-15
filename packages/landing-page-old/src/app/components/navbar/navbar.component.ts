import { Component, OnInit } from '@angular/core';
import {CC_VERSION} from '../../consts';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  public ccVersion = CC_VERSION;

  constructor() { }

  ngOnInit(): void {
  }
  scrollToElement(element:any): void {
    console.log("element details are",element)
    element.scrollIntoView({behavior: "smooth", inline: "nearest"});
}
}
