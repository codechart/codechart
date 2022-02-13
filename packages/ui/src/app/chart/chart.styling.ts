import { Color, Edge, IdType, Node } from 'vis';
import { AppComponent } from "../app.component";
import { ChartConsts } from './chart.consts';
import { AttributesKey, ChartUtils } from "./chart.utils";
import { ChartWrapper } from './chart.wrapper';
import { Utils } from './Utils';

export class ChartStylingUtils {
  chart: ChartWrapper;

  constructor(private appComponent: AppComponent) { }

  initialize() {
  }


  public static setInContentLinesVisible(app: AppComponent, edges: Edge[]): Edge {
    return edges.map((edge: Edge) => {
      if (!ChartUtils.isInContentEdge(edge)) return edge
      if (!app.Options.showInContentLines) edge.hidden = true
      else edge.hidden = false
      return edge
    })
  }

  public static setCodeLinesVisible(app: AppComponent, nodes: Node[]): Node[] {
    let filterFunc = (node: Node) => ChartUtils.isMatchNode(node) && !ChartUtils.isWasEdited(node)
    let processFunc = (node: Node) => {
      if (app.Options.showCodeLabels) {
        if (!node.label) node.label = ChartUtils.getMatchCodeLineLabel(node)
      } else {
        node.label = ''
      }
      return node
    }

    nodes.forEach((node) => {
      if (!filterFunc(node)) return
      return processFunc(node)
    })

    return nodes
  }

  public static alignChartToGrid(chart: ChartWrapper, nodes: Node[]) {
    let matchCorrections: { node: Node, deltaX, deltaY }[] = []
    console.log(nodes.map(i=>i.x))
    // position matches, save save deltas per match
    let allNodes: Node[] = nodes.map((node) => {
      if (ChartUtils.isFilenameNode(node)) return node
      let currentX = node.x
      let roundedX = Utils.round(node.x, ChartConsts.gridBaseSize)
      node.x = roundedX ? roundedX : currentX
      let deltaX = node.x - currentX

      let currentY = node.y
      let roundedY = Utils.round(node.y, ChartConsts.gridBaseSize)
      node.y = roundedY ? roundedY : currentY
      let deltaY = node.y - currentY

      matchCorrections.push({ node, deltaX, deltaY })
      return node
    })
    console.log(allNodes.map(i=>i.x))

    // save map of neighbours of map corrections (filename nodes)
    let neighboursCorrections: Map<IdType, { deltaX, deltaY }> = new Map()
    matchCorrections.forEach((matchCorrection) => {
      chart.getItems(chart.getNeighbours(matchCorrection.node.id).nodes).nodes.forEach((node) => {
        if (!ChartUtils.isFilenameNode(node)) return
        neighboursCorrections.set(node.id, { deltaX: matchCorrection.deltaX, deltaY: matchCorrection.deltaY })
      })
    })

    // update neighbours of match positions
    allNodes = allNodes.map((i) => {
      let correction = neighboursCorrections.get(i.id)
      if (!correction) return i
      i.x += correction.deltaX
      i.y += correction.deltaY
      return i
    })
    console.log(allNodes.map(i=>i.x))

    chart.nodes.simpleUpdate(allNodes)
  }

  public getFileRectangle(node: Node, chart: ChartWrapper) {
    let boundingRect = chart.getFileNodeBoundingBox(node.id, true);
    let rectangleTop = boundingRect.top
    let rectangleLeft = boundingRect.left
    let rectColor = (node.color as Color).border;
    let rectX = rectangleLeft;
    let rectY = rectangleTop;
    let rectW = boundingRect.right - rectangleLeft;
    let rectH = boundingRect.bottom - rectangleTop;
    return { rectColor, rectX, rectY, rectW, rectH, boundingRect };
  }

  public static styleToCurrentStyle(chart: ChartWrapper) {
    // files
    chart.updateNodes( {
      borderWidth: 0,
      shape: 'box',
      font: { size: 40, align: 'left', color: "#2D2D2D", background: undefined, strokeWidth: 0}
    }, {      filterFunc: ChartUtils.isFileNode    }
    );

    // match links
    chart.updateEdges( {
        borderWidth: 3
      }, {filterFunc: ChartUtils.isMatchEdge});

    // match nodes
    chart.updateNodes( {
      font: { align: 'left', background: "#2D2D2D", color: "#ADADAD",  strokeWidth: 0, bold: true},
      shape: 'circularImage',
      image: '/assets/nodes/code.png',
      borderWidth: 0,
      imagePadding: 20
    }, {filterFunc: ChartUtils.isMatchNode});

    // content edges
    chart.updateEdges( {
        arrows: { to: true },
        dashes: [10, 20],
        width:10,
        color: {color: '77ACF1', opacity: 0.7}
    }, {filterFunc: ChartUtils.isInContentEdge});

    // file name nodes
    chart.updateNodes( {
        borderWidth: 0,
        color: {
          border: 'white',
          highlight: {
            border: 'black',
            background: 'white'
          },
          hover: {
            border: 'black',
            background: 'white',
            size: "40px"
          },
          font: { align: 'left', background: "#2D2D2D", color: "#ADADAD",  strokeWidth: 0, bold: true}
        }
      }, {filterFunc: ChartUtils.isFilenameNode});

      // filename edges
      chart.updateEdges( {
        dashes: true,
        width: 1
      }, {filterFunc: ChartUtils.isFilenameEdge});

      // no border on all nodes
      chart.updateNodes( {
        borderWidth: 0
      }, {});
  }

  public styleToCurrentStyle_() {
    /*
    // files
    Global_app.chart.updateNodes( {
      borderWidth: 0,
      shape: 'box'
    }, {filterFunc: (i)=>i.d.fileContent});

    // match links
    Global_app.chart.updateEdges( {
        borderWidth: 3
      }, {filterFunc: (i)=>i.id.indexOf('match')!==-1});

    // match nodes
    Global_app.chart.updateNodes( {
      font: { background: 'white', size: 20, align: 'left', strokeWidth: 1 },
      shape: 'circularImage',
      image: '/assets/nodes/code.png',
      borderWidth: 0,
      imagePadding: 20
    }, {filterFunc: (i)=>i.d.line});

    // content edges
    Global_app.chart.updateEdges( {
        arrows: { to: true },
        dashes: [10, 20],
        width:10,
        color: {color: '77ACF1', opacity: 0.7}
      }, {filterFunc: (i)=>i.id.indexOf('content')!==-1});

      // file name nodes
      Global_app.chart.updateNodes( {
          borderWidth: 0,
          color: {
            border: 'white',
            highlight: {
              border: 'black',
              background: 'white'
            },
            hover: {
              border: 'black',
              background: 'white',
              size: "40px"
            }
          }
        }, {filterFunc: (i)=>i.id.indexOf('filename')!==-1});

      // filename edges
      Global_app.chart.updateEdges( {
        dashes: true,
        width: 1
      }, {filterFunc: (i)=>i.id.indexOf('filename')!==-1});

      // no border on all nodes
      Global_app.chart.updateNodes( {
        borderWidth: 0
      });
     */
  }


}
