import { Node, Edge, IdType, DataSet, Network, Position, NetworkEvents } from 'vis';
import { ChartUtils, AttributesKey } from "./chart.utils";
import { ChartStyles, ChartConsts, ChartStyle } from "./chart.consts";
import { HistoryItem, HistoryManager } from "./history.manager";
import * as $ from 'jquery'
import { typesMapping } from "./jsons";
import { Utils } from './Utils';

export interface EventItem { id: IdType, item: Node | Edge }

export class ChartWrapper {
  chart: Network
  nodes: DataSet<Node>
  edges: DataSet<Edge>
  history: HistoryManager = new HistoryManager()
  canvas: any = null
  clearVisiIds: '/clearVisiIds'

  constructor() {
    this.nodes = new DataSet<Node>()
    this.edges = new DataSet<Edge>()
  }

  initialize() { }

  getNeighboursBoudingBox(id: IdType, includeSelf = true) {
    let neighbours = this.getNeighbours(id).nodes
    if(includeSelf) neighbours = neighbours.concat(id)
    else if(neighbours.length===0) return this.chart.getBoundingBox(id)
    
    let resultBoundingBox = this.chart.getBoundingBox(neighbours[0])
    neighbours.forEach(nodeId=>{
      let nodeBoundingBox = this.chart.getBoundingBox(nodeId)
      if(nodeBoundingBox.top < resultBoundingBox.top) resultBoundingBox.top = nodeBoundingBox.top
      if(nodeBoundingBox.left < resultBoundingBox.left) resultBoundingBox.left = nodeBoundingBox.left
      if(nodeBoundingBox.right > resultBoundingBox.right) resultBoundingBox.right = nodeBoundingBox.right
      if(nodeBoundingBox.bottom > resultBoundingBox.bottom) resultBoundingBox.bottom = nodeBoundingBox.bottom
    })
    return resultBoundingBox
  }

  public getCanvas() {
    return this.chart['canvas'].frame.canvas
  }

  public getAllItemIds(): { nodes: IdType[], edges: IdType[] } {
    return { nodes: this.nodes.getIds(), edges: this.edges.getIds() }
  }

  setOnBeforeDrawEvent(callback: (ctx) => void) {
    this.chart.on("beforeDrawing", (ctx) => {
      callback(ctx);
    })
  }

  setHoverNodeEvent(callback: (event: any) => void) {
    this.chart.on("hoverNode", (event) => {
      callback(event);
    })
  }

  setBlurNodeEvent(callback: (event: any) => void) {
    this.chart.on("blurNode", (event) => {
      callback(event);
    })
  }
  setUp(chartElement: HTMLElement) {
    this.chart = new Network(chartElement, { nodes: this.nodes, edges: this.edges }, ChartConsts.chartStyle);
  }

  public setClickEvent(handler: (eventItem: EventItem) => void) {
    this.chart.on('click', (params) => {
      console.log(params)
      let clicked = this.extractClickedItemFromEvent(params)
      handler(clicked)
      console.log('clicked:', clicked.id, clicked.item)
      if (1 === 1) return

      let clickedId
      if (!params.nodes.length && !params.edges.length)
        handler(null)
      else {
        if (params.nodes.length) {
          clickedId = params.nodes.pop()
        } else {
          clickedId = params.edges.pop()
        }
      }
      if (clickedId) {
        handler(clicked)
        console.log('clicked:', clickedId, this.getItem(clickedId))
      }
    });
  }

  public setDragStartEvent(handler: (eventItem: EventItem) => void) {
    this.chart.on('dragStart', (params) => {
      let clicked = this.extractClickedItemFromEvent(params)
      handler(clicked)
    })
  }

  public setDragEndEvent(handler: (eventItem: EventItem) => void) {
    this.chart.on('dragEnd', (params) => {
      let clicked = this.extractClickedItemFromEvent(params)
      handler(clicked)
    })
  }
  private extractClickedItemFromEvent(params): { id: IdType, item: Node | Edge } {
    let clickedId
    if (!params.nodes.length && !params.edges.length)
      return { id: null, item: null }
    else {
      if (params.nodes.length) {
        clickedId = params.nodes.pop()
      } else {
        clickedId = params.edges.pop()
      }
    }
    return { id: clickedId, item: this.getItem(clickedId) }
  }

  public setDoubleClickEvent(handler: (clickedItem, clickedId) => void) {
    this.chart.on('doubleClick', (clickedId) => {
      let item = this.getItem(clickedId)
      handler(item, clickedId)
    })
  }

  public setTitle(element, title) {
    element.label = title
    if (ChartUtils.isNode(element)) this.nodes.update(element)
    else this.edges.update(element)
  }

  public setColor(items: { nodes: IdType[], edges: IdType[] }, color: string) {
    console.log(this.nodes.get(items.nodes).map(node => {
      return Object.assign({}, node, { color: { background: color } })
    }))
    this.nodes.update(this.nodes.get(items.nodes).map(node => {
      return Object.assign({}, node, { color: { background: color } })
    }))
    this.edges.update(this.edges.get(items.edges).filter(edge => !ChartUtils.isFileEdge(edge)).map(egde => { return Object.assign({}, egde, { color: { color: color } }) }))
  }

  public setSize(items: { nodes: IdType[], edges: IdType[] }, size: number) {
    this.nodes.update(this.nodes.get(items.nodes).map(node => { return Object.assign({}, node, { font: { size: size } }) }))
    this.edges.update(this.edges.get(items.edges).filter(edge => !ChartUtils.isFileEdge(edge)).map(egde => { return Object.assign({}, egde, { width: size/3 }) }))
  }

  public setArrows(items: { nodes: IdType[], edges: IdType[] }, leftSide: boolean, rightSide: boolean) {
    this.edges.update(this.edges.get(items.edges).filter(edge => !ChartUtils.isFileEdge(edge)).map(egde => {
      return Object.assign({}, egde, {
        arrows: {
          to: { enabled: leftSide },
          from: { enabled: rightSide }
        }
      })
    }))
  }

  public getTitle(element) {
    if (!element) return ''
    return element.label
  }

  public getAttributes(element: Node | Edge) {
    return element['d']
  }

  public getNode(id): Node {
    return this.nodes.get(id) as Node
  }

  public setProperties(attributesJson: any) {
    delete attributesJson.id
    delete attributesJson.physics
    this.chart.getSelectedNodes().forEach(el => {
      attributesJson.id = el
      this.nodes.update(attributesJson as Node)
    })
  }

  public setNodeSize(element: Node, size) {
    element.size = size
  }

  public setEdgeSize(element: Edge, size) {
    element.width = size
  }

  public getSelection(): { nodes: IdType[], edges: IdType[] } {
    return this.chart.getSelection()
  }

  public getItem(id: IdType): Edge | Node {
    let returned: Edge | Node
    returned = this.nodes.get(id) as Node;
    if (returned === null) {
      returned = this.edges.get(id) as Edge
    }
    return returned
  }

  public getItems(ids: IdType[]): { nodes: Node[], edges: Edge[] } {
    return { nodes: this.nodes.get(ids), edges: this.edges.get(ids) }
  }

  public getPosition(itemId: IdType) {
    return this.chart.getPositions(itemId)[itemId];
  }

  public deleteItems(items: { nodes: IdType[], edges: IdType[] }) {
    let nodes: Node[] = [...this.nodes.get(items.nodes) as Node[]]
    let edges: Edge[] = [...this.edges.get(items.edges)] as Edge[]
    this.addToHistory()

    this.nodes.remove(items.nodes)
    this.edges.remove(items.edges)
  }

  public getProperty(item, property) {
    return item[AttributesKey][property]
  }

  private printNotReady() {
    console.log(new Error("wrapper not ready"))
  }

  public setNodePosition(item: Node, pos: Position, updateChart?: boolean) {
    item.x = pos.x
    item.y = pos.y
    if (updateChart) {
      this.nodes.update(item)
    }
    return item
  }

  public setNodesPosition(items: { node: Node, pos: Position }[], updateChart?: boolean) {
    let nodesWithPositions = items.map(i => { i.node.x = i.pos.x; i.node.y = i.pos.y; return i.node })
    if (updateChart) {
      this.nodes.update(nodesWithPositions)
    }
  }

  public addToHistory() {
    this.history.push(new HistoryItem(this))
  }

  public addNodesAndLinks(items: Array<Node | Edge>, overrideExisiting = false) {
    let nodes = ChartUtils.filterNodes(items).map(node => {
      Object.assign(node, ChartUtils.getStyleForTypesJson(typesMapping, node))
      return Object.assign({}, ChartStyles.baseNode, ChartStyles.baseNode, node)
    })
    if (!overrideExisiting) {
      let allIds = this.getAllItemIds()
      nodes.filter(i => allIds.nodes.indexOf(i.id) === -1)
    }

    let edges = ChartUtils.filterEdges(items).map(edge => Object.assign({}, ChartStyles.baseLink, edge))

    this.nodes.update(nodes.filter(i => ChartUtils.isFileNode(i)))
    this.nodes.update(nodes.filter(i => !ChartUtils.isFileNode(i)))
    this.edges.update(edges)
  }

  public getAllMatchNodes(): Node[] {
    return this.getItems(this.getAllItemIds().nodes).nodes.filter(i => ChartUtils.isMatchNode(i))
  }
  public simpleLoadFromJson(data: { nodes: Node[], edges: Edge[] }) {
    let nodesNoPhysics = data.nodes.map(i=>{if(!i.physics){i.physics=false}; return i})
    this.nodes.update(nodesNoPhysics)
    this.edges.update(data.edges)
  }

  public setSelectionNodes(nodesIds: IdType[]) {
    this.chart.selectNodes(nodesIds)
  }

  setSelectionEdges(edgesIds: IdType[]) {
    this.chart.selectEdges(edgesIds)
  }

  setSelection(selection: {nodes: IdType[], edges: IdType[]}) {
    this.chart.setSelection(selection)
  }

  public undo() {
    let historyItem = this.history.pop()
    if (!historyItem) return

    this.nodes.clear()
    this.edges.clear()
    this.nodes.add(historyItem.items.nodes)
    this.edges.add(historyItem.items.edges)
  }

  public fitToNodes(nodeIds: IdType[]) {
    let ids: string[] = nodeIds.map(i=>i as string)
    this.chart.fit({nodes: ids, animation: true})
  }

  public setData(nodes: Node[], edges: Edge[]) {
    this.history.push(new HistoryItem(this))
    this.nodes.clear()
    this.edges.clear()
    this.nodes.add(nodes)
    this.edges.add(edges)
  }

  public createLink(from, to, attributes: any, title?: string) {
    let link = Object.assign({
      "id": from + '_' + to + new Date().getTime(),
      "from": from,
      "to": to
    }, ChartStyles.baseLink, attributes) as Edge
    if (title) { Object.assign(link, { label: title }) }
    return link
  }

  public createNode(id, value, otherAttributes?: any): Node {
    let node = JSON.parse(JSON.stringify(Object.assign(
      { id: id },
      Utils.deepCopy(ChartStyles.baseNode),
      Utils.deepCopy(otherAttributes)
    )))
    node.label = value.trim()
    if (!node.d) node.d = {}
    let nodeProperties = {}
    if (otherAttributes) {
      nodeProperties = Object.assign(node.d, otherAttributes.d)
    }
    if (otherAttributes)
      node = Object.assign(node, otherAttributes, { d: nodeProperties })
    else
      node = Object.assign(node, { d: nodeProperties })
    return node as Node
  }

  public getNeighbours(id: IdType): { nodes: IdType[], edges: IdType[] } {
    return {
      nodes: this.chart.getConnectedNodes(id) as IdType[],
      edges: this.chart.getConnectedEdges(id)
    }
  }

  public getNotConnectedNodes(id: IdType): {nodes: IdType[], edges: IdType[]} {
    let neighbours = this.getNeighbours(id)
    let allItems = this.getAllItemIds()
    return {
      edges: allItems.edges.filter(i=>neighbours.edges.indexOf(i)===-1).filter(i=>i!==id),
      nodes: allItems.nodes.filter(i=>neighbours.nodes.indexOf(i)===-1).filter(i=>i!==id)
    }
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

  public setKeyboardDeleteEvent(handler: (e) => void) {
    $(document).keyup((e) => handler(e))
  }

  public updateNodesWithoutAtts(nodes: Node[], updateObject) {
    let updatedNodes = nodes.map(node => {
      let attObj = {}
      attObj[AttributesKey] = ChartUtils.getMatchAttributes(node)
      return Object.assign(node, updateObject, attObj)
    })
    this.nodes.update(updatedNodes)
  }

  public updateEdgesWithoutAtts(edges: Edge[], updateObject) {
    this.edges.update(edges.map(edge => { Object.assign(edge, updateObject) }))
  }

  public updateNodeAtts(nodes: Node[], attsObject) {
    let updatedNodes = nodes.map(node => {
      return Object.assign(node, { d: Object.assign(ChartUtils.getMatchAttributes(node), attsObject) })
    })
    this.nodes.update(updatedNodes)
  }

  public getPositions(id: IdType) {
    return this.chart.getPositions(id)[id]
  }

  getViewPos(): Position {
    return this.chart.getViewPosition();
  }

  getEdge(id1: IdType, id2: IdType) {
    return this.edges.get();
  }
}

