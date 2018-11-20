import {Network, DataSet, Node, Edge, IdType} from 'vis'
import {VlaActions} from "./vlaActions";
import * as $ from 'jquery'


export const VlaStyles = {
  baseNode: {widthConstraint:{minimum: 50, maximum: 400}},
  baseNodeAfterTimeout: {}, //{physics: {fixed:true}},
  startNode: {d:{}},
  lockedNode: {e: 2, b: 'orange', ha0: {c: 'grey', w: 2, r: 35}},
  normalLink: {type: "link", a1: true, c: 'rgb(155,155,155)', w: 5, ls: "solid", u: "", d: {}},
  normalNode: {shape: 'box', d: {}},
  fileNode: {color: {background: '#787878'}, font: {size: 20}, scaling:{label: true}, physics: {fixed:true}},
  fileLink: {dashes: true, a1: false, width: 0.2, d: {type: 'ofFile'}, color: "rgb(120, 120, 120)"},
  nodesTypes: {
    rectangle: {fs: 15, b: 'orange', sh: 'box', d: {type: 'remark'}}
  },
  linkTypes: {
    dashedArrow: {ls: "dashed", w: 3, a1: false, a2: true},
  },
  resultNode: {sh: 'box'}
}

export class ChartWrapper {
  chart: Network
  nodes: DataSet<Node>
  edges: DataSet<Edge>

  public chartOptions = {
    height: '90%',
    physics: {
      enabled: true,
      repulsion: {
        centralGravity: 0.2,
        springLength: 200,
        springConstant: 0.05,
        nodeDistance: 100,
        damping: 0.09
      },
      stabilization: {
        enabled: false,
        iterations: 20,
        updateInterval: 2,
        onlyDynamicEdges: false,
        fit: true
      },
      solver: "repulsion",
      timestep: 0.2
    },
    interaction:{
      dragNodes:true,
      dragView: true,
      hideEdgesOnDrag: false,
      hideNodesOnDrag: false,
      hover: false,
      hoverConnectedEdges: true,
      keyboard: {
        enabled: true,
        speed: {x: 10, y: 10, zoom: 0.02},
        bindToWindow: true
      },
      multiselect: true,
      navigationButtons: true,
      selectable: true,
      selectConnectedEdges: true,
      tooltipDelay: 300,
      zoomView: true
    },
    edges: {
      smooth: {
        enabled: true, type: "vertical", roundness: 0, forceDirection: "none"
      }
    }

  }

  constructor() {
    this.nodes = new DataSet<Node>()
    this.edges = new DataSet<Edge>()
  }

  public setUp(chartElement: HTMLElement) {
    this.chart = new Network(chartElement, {nodes: this.nodes, edges: this.edges}, this.chartOptions);
  }

  public setClickEvent(handler: (clickedItem, clickedId)=>void) {
    this.chart.on('click', (params) => {
      let clickedId = this.chart.getNodeAt(params.pointer.DOM)
      console.log(this.getItem(clickedId), clickedId)
      if(!clickedId)
        handler(null, null)
      else
        handler(this.getItem(clickedId), clickedId)
    });
  }

  public setKeyboardEvents() {

  }

  public setDoubleClickEvent(handler: (clickedItem, clickedId)=>void) {
    this.chart.on('doubleClick', (clickedId) => {
      let item = this.getItem(clickedId)
      handler(item, clickedId)
    })
  }

  public nodeColorJson(color) {
    return {c: color}
  }

  public linkColorJson(color) {
    return {b: color}
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
      returned = this.nodes.get(id) as Edge
    }
    return returned
  }

  public deleteItems(items: {nodes: IdType[], edges: IdType[]}) {
    this.nodes.remove(items.nodes)
    this.edges.remove(items.edges)
  }

  public getProperty(item, property) {
    return item.d[property]
  }

  private printNotReady() {
    console.log(new Error("wrapper not ready"))
  }

  public addNodesAndLinks(items: Array<Node | Edge>, options: any) {
    let nodes = ChartUtils.filterNodes(items).map(item=>Object.assign(item, VlaStyles.baseNode))
    let edges = ChartUtils.filterEdges(items).map(item=>Object.assign(item, VlaStyles.baseNode))

    this.nodes.update(nodes)
    this.edges.update(ChartUtils.filterEdges(items))
    setTimeout(()=>{
      this.nodes.update(this.nodes.get().map(i=>{
        return Object.assign(i, VlaStyles.baseNodeAfterTimeout)
      }))
      this.edges.update(this.edges.get().map(i=>{
        return Object.assign(i, VlaStyles.baseNodeAfterTimeout)}))
    }, 1000)
  }

  public setSelectionNodes(nodesIds: IdType[]) {
    this.chart.selectNodes(nodesIds)
  }

  setSelectionEdges(edgesIds: IdType[]) {
    this.chart.selectEdges(edgesIds)
  }


  public setData(nodes: Node[], edges: Edge[]) {
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
    }, VlaStyles.normalLink, attributes) as Edge
    if(title){this.setTitle(link, title)}
    return link
  }

  public createNode(id, value, otherAttributes?: any): Node {
    let node = JSON.parse(JSON.stringify(Object.assign(
      {id: id},
      VlaStyles.normalNode,
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
}

export class ChartUtils {
  public static isNode(item) {
    return this.getEdgeFrom(item) ? false : true
  }

  public static getEdgeFrom(edge: Edge): IdType {
    return edge.from
  }

  public static getEdgeTo(edge: Edge): IdType {
    return edge.to
  }

  public static filterNodes(nodesAndLinks: Array<Node | Edge>): Node[] {
    return nodesAndLinks.filter(i => {if(ChartUtils.isNode(i)) return i}) as Node[]
  }

  public static filterEdges(nodesAndLinks: Array<Node | Edge>): Edge[] {
    return nodesAndLinks.filter(i => {if(!ChartUtils.isNode(i)) return i}) as Edge[]
  }

  public static setNodeAttributes(element: Node | Edge, attributes: any) {
      return Object.assign(element, {d:attributes})
  }

  public static getNodeAttributes(element: Node | Edge) {
    return element['d']
  }
}

export const VlaExcludedFieldsWhenSavingJson = ['id', 'id1', 'id2', 'type', 'x', 'y', 't']

export const maxTitleLength = 20

