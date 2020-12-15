import { Edge, IdType, Node } from 'vis';
import { AppComponent } from "../app.component";
import { ChartConsts } from './chart.consts';
import { AttributesKey, ChartUtils } from "./chart.utils";
import { ChartWrapper, VisiNodes } from "./chart.wrapper";
import { Utils } from './Utils';

export class ChartStylingUtils {
  chart: ChartWrapper;

  constructor(private appComponent: AppComponent) { }

  initialize() {
  }


  public static setCodeLinesVisible(app: AppComponent, nodes: Node[]): Node[] {
    let filterFunc = (node: Node) => ChartUtils.isMatchNode(node) && !ChartUtils.isWasEdited(node) && !ChartUtils.isForceShowLabel(node)
    let processFunc = (node: Node) => {
      if (app.Options.showCodeLabels) {
        if (ChartUtils.getReplaceLabel(node)) ChartUtils.setReplaceLabel(node, node.label)
      } else {
        ChartUtils.setReplaceLabel(node, node.label)
        node.label = ''
      }
      return node
    }

    nodes.forEach((node) => {
      if (!filterFunc(node)) return
      return processFunc(node)
    })

    nodes.forEach((node) => {
      if (!(ChartUtils.isMatchNode(node) && ChartUtils.isForceShowLabel(node))) return
      node.label = ChartUtils.getReplaceLabel(node)
      return node
    })

    return nodes
  }

  public static alignChartToGrid(chart: ChartWrapper) {
    let matchCorrections: {node: Node, deltaX, deltaY}[] = []
    // position matches, save save deltas per match
    let allNodes: Node[] = chart.nodes.map((node) => {
      if (!ChartUtils.isMatchNode(node)) return node
      let currentX = node.x
      node.x = Utils.round(node.x, ChartConsts.gridBaseSize)
      let deltaX = node.x - currentX

      let currentY = node.y
      node.y = Utils.round(node.y, ChartConsts.gridBaseSize)
      let deltaY = node.y - currentY

      matchCorrections.push({node, deltaX, deltaY})
      return node
    })

    // save map of neighbours of map corrections (filename nodes)
    let neighboursCorrections: Map<IdType, {deltaX, deltaY}> = new Map()
    matchCorrections.forEach((matchCorrection)=>{
      chart.getItems(chart.getNeighbours(matchCorrection.node.id).nodes).nodes.forEach((node)=>{
        if(!ChartUtils.isFilenameNode(node)) return
        neighboursCorrections.set(node.id, {deltaX: matchCorrection.deltaX, deltaY: matchCorrection.deltaY})
      })
    })

    // update neighbours of match positions
    allNodes = allNodes.map((i)=>{
      let correction = neighboursCorrections.get(i.id)
      if(!correction) return i
      i.x += correction.deltaX
      i.y += correction.deltaY
      return i
    })

    chart.nodes.simpleUpdate(allNodes)
  }
}
