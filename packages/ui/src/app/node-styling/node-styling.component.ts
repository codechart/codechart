import {Component, Input, OnInit, Output} from '@angular/core';
import {NodeColors} from '../chart/chart.consts';
import {AppComponent} from '../app.component';

export enum NodeStylingAction {
  Style
}

const sizeSteps = {start: 20, step: 2}
const sizes = [5, 20, 40, 70, 100, 400];

@Component({
  selector: 'node-styling',
  templateUrl: './node-styling.component.html',
  styleUrls: ['./node-styling.component.css']
})
export class NodeStylingComponent implements OnInit {
  @Input() appComponent: AppComponent;
  public nodesColors = NodeColors;
  public sizeSteps = sizeSteps

  public sizes = sizes
  constructor() {
  }

  ngOnInit() {
  }

  groupUngroupFile() {

  }
}
