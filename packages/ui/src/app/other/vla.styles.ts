import {Network, DataSet, Node, Edge, IdType} from 'vis'
import {VlaActions} from "./vlaActions";

export const VlaStyles = {
  lockedNode: {e: 2, b: 'orange', ha0: {c: 'grey', w: 2, r: 35}},
  startNode: {e: 2, b: 'orange', c: 'orange', d: {}},
  normalLink: {type: "link", a1: true, c: 'rgb(155,155,155)', w: 5, ls: "solid", u: "", d: {}},
  normalNode: {type: "node", sh: 'box', ci: true, u: '', d: {}},
  fileNode: {"ha0": {"c": 'rgb(0,0,0)', "r": 35, "w": 1}},
  linkResultToFile: {dashes: true, a1: false, width: 0.2, d: {type: 'ofFile'}, color: "rgb(120, 120, 120)"},
  nodesTypes: {
    rectangle: {fs: 15, b: 'orange', sh: 'box', d: {type: 'remark'}},
    circle: {fs: 15, b: 'orange', sh: 'circle', d: {type: 'remark'}},
    w_sign: {fs: 15, b: 'orange', bw: 4, sh: 'w', d: {type: 'remark'}},
    e_sign: {fs: 15, b: 'orange', bw: 4, sh: 'e', d: {type: 'remark'}},
  },
  linkTypes: {
    dashedNonArrow: {ls: "dashed", w: 3, a1: false, a2: false},
    dashedArrow: {ls: "dashed", w: 3, a1: false, a2: true},
    solidNonArrow: {ls: "solid", w: 3, a1: false, a2: false},
    solidArrow: {ls: "solid", w: 3, a1: false, a2: true},
    dashedNonArrowSmall: {ls: "dashed", w: 0.2, a1: false, a2: false},
  },
  resultNode: {sh: 'box'}
}

export class ChartWrapper {
  chart: Network
  nodes: DataSet<Node>
  edges: DataSet<Edge>

  constructor() {
    this.nodes = new DataSet<Node>()
    this.edges = new DataSet<Edge>()
  }

  public setUp(chartElement: HTMLElement) {
    this.chart = new Network(chartElement, {nodes: this.nodes, edges: this.edges}, this.chartOptions);

  }

  public setClickEvent(handler: (clickedItem, clickedId)=>{}) {
    this.chart.on('click', (params) => {
      let clickedId = this.chart.getNodeAt(params.pointer.DOM)
      console.log(this.getItem(clickedId), clickedId)
      if(!clickedId)
        handler(null, null)
      else
        handler(this.getItem(clickedId), clickedId)
    });
  }

  public setDoubleClickEvent(handler: (clickedItem, clickedId)=>{}) {
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

  public setProperties(elements:Array<Node | Edge>) {
    elements.forEach(el=> {
      if (el instanceof Node) {
        this.nodes.update(el as Node)
      } else {
        this.edges.update(el as Edge)
      }
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

  public deleteItems(ids: IdType[]) {
    this.printNotReady()
  }

  public chartOptions = {
    height: '90%',
    physics: {
      enabled: true,
      repulsion: {
        nodeDistance: 50,
        springLength: 100,
        springConstant: 0.2
      },
      stabilization: {
        iterations: 20
      }
    },
    interaction: {hover: true},
    manipulation: {
      enabled: true
    }
  }

  public setItemProperies(item, deleteItem) {
    Object.assign(item.d, deleteItem)
  }

  public getProperty(item, property) {
    return item.d[property]
  }

  private printNotReady() {
    console.log(new Error("wrapper not ready"))
  }

  public addNodesAndLinks(items: Array<Node | Edge>, options: any) {
    this.nodes.add(ChartUtils.filterNodes(items))
    this.edges.add(ChartUtils.filterEdges(items))
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

  public createNode(id, value, style, otherAttributes?: any): Node {
    let node = JSON.parse(JSON.stringify(Object.assign(
      {id: id},
      VlaStyles.normalNode,
      style
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

  public reload() {
    this.printNotReady()
  }

  public getNodeType(node: Node) {
    return this.getProperty(node, 'type')
  }
}

export class ChartData {
  nodes: Node[]
  edges: Edge[]

  constructor() {
    this.nodes = []
    this.edges = []
  }

  public addNodesAndLinks(nodesAndLinks: Array<Node | Edge>) {
    this.nodes = this.nodes.concat(ChartUtils.filterNodes(nodesAndLinks))
    this.edges = this.edges.concat(ChartUtils.filterEdges(nodesAndLinks))
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
}

export const VlaExcludedFieldsWhenSavingJson = ['id', 'id1', 'id2', 'type', 'x', 'y', 't']

export const maxTitleLength = 20

