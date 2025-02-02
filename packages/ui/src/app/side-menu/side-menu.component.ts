// src/app/side-menu/side-menu.component.ts
import { Component } from '@angular/core';

@Component({
  selector: 'app-side-menu',
  templateUrl: './side-menu.component.html',
  styleUrls: ['./side-menu.component.scss']
})
export class SideMenuComponent {
  menuItems = [
    {
      title: 'Home',
      items: ['Dashboard', 'Profile', 'Settings']
    },
    {
      title: 'Products',
      items: ['Electronics', 'Clothing', 'Books']
    },
    {
      title: 'Services',
      items: ['Consulting', 'Support', 'Training']
    }
  ];

  selectedTitle: string | null = null;

  toggleItems(title: string) {
    if (this.selectedTitle === title) {
      this.selectedTitle = null;
    } else {
      this.selectedTitle = title;
    }
  }
}