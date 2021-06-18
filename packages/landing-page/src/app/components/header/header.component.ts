import {Component, OnInit} from '@angular/core';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {

  constructor() {
  }

  ngOnInit(): void {
  }


  public download(type: string): void {
    console.log('aaaa')
    fetch('https://license.code-chart.com/api/v1/audit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({macAddress: 'website', action: 'download_' + type})
    }).then((res) => {console.log('bbb ' + res)} );
  }
}
