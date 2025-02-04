import {Component, ElementRef, Input, OnInit, Output, ViewChild, AfterViewInit} from '@angular/core';
import {NodeIconImages, NodeImage, NodeShape, NodeShapes, NodeColor, NodeStyles} from '../chart/chart.consts';
import {Utils} from '../chart/Utils';
import {Node, Edge} from 'vis';
import {ChartWrapper} from '../chart/chart.wrapper';
import {ChartActions} from '../chart/chart.actions';
import {ChartUtils} from '../chart/chart.utils';


@Component({
  selector: 'node-styling',
  templateUrl: './node-styling.component.html',
  styleUrls: ['./node-styling.component.scss']
})
export class NodeStylingComponent implements OnInit, AfterViewInit {
  @Input() chart: ChartWrapper;
  @Input() chartActions: ChartActions;

  @ViewChild('nodeTitleInput') private titleInputElement: ElementRef;
  @ViewChild('styleElement') private styleElement: ElementRef;
  public _showAdvanced = false;
  public showNodeOptions = false;
  public showEdgeOptions = false;

  public selecedItemStyle;

  selectedNodeSize: number;
  selectedNodeFontSize: number;

  nodeColors: NodeColor[] = NodeStyles;
  nodeShapes: NodeShape[] = NodeShapes;
  nodeImages: NodeImage[] = NodeIconImages;

  _selectedNode: Node | Edge = null;
  private isMultiple: boolean = false;
  private selectedEdgeSize: number;
  private selectedEdgeFontSize: number;

  get selectedNode(): Node | Edge {
    return this._selectedNode;
  }

  @Input()
  set selectedNode(item: Node | Edge) {
    if (!item || this._selectedNode) return;
    this._selectedNode = item;
    if (ChartUtils.isNode(item)) {
      this.selectedNodeSize = this.chart.getNodeSize(item);
      this.selectedNodeFontSize = this.chart.getNodeFontSize(item);
    } else {
      this.selectedEdgeSize = 0//this.chart.getEdgeSize(item as Edge);
      this.selectedEdgeFontSize = this.chart.getEdgeFontSize(item as Edge);
    }
  }

  constructor() {
  }

  ngOnInit() {
    if (this.chart.getSelection().nodes.length > 0 || this.chart.getSelection().edges.length > 0) this.isMultiple = true;
    if (this.chart.getSelection().nodes.length > 0) this.showNodeOptions = true;
    if (this.chart.getSelection().edges.length > 0) this.showEdgeOptions = true;
  }

  ngAfterViewInit() {
    if (!this.titleInputElement) return;
    let textInput = (this.titleInputElement.nativeElement as HTMLInputElement);
    if (textInput) {
      setTimeout(() => {
        textInput.focus();
        textInput.select();
      }, 100);
    }
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
    const newStyle = JSON.parse(this.styleElement.nativeElement.value)
    console.log(newStyle)
    this.chartActions.setSelectionStyle(JSON.parse(this.styleElement.nativeElement.value));
    this.chart.refresh();
  }

  public setSelectionColor(color: NodeColor) {
    this.chart.setColor(this.chartActions.getSelectedLinksOrNodesOnly(), color.background);
  }

  public setSelectionBorderColor(color: NodeColor) {
    this.chart.setBorderColor(this.chartActions.getSelectedLinksOrNodesOnly(), color.background);
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
    const allNodes = this.chart.getSelection().nodes
    const changedNodes = allNodes.filter(i=>!ChartUtils.isFilenameNode(i))
    this.chart.setNodesSize(changedNodes, parseInt(size));
  }


  setSelectedNodesFontSize(size) {
    if (parseInt(size) === NaN) return;
    this.chart.setNodesFontSize(this.chart.getSelection().nodes, parseInt(size));
  }

  public setTitle(event: Event) {
    event.stopPropagation();
    if (!this.selectedNode) return;
    this.chartActions.setNodeTitle(this.selectedNode as Node, (event.target as HTMLTextAreaElement).value);
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

  splitEdge() {
    this.chart.splitEdge(this.selectedNode as Edge)
  }

  paste(event: ClipboardEvent) {
    event.stopPropagation()
  }
}
