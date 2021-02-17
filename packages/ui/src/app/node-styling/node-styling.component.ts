import { Component, ElementRef, Input, OnInit, Output, ViewChild } from '@angular/core';
import { NodeStyles } from '../chart/chart.consts';
import { AppComponent } from '../app.component';
import { JsonPipe } from '@angular/common';
import { InputTextarea } from 'primeng/primeng';
import { Utils } from '../chart/Utils';

enum StylingTypes {
  edge, node
}

const sizeSteps = { start: 20, step: 2 }
const sizes = [5, 20, 40, 70, 100, 400];

@Component({
  selector: 'node-styling',
  templateUrl: './node-styling.component.html',
  styleUrls: ['./node-styling.component.css']
})
export class NodeStylingComponent implements OnInit {
  @Input() appComponent: AppComponent;
  @ViewChild('styleElement') private styleElement: ElementRef
  public sizeSteps = sizeSteps
  public stylingType: StylingTypes = StylingTypes.node
  public StylingTypes = StylingTypes
  public _showAdvanced = false
  public selecedItemStyle

  public sizes = sizes
  constructor(private jsonPipe: JsonPipe) {
  }

  ngOnInit() {
  }

  public set showAdvanced(value: boolean) {
    this._showAdvanced = value
    let deleteFields = ["id", "d"]
    if (this.appComponent.selectedNode) {
      let tempStyle = Utils.deepCopy(this.appComponent.selectedNode)
      deleteFields.forEach(i => delete tempStyle[i])
      this.selecedItemStyle = tempStyle
    }
    else this.selecedItemStyle = "none"
  }

  public get showAdvanced(): boolean {
    return this._showAdvanced
  }

  public toggleShowAdvanced() {
    this.showAdvanced = !this.showAdvanced
  }

  public applyManualStyle() {
    this.appComponent.chartActions.setSelectionStyle(JSON.parse(this.styleElement.nativeElement.value))
  }



  groupUngroupFile() {

  }

  changeType(event: Event, type: StylingTypes) {
    event.stopPropagation()
    event.preventDefault()
    this.stylingType = type

  }
}
