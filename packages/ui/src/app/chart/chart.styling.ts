import { Color, Edge, IdType, Node } from 'vis';
import { AppComponent } from "../app.component";
import { CcItemStyles, ChartConsts, NodeTypes } from './chart.consts'
import { AttributesKey, ChartUtils } from "./chart.utils";
import { ChartWrapper } from './chart.wrapper';
import { Utils } from './Utils';
import { FileNode, VisiNode } from '../types.nodejs'

export class ChartStylingUtils {
  chart: ChartWrapper;

  constructor(private appComponent: AppComponent) { }

  public setInContentLinesVisible(app: AppComponent, edges: Edge[]): Edge {
    return edges.map((edge: Edge) => {
      if (!ChartUtils.isInContentEdge(edge)) return edge
      if (!app.Options.showInContentLines) edge.hidden = true
      else edge.hidden = false
      return edge
    })
  }

  public setCodeLinesVisible(app: AppComponent, nodes: Node[]): Node[] {
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

  public alignChartToGrid(chart: ChartWrapper, nodes: Node[]) {
    let matchCorrections: { node: Node, deltaX, deltaY }[] = []
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
    chart.nodes.simpleUpdate(allNodes)
  }

  public getFileRectangle(node: FileNode, chart: ChartWrapper) {
    let boundingRect = chart.getFileNodeBoundingBox(node, true);
    // if(boundingRect.top = this.chart.getBoundingBox(node.id).top) boundingRect.top = this.chart.getBoundingBox(node.id).bottom

    let rectangleTop = boundingRect.top
    let rectangleLeft = boundingRect.left
    let rectColor = (node.color as Color).border;
    let rectX = rectangleLeft;
    let rectY = rectangleTop;
    let rectW = boundingRect.right - rectangleLeft;
    let rectH = boundingRect.bottom - rectangleTop;
    return { rectColor, rectX, rectY, rectW, rectH, boundingRect };
  }

  public updateNodesToCurrentCode(chart: ChartWrapper) {
    chart.nodes.update(chart.getAllNodes((i: VisiNode) => (i.d.type === "groupNode"))
      .map((i: VisiNode) => {
        Object.assign(i.d, {
          type: NodeTypes.groupNode 
        })
        return i
      }))
  }

  public styleToCurrentStyle(chart: ChartWrapper) {
    // new style for circular images
    chart.nodes.update(chart.getAllNodes(i => true).filter(i => (i.shape === "circularImage" && i['d'].lineNumber))
      .map((i) => {
        Object.assign(i, {
          font: { background: "white", color: "black" },
          shape: 'dot',
          borderWidth: 2
        })
        return i
      }))

    chart.nodes.update(chart.getAllNodes(i => true).filter(i => (i.id as String).indexOf("boundary") !== -1).map(i => Object.assign(i,
      CcItemStyles.boundaryNode
    )))

    chart.edges.update(chart.getAllEdges(i => true).filter(i => i.arrows).map((i: any) => {
      if (i.arrows.to && i.arrows.to.enabled) i.arrows.to.scaleFactor = 1
      if (i.arrows.from && i.arrows.from.enabled) i.arrows.from.scaleFactor = 1
      return i
    }))

    chart.nodes.update(chart.getAllNodes(i => true).filter(i => (i['d'].type === "remark"))
      .map((i) => {
        Object.assign(i, CcItemStyles.nodesTypes.find(j => j.name === "remark").details.node)
        return i
      }))

  }

  public usefulJsFunctions() {
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

      // flip nodes
      Global_app.nodes.update(Global_app.chart.getAllNodes(i=>i).map((i)=>{i.x = -i.x; return i}))

     */
  }




}
