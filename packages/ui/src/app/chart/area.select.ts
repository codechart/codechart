import * as $ from 'jquery';
import { AppComponent } from "../app.component";
import { ChartWrapper } from "./chart.wrapper";

export class AreaSelect {
  public container = $("#network");
  public data = {
    nodes: null,
    edges: null
  };
  public network;

  public canvas;
  public ctx;
  public rect: any = {};
  public isSelectingArea = false;
  public drawingSurfaceImageData;
  public nodesPositions: any[] = [];
  private drawingCounter = 0
  private drawingIntervalFunc: any
  private lastMouseEvent: any = null
  public refreshCounter = 0

  private chart: ChartWrapper

  constructor(private app: AppComponent) {
    this.chart = app.chart
  }

  public saveNodePositions() {
    let allNodes = this.chart.nodes.get();
    for (let i = 0; i < allNodes.length; i++) {
      let curNode = allNodes[i];
      if (curNode.hidden) continue
      let nodePosition = this.network.getPositions([curNode.id]);
      let nodeXY = this.network.canvasToDOM({ x: nodePosition[curNode.id].x, y: nodePosition[curNode.id].y });
      nodeXY.id = curNode.id
      this.nodesPositions.push(nodeXY)
    }
  }

  public saveDrawingSurface() {
    this.drawingSurfaceImageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
  }

  public restoreDrawingSurface() {
    this.ctx.putImageData(this.drawingSurfaceImageData, 0, 0);
  }

  public selectNodesFromHighlight() {
    let nodesIdInDrawing = [];
    let xRange = this.getStartToEnd(this.rect.startX, this.rect.w);
    let yRange = this.getStartToEnd(this.rect.startY, this.rect.h);

    this.nodesPositions.forEach(i => {
      if (xRange.start < i.x && i.x < xRange.end && yRange.start < i.y && i.y < yRange.end) {
        nodesIdInDrawing.push(i.id);
      }
    })
    this.network.selectNodes(nodesIdInDrawing);
  }

  public getStartToEnd(start, theLen) {
    return theLen > 0 ? { start: start, end: start + theLen } : { start: start + theLen, end: start };
  }

  public intialize() {
    this.network = this.chart.chart
    this.container = $("#vis_element")
    this.container.on("mousemove", (e) => {
      if (this.isSelectingArea) {
        this.lastMouseEvent = e
      }
    });

    this.container.on("mousedown", (e) => {
      if (e.button === 2 && e.ctrlKey) {
        this.startDrawLoop()
        this.chart.chart.setOptions({ interaction: { dragView: false } })
        this.saveNodePositions()
        this.saveDrawingSurface();
        this.rect.startX = e.pageX - e.currentTarget.offsetLeft;
        this.rect.startY = e.pageY - e.currentTarget.offsetTop;
        this.isSelectingArea = true;
        this.container[0].style.cursor = "crosshair";
      }
    });

    this.container.on("mouseup", (e) => {
      if (this.isSelectingArea) {
        console.log(this.isSelectingArea)
        this.stopDrawLoop()
        this.chart.chart.setOptions({ interaction: { dragView: true } })
        this.restoreDrawingSurface();
        setTimeout(() => {this.isSelectingArea = false;})

        this.container[0].style.cursor = "default";
        this.selectNodesFromHighlight();
      }
    });

    document.getElementById('vis_element').oncontextmenu = function() {
      return false;
    };

    this.canvas = this.chart.getCanvas();
    this.ctx = this.canvas.getContext('2d');

  }

  private drawRectangle() {
    let e = this.lastMouseEvent
    this.restoreDrawingSurface()
    this.rect.w = (e.pageX - e.currentTarget.offsetLeft) - this.rect.startX
    this.rect.h = (e.pageY - e.currentTarget.offsetTop) - this.rect.startY

    // this.selectNodesFromHighlight();
    // this.ctx.setLineDash([5]);
    // this.selectNodesFromHighlight()
    this.ctx.strokeStyle = 'rgb(0, 102, 0)'
    this.ctx.strokeRect(this.rect.startX, this.rect.startY, this.rect.w, this.rect.h)
    // this.ctx.setLineDash([]);
    // this.ctx.fillStyle = "rgba(0, 255, 0, 0.2)";
    // this.ctx.fillRect(this.rect.startX, this.rect.startY, this.rect.w, this.rect.h);
  }

  public startDrawLoop() {
    this.drawingIntervalFunc = setInterval(() => {
      this.refreshCounter++
      this.drawRectangle();
      // if(this.refreshCounter % 5 === 0) this.chart.refresh(false)
    }, 100)
  }

  public stopDrawLoop() {
    clearInterval(this.drawingIntervalFunc)
    this.refreshCounter = 0
    this.lastMouseEvent = null
  }
}
