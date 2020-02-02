import {Component, Input, OnInit, Output} from '@angular/core';
import {NodeColors} from '../chart/chart.consts';
import {AppComponent} from '../app.component';

export enum NodeStylingAction {
  Style
}

@Component({
  selector: 'node-styling',
  templateUrl: './node-styling.component.html',
  styleUrls: ['./node-styling.component.css']
})
export class NodeStylingComponent implements OnInit {
  @Input() appComponent: AppComponent
  public nodesColors = NodeColors;

  constructor() { }

  ngOnInit() {
  }

}
