import {Node, Edge} from "vis";
export enum HistoryAction {ADD, REMOVE, SET}

export class HistoryItem {
  items: {nodes: Node[], edges: Edge[]} = {nodes: [], edges: []}
  type: HistoryAction
  constructor(nodes: Node[], edges: Edge[], action: HistoryAction) {
    this.items.nodes = [...nodes]
    this.items.edges = [...edges]
    this.type = action
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
