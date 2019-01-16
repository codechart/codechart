import {Node, Edge, IdType, DataSet, Network} from "vis";
import {ChartUtils, AttributesKey} from "./chart.utils";
import {ChartStyles, ChartConsts, ChartStyle} from "./chart.consts";
import {HistoryItem, HistoryManager} from "./history.manager";
import * as $ from 'jquery'
import {typesMapping} from "./jsons";

export interface EventItem {id: IdType, item: Node | Edge}

export class ChartWrapper {
  chart: Network
  nodes: DataSet<Node>
  edges: DataSet<Edge>
  history: HistoryManager = new HistoryManager()

  constructor() {
    this.nodes = new DataSet<Node>()
    this.edges = new DataSet<Edge>()
  }

  initialize() {}

  public getAllItemIds(): {nodes: IdType[], edges: IdType[]} {
    return {nodes: this.nodes.getIds(), edges: this.edges.getIds()}
  }

  public setUp(chartElement: HTMLElement) {
    this.chart = new Network(chartElement, {nodes: this.nodes, edges: this.edges}, ChartConsts.chartStyle);
    this.chart.on("beforeDrawing", (ctx) => {
      let fileNodes = this.nodes.get().filter(node=>{return ChartUtils.isFileNode(node)})
      fileNodes.forEach(node=> {
        let position = this.getPositions(node.id)
        let x = position.x
        let y = position.y
        ctx.beginPath();
        ctx.lineWidth = 1;
        ctx.strokeStyle = 'black';
        ctx.arc(x, y, ChartConsts.filePositions.distance/2, 0, 2*Math.PI);
        ctx.stroke();
      })
    });

  }

  public setClickEvent(handler: (eventItem: EventItem)=>void) {
    this.chart.on('click', (params) => {
      console.log(params)
      let clicked = this.extractClickedItemFromEvent(params)
      handler(clicked)
      console.log('clicked:', clicked.id, clicked.item)
      if(1===1) return

      let clickedId
      if(!params.nodes.length && !params.edges.length)
        handler(null)
      else {
        if(params.nodes.length) {
          clickedId = params.nodes.pop()
        } else {
          clickedId = params.edges.pop()
        }
      }
      if(clickedId) {
        handler(clicked)
        console.log('clicked:', clickedId, this.getItem(clickedId))
      }
    });
  }

  public setDragStartEvent(handler: (eventItem: EventItem)=>void) {
    this.chart.on('dragStart', (params) => {
      let clicked = this.extractClickedItemFromEvent(params)
      handler(clicked)
    })
  }

  public setDragEndEvent(handler: (eventItem: EventItem)=>void) {
    this.chart.on('dragEnd', (params) => {
      console.log('end:', params)
      let clicked = this.extractClickedItemFromEvent(params)
      handler(clicked)
    })
  }
  private extractClickedItemFromEvent(params): {id: IdType, item: Node | Edge} {
    let clickedId
    if(!params.nodes.length && !params.edges.length)
      return {id: null, item: null}
    else {
      if(params.nodes.length) {
        clickedId = params.nodes.pop()
      } else {
        clickedId = params.edges.pop()
      }
    }
    return {id: clickedId, item: this.getItem(clickedId)}
  }


  public setDoubleClickEvent(handler: (clickedItem, clickedId)=>void) {
    this.chart.on('doubleClick', (clickedId) => {
      let item = this.getItem(clickedId)
      handler(item, clickedId)
    })
  }

  public setTitle(element, title) {
    element.label = title
    if(ChartUtils.isNode(element)) this.nodes.update(element)
    else this.edges.update(element)
  }

  public setColor(items: {nodes: IdType[], edges: IdType[]}, color: string) {
    this.nodes.update(this.nodes.get(items.nodes).map(node=>{return Object.assign({}, node, {color: {background: color}})}))
    this.edges.update(this.edges.get(items.edges).filter(edge=>!ChartUtils.isFileEdge(edge)).map(egde=>{return Object.assign({}, egde, {color: {color: color}})}))
  }

  public setSize(items: {nodes: IdType[], edges: IdType[]}, size: number) {
    this.nodes.update(this.nodes.get(items.nodes).map(node=>{return Object.assign({}, node, {font: {size: size}})}))
    this.edges.update(this.edges.get(items.edges).filter(edge=>!ChartUtils.isFileEdge(edge)).map(egde=>{return Object.assign({}, egde, {width: size/10})}))
  }

  public setArrows(items: {nodes: IdType[], edges: IdType[]}, leftSide:boolean, rightSide: boolean) {
    this.edges.update(this.edges.get(items.edges).filter(edge=>!ChartUtils.isFileEdge(edge)).map(egde=>{return Object.assign({}, egde, {arrows: {
      to:{enabled:leftSide},
      from: {enabled:rightSide}
    }})}))
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

  public getItems(ids: IdType[]): {nodes: Node[], edges: Edge[]} {
    return {nodes: this.nodes.get(ids), edges: this.edges.get(ids)}
  }

  public getPosition(itemId: IdType) {
    return this.chart.getPositions(itemId);
  }

  public deleteItems(items: {nodes: IdType[], edges: IdType[]}) {
    let nodes: Node[] = [...this.nodes.get(items.nodes) as Node[]]
    let edges: Edge[] = [...this.edges.get(items.edges)] as Edge[]
    this.history.push(new HistoryItem(this))

    this.nodes.remove(items.nodes)
    this.edges.remove(items.edges)
  }

  public getProperty(item, property) {
    return item[AttributesKey][property]
  }

  private printNotReady() {
    console.log(new Error("wrapper not ready"))
  }

  public addNodesAndLinks(items: Array<Node | Edge>) {
    let nodes = ChartUtils.filterNodes(items).map(node=>{
      Object.assign(node, ChartUtils.getStyleForTypesJson(typesMapping, node))
      return Object.assign({}, ChartStyles.normalNode, ChartStyles.baseNode, node)
    })

    let edges = ChartUtils.filterEdges(items).map(edge=>Object.assign({}, ChartStyles.normalLink, edge))

    this.history.push(new HistoryItem(this))
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

    this.nodes.clear()
    this.edges.clear()
    this.nodes.add(historyItem.items.nodes)
    this.edges.add(historyItem.items.edges)
  }

  public setData(nodes: Node[], edges: Edge[]) {
    this.history.push(new HistoryItem(this))
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
    node.label = value.trim()
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

  public updateNodesWithoutAtts(nodes: Node[], updateObject) {
    let updatedNodes = nodes.map(node=>{
      let attObj = {}
      attObj[AttributesKey] = ChartUtils.getAttributes(node)
      return Object.assign(node, updateObject, attObj)
    })
    this.nodes.update(updatedNodes)
  }

  public updateEdgesWithoutAtts(edges: Edge[], updateObject) {
    this.edges.update(edges.map(edge=>{Object.assign(edge, updateObject)}))
  }

  public updateNodeAtts(nodes: Node[], attsObject) {
    let updatedNodes = nodes.map(node=>{
      return Object.assign(node, {d: Object.assign(ChartUtils.getAttributes(node), attsObject)})
    })
    this.nodes.update(updatedNodes)
  }

  public getPositions(id: IdType) {
    return this.chart.getPositions(id)[id]
  }
}

