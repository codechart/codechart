import {Component, ElementRef, Input, OnInit, Output, ViewChild} from '@angular/core';
import {NodeIconImages, NodeImage, NodeShape, NodeShapes, NodeStyle, NodeStyles} from '../chart/chart.consts';
import {AppComponent} from '../app.component';
import {JsonPipe} from '@angular/common';
import {InputTextarea} from 'primeng/primeng';
import {Utils} from '../chart/Utils';
import {Node, Edge} from 'vis';
import {ChartWrapper} from '../chart/chart.wrapper';
import {ChartActions} from '../chart/chart.actions';
import {ChartUtils} from '../chart/chart.utils';

enum StylingTypes {
  edge, node
}


const sizeSteps = {start: 20, step: 2};
const sizes = [5, 20, 40, 70, 100, 400];

@Component({
  selector: 'node-styling',
  templateUrl: './node-styling.component.html',
  styleUrls: ['./node-styling.component.scss']
})
export class NodeStylingComponent implements OnInit {
  @Input() chart: ChartWrapper;
  @Input() chartActions: ChartActions;

  @ViewChild('styleElement') private styleElement: ElementRef;
  public sizeSteps = sizeSteps;
  public stylingType: StylingTypes = StylingTypes.node;
  public StylingTypes = StylingTypes;
  public _showAdvanced = false;

  _selectedNode: Node | Edge
  get selectedNode(): Node | Edge {return this._selectedNode}
  @Input()
  set selectedNode(item: Node | Edge) {
    if(!item) return;
    this.selectedItemSize = ChartUtils.isNode(item) ? this.chart.getNodeSize(item) : this.chart.getEdgeSize(item as Edge)
    this.selectedItemFontSize = ChartUtils.isNode(item) ? this.chart.getNodeFontSize(item) : this.chart.getEdgeFontSize(item as Edge)
  }
  public selecedItemStyle;

  selectedItemSize: number
  selectedItemFontSize: number

  nodeStyles: NodeStyle[] = NodeStyles;
  nodeShapes: NodeShape[] = NodeShapes;
  nodeImages: NodeImage[] = NodeIconImages;

  public sizes = sizes;

  constructor() {
  }

  ngOnInit() {

  }

  public set showAdvanced(value: boolean) {
    this._showAdvanced = value;
    let deleteFields = ['id', 'd'];
    if (this.selectedNode) {
      let tempStyle = Utils.deepCopy(this.selectedNode);
      deleteFields.forEach(i => delete tempStyle[i]);
      this.selecedItemStyle = tempStyle;
    } else this.selecedItemStyle = 'none';
  }

  public get showAdvanced(): boolean {
    return this._showAdvanced;
  }

  public toggleShowAdvanced() {
    this.showAdvanced = !this.showAdvanced;
  }

  public applyManualStyle() {
    this.chartActions.setSelectionStyle(JSON.parse(this.styleElement.nativeElement.value));
  }

  public setSelectionNodeStyle(style: { background, border }) {
    this.chart.setColor(this.chartActions.getSelectedLinksOrNodesOnly(), style.background);
    this.chart.setBorderColor(this.chartActions.getSelectedLinksOrNodesOnly(), style.background, true);
  }

  public setSelectionEdgeStyle(style: { background, border }) {
    this.chart.setColor(this.chartActions.getSelectedLinksOrNodesOnly(), style.background);
  }

  public setSelectionImage(imagePath) {
    this.chart.setNodeImage(this.chartActions.getSelectedLinksOrNodesOnly().nodes, imagePath);
  }

  public setSelectionShape(shape) {
    this.chart.setNodeShape(this.chartActions.getSelectedLinksOrNodesOnly().nodes, shape);
  }



  public showHideFile() {
    this.chartActions.groupUngroupFile(this.selectedNode as Node);
  }

  setSelectedNodesSize(size) {
    if (parseInt(size) === NaN) return;
    this.chart.setNodesSize(this.chart.getSelection().nodes, parseInt(size));
  }


  setSelectedNodesFontSize(size) {
    if (parseInt(size) === NaN) return;
    this.chart.setNodesFontSize(this.chart.getSelection().nodes, parseInt(size));
  }

  setSelectedEdgesDash(isDashed) {
    this.chart.setEdgeDash(this.chart.getSelection().edges, isDashed);
  }


  setSelectedEdgesSize(size) {
    if (parseInt(size) === NaN) return;
    this.chart.setEdgesSize(this.chart.getSelection().edges, parseInt(size));
  }

  setSelectedEdgesFontSize(size) {
    if (parseInt(size) === NaN) return;
    this.chart.setEdgesFontSize(this.chart.getSelection().edges, parseInt(size));
  }

  setEdgePoint(left: boolean, right: boolean) {
    this.chart.setArrows(this.chart.getSelection(), left, right);
  }

  public setSelectedEdgesLength(length) {
    this.chart.setEdgesLength(this.chart.getSelection().edges, parseInt(length));
  }


  groupUngroupFile() {

  }

  changeType(event: Event, type: StylingTypes) {
    event.stopPropagation();
    event.preventDefault();
    this.stylingType = type;

  }
}
