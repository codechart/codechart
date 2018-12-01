import {Node, Edge} from "vis";
import {ChartWrapper} from "./chart.wrapper";

export class HistoryItem {
  items: {nodes: Node[], edges: Edge[]} = {nodes: [], edges: []}
  constructor(chart: ChartWrapper) {
    let historyNodes = chart.nodes.get().map(node=>{return Object.assign({}, node, chart.getPositions(node.id))})
    let historyEdges = chart.edges.get().map(edge=>{return Object.assign({}, edge, chart.getPositions(edge.id))})

    this.items.nodes = historyNodes
    this.items.edges = historyEdges
  }
}

export class HistoryManager {
  history: HistoryItem[] = []
  public push(newItem: HistoryItem) {
    this.history.push(newItem)
  }
  public pop(): HistoryItem {
    return this.history.pop()
  }
}
