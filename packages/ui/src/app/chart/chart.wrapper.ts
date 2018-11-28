import {Node, Edge, IdType, DataSet, Network} from "vis";
import {ChartUtils} from "./chart.utils";
import {ChartStyles, ChartConsts, ChartStyle} from "./chart.styles";
import {HistoryAction, HistoryItem, HistoryManager} from "./history.manager";
import * as $ from 'jquery'

export class ChartWrapper {
  chart: Network
  nodes: DataSet<Node>
  edges: DataSet<Edge>
  history: HistoryManager = new HistoryManager()

  public chartOptions = ChartStyle

  constructor() {
    this.nodes = new DataSet<Node>()
    this.edges = new DataSet<Edge>()
  }

  public getAllItemIds(): {nodes: IdType[], edges: IdType[]} {
    return {nodes: this.nodes.getIds(), edges: this.edges.getIds()}
  }

  public setUp(chartElement: HTMLElement) {
    this.chart = new Network(chartElement, {nodes: this.nodes, edges: this.edges}, this.chartOptions);
  }

  public setClickEvent(handler: (clickedItem, clickedId)=>void) {
    this.chart.on('click', (params) => {
      console.log(params)
      let clickedId
      if(!params.nodes.length && !params.edges.length)
        handler(null, null)
      else {
        if(params.nodes.length) {
          clickedId = params.nodes.pop()
        } else {
          clickedId = params.edges.pop()
        }
      }
      if(clickedId) {
        handler(this.getItem(clickedId), clickedId)
        console.log('clicked:', clickedId, this.getItem(clickedId))
      }
    });
  }

  public setDoubleClickEvent(handler: (clickedItem, clickedId)=>void) {
    this.chart.on('doubleClick', (clickedId) => {
      let item = this.getItem(clickedId)
      handler(item, clickedId)
    })
  }

  public setTitle(element, title) {
    element.label = title
    this.nodes.update(element)
  }

  public getTitle(element) {
    if(!element) return ''
    return element.label
  }

  public getAttributes(element:Node | Edge) {
    return element['d']
  }

  public getNode(id):Node {
    return this.nodes.get(id) as Node
  }

  public setProperties(attributesJson: any) {
    delete attributesJson.id
    delete attributesJson.physics
    this.chart.getSelectedNodes().forEach(el=> {
      attributesJson.id = el
      this.nodes.update(attributesJson as Node)
    })
  }

  public setNodeSize(element:Node, size) {
    element.size = size
  }

  public setEdgeSize(element:Edge, size) {
    element.width = size
  }

  public getSelection():{nodes:IdType[], edges:IdType[]} {
    return this.chart.getSelection()
  }

  public getItem(id: IdType): Edge | Node {
    let returned: Edge | Node
    returned = this.nodes.get(id) as Node;
    if(returned === null) {
      returned = this.edges.get(id) as Edge
    }
    return returned
  }

  public deleteItems(items: {nodes: IdType[], edges: IdType[]}) {
    let nodes: Node[] = [...this.nodes.get(items.nodes) as Node[]]
    let edges: Edge[] = [...this.edges.get(items.edges)] as Edge[]
    this.history.push(new HistoryItem(nodes, edges, HistoryAction.REMOVE))

    this.nodes.remove(items.nodes)
    this.edges.remove(items.edges)
  }

  public getProperty(item, property) {
    return item.d[property]
  }

  private printNotReady() {
    console.log(new Error("wrapper not ready"))
  }

  public addNodesAndLinks(items: Array<Node | Edge>) {

    let nodes = ChartUtils.filterNodes(items).map(item=>Object.assign(item, ChartStyles.baseNode))
    let exsistingNodesIds = this.nodes.getIds()
    nodes = nodes.filter(node=>exsistingNodesIds.indexOf(node.id)==-1)

    let edges = ChartUtils.filterEdges(items).map(item=>Object.assign(item, ChartStyles.baseNode))
    let existingEdgesIds = this.edges.getIds()
    edges = edges.filter(edge=>existingEdgesIds.indexOf(edge.id)==-1)

    this.history.push(new HistoryItem(nodes, edges, HistoryAction.ADD))

    this.nodes.update(nodes)
    this.edges.update(edges)
    setTimeout(()=>{
      this.nodes.update(nodes.filter(node=>!ChartUtils.isFileNode(node)).map(i=>{
        return Object.assign(i, ChartStyles.matchNodeAfterTimeout)
      }))
      this.edges.update(edges.map(i=>{
        return Object.assign(i, ChartStyles.matchEdgeAfterTimeout)}))
    }, ChartConsts.timeForFixingNodes)
  }

  public setSelectionNodes(nodesIds: IdType[]) {
    this.chart.selectNodes(nodesIds)
  }

  setSelectionEdges(edgesIds: IdType[]) {
    this.chart.selectEdges(edgesIds)
  }

  public undo() {
    let historyItem = this.history.pop()
    if(!historyItem) return
    switch(historyItem.type) {
      case HistoryAction.ADD:
        this.deleteItems({nodes: historyItem.items.nodes.map(n=>n.id), edges: historyItem.items.edges.map(e=>e.id)})
        break
      case HistoryAction.REMOVE:
        this.addNodesAndLinks(historyItem.items.nodes.concat(historyItem.items.edges))
        break
      case HistoryAction.SET:
        this.nodes.clear()
        this.edges.clear()
        this.nodes.add(historyItem.items.nodes)
        this.edges.add(historyItem.items.edges)
        break;
    }
  }

  public setData(nodes: Node[], edges: Edge[]) {
    this.history.push(new HistoryItem([...this.nodes.get()], [...this.edges.get()], HistoryAction.SET))
    this.nodes.clear()
    this.edges.clear()
    this.nodes.add(nodes)
    this.edges.add(edges)
  }

  public createLink(from, to, attributes: any, title?: string) {
    let link =  Object.assign({
      "id": from + '_' + to,
      "from": from,
      "to": to
    }, ChartStyles.normalLink, attributes) as Edge
    if(title){Object.assign(link, {label: title})}
    return link
  }

  public createNode(id, value, otherAttributes?: any): Node {
    let node = JSON.parse(JSON.stringify(Object.assign(
      {id: id},
      ChartStyles.normalNode,
      otherAttributes
    )))
    node.label = value
    if(!node.d) node.d = {}
    let nodeProperties = {}
    if(otherAttributes) {
      nodeProperties = Object.assign(node.d, otherAttributes.d)
    }
    if (otherAttributes)
      node = Object.assign(node, otherAttributes, {d: nodeProperties})
    else
      node = Object.assign(node, {d: nodeProperties})
    return node as Node
  }

  public getNeighbours(id: IdType): {nodes: IdType[], edges: IdType[]} {
    return {
      nodes: this.chart.getConnectedNodes(id) as IdType[],
      edges: this.chart.getConnectedEdges(id)}
  }

  public convertToJson(): any {
    this.printNotReady()
  }

  public recenter(id: IdType) {
    this.printNotReady()
  }

  public getNodeType(node: Node) {
    return this.getProperty(node, 'type')
  }

  public setKeyboardDeleteEvent(handler: (e)=>void) {
    $(document).keyup((e)=>handler(e))
  }

  public updateNodesStyle(nodes: Node[], attributes) {
    let updatedNodes = nodes.map(node=>{
      return Object.assign(node, attributes, {d: ChartUtils.getAttributes(node)})
    })
    this.nodes.update(updatedNodes)
  }

  public updateEdgesStyle(edges: Edge[], attributes) {
    this.edges.update(edges.map(edge=>{Object.assign(edge, attributes)}))
  }

}

