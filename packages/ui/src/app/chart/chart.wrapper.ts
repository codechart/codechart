import invert from 'invert-color';
import {Node, Edge, IdType, DataSet, Network, Position, NetworkEvents, BoundingBox, Font, Color, NodeOptions, EdgeOptions} from 'vis';
import { ChartUtils, AttributesKey } from './chart.utils';
import {CcItemStyles, ChartConsts, ChartStyle, chosenFunc as ChosenFunc, chosenFunc} from './chart.consts';
import { HistoryItem, HistoryManager } from './history.manager';
import * as $ from 'jquery';
import { typesMapping } from './jsons';
import { Utils } from './Utils';
import { AppComponent } from '../app.component';
import { ChartStylingUtils } from './chart.styling';

export interface EventItem {
  id?: IdType,
  item?: Node | Edge,
  event?: MouseEvent,
  nodes?: IdType[],
  edges?: IdType[]
}

export class ChartWrapper {
  chart: Network;
  nodes: VisiNodes;
  edges: DataSet<Edge>;
  history: HistoryManager = new HistoryManager();
  canvas: any = null;

  constructor(private app: AppComponent) {
    this.nodes = new VisiNodes(this.app);
    this.edges = new VisiEdges(this.app);
  }

  initialize() { }

  selectAndUnselectAll() {
    let selection = this.getSelection()
    try {
      this.setSelection({ nodes: this.nodes.map(i => i.id), edges: this.edges.map(i => i.id) })
    } catch (err) {
      console.warn(err)
    }
    setTimeout(() => {
      this.setSelection(selection)
    }, 100)
  }

  updateEdges(att: any, funcs: { filterFunc?: (edge: Edge) => boolean, processFunc?: (node: Edge) => Edge }) {
    let edges = this.edges.map(i=>i)
    if (funcs) {
      if (funcs.filterFunc) edges = edges.filter(i => funcs.filterFunc(i))
      if (funcs.processFunc) edges = edges.map(i => { return Utils.deepMerge(i, funcs.processFunc(i)) })
    }

    let updatedEdges = edges.map(i => { return Utils.deepMerge(i, att) })
    this.edges.update(updatedEdges)
    console.log(`updated ${updatedEdges.length} items`)
    this.selectAndUnselectAll()
  }

  updateSelectionAtts(atts: any) {
    this.updateNodes(atts, {
      filterFunc: (node) => {
        return this.getSelection().nodes.concat(this.getSelection().edges).indexOf(node.id) !== -1
      }
    })
  }

  updateNodes(att: any, funcs: { filterFunc?: (edge: Node) => boolean, processFunc?: (node: Node) => Node }) {
    let nodes = this.nodes.map(i=>i);
    if (funcs) {
      if (funcs.filterFunc) nodes = nodes.filter(funcs.filterFunc)
      if (funcs.processFunc) nodes = nodes.map(funcs.processFunc)
    }

    let updatedNodes = nodes.map(i => { return Utils.deepMerge(i, att) })
    this.nodes.update(updatedNodes)
    console.log(`updated ${updatedNodes.length} items`)
    this.selectAndUnselectAll()
  }

  redraw() {
    this.chart.redraw()
  }

  refresh() {
    this.nodes.update(this.nodes.map(i => i))
    this.edges.update(this.edges.map(i => i))
    this.selectAndUnselectAll()
  }

  getNodes(filterFunc: (node: Node) => boolean, idOrNode: 'id' | 'node' = 'id'): IdType[] | Node {
    let nodes = this.nodes.get({ filter: filterFunc })
    if (idOrNode === 'id') return nodes.map(i => i.id)
    else return nodes as IdType[]
  }

  getBoundingBox(id: IdType): BoundingBox { return this.chart.getBoundingBox(id) }

  getFileNodeNeighboursBoudingBox(id: IdType, includeSelf = true) {
    let neighbours = this.getNeighboursByEdge(id, (edge) => { return ChartUtils.isFileEdge(edge) }).nodes;
    if (includeSelf) neighbours = neighbours.concat(id);
    else if (neighbours.length === 0) return this.chart.getBoundingBox(id);

    let resultBoundingBox = Utils.deepCopy(this.chart.getBoundingBox(neighbours[0]));
    neighbours.forEach(nodeId => {
      let nodeBoundingBox = this.chart.getBoundingBox(nodeId);
      if (nodeBoundingBox.top < resultBoundingBox.top) resultBoundingBox.top = nodeBoundingBox.top;
      if (nodeBoundingBox.left < resultBoundingBox.left) resultBoundingBox.left = nodeBoundingBox.left;
      if (nodeBoundingBox.right > resultBoundingBox.right) resultBoundingBox.right = nodeBoundingBox.right;
      if (nodeBoundingBox.bottom > resultBoundingBox.bottom) resultBoundingBox.bottom = nodeBoundingBox.bottom;
    });
    return resultBoundingBox;
  }

  public getCanvas() {
    return this.chart['canvas'].frame.canvas;
  }

  public getAllItemIds(): { nodes: IdType[], edges: IdType[] } {
    return { nodes: this.nodes.getIds(), edges: this.edges.getIds() };
  }

  setOnBeforeDrawEvent(callback: (ctx) => void) {
    this.chart.on('beforeDrawing', (ctx) => {
      callback(ctx);
    });
  }

  setBlurEdgeEvent(callback: (event: EventItem) => void) {
    this.chart.on('blurEdge', (event) => {
      callback(event);
    });
  }

  setHoverEdgeEvent(callback: (event: EventItem) => void) {
    this.chart.on('hoverEdge', (event) => {
      callback(event);
    });
  }

  setHoverNodeEvent(callback: (event: EventItem) => void) {
    this.chart.on('hoverNode', (event) => {
      callback(event);
    });
  }

  setBlurNodeEvent(callback: (event: any) => void) {
    this.chart.on('blurNode', (event) => {
      callback(event);
    });
  }

  setUp(chartElement: HTMLElement) {
    this.chart = new Network(chartElement, { nodes: this.nodes, edges: this.edges }, ChartConsts.chartStyle);
  }

  public setClickEvent(handler: (eventItem: EventItem) => void) {
    this.chart.on('click', (params) => {
      let clicked = this.extractClickedItemFromEvent(params);
      handler(clicked);
      console.log('clicked:', clicked.id, clicked.item);
      if (1 === 1) return;

      let clickedId;
      if (!params.nodes.length && !params.edges.length)
        handler(null);
      else {
        if (params.nodes.length) {
          clickedId = params.nodes.pop();
        } else {
          clickedId = params.edges.pop();
        }
      }
      if (clickedId) {
        handler(clicked);
        console.log('clicked:', clickedId, this.getItem(clickedId));
      }
    });
  }

  public setContextEvent(handler: (eventItem: EventItem) => void) {
    this.chart.on('oncontext', (params) => {
      handler(params)
    });
  }

  public setDragStartEvent(handler: (eventItem: EventItem) => void) {
    this.chart.on('dragStart', (params) => {
      let clicked = this.extractClickedItemFromEvent(params);
      handler(clicked);
    });
  }

  public setDragEndEvent(handler: (eventItem: EventItem) => void) {
    this.chart.on('dragEnd', (params) => {
      let clicked = this.extractClickedItemFromEvent(params);
      handler(clicked);
    });
  }

  private extractClickedItemFromEvent(params): { id: IdType, item: Node | Edge } {
    let clickedId;
    if (!params.nodes.length && !params.edges.length)
      return { id: null, item: null };
    else {
      if (params.nodes.length) {
        clickedId = params.nodes.pop();
      } else {
        clickedId = params.edges.pop();
      }
    }
    return { id: clickedId, item: this.getItem(clickedId) };
  }

  public setDoubleClickEvent(handler: (clickedItem, clickedId) => void) {
    this.chart.on('doubleClick', (clickedId) => {
      let item = this.getItem(clickedId);
      handler(item, clickedId);
    });
  }

  public setLabel(element, title) {
    element.label = title;
    if (title) {
      element = ChartUtils.setWasEdited(element)
    }
    if (ChartUtils.isNode(element)) this.nodes.update(element);
    else this.edges.update(element);
  }

  public setColor(items: { nodes: IdType[], edges: IdType[] }, color: string) {
    this.nodes.update(this.nodes.get(items.nodes).map(node => {
      let newNode = Utils.deepMerge(node, { color: { background: color } }, { icon: { color: color }, font: { background: color } });
      return newNode;
    }));
    this.edges.update(this.edges.get(items.edges).filter(edge => !ChartUtils.isFileEdge(edge)).map(egde => {
      return Utils.deepMerge(egde, { color: { color: color } });
    }));
  }

  public setBorderColor(items: { nodes: IdType[] }, color: string, invertColor?: boolean) {
    this.nodes.update(this.nodes.get(items.nodes).map(node => {
      let newNode = Utils.deepMerge(node, { color: { border: invertColor ? invert(color) : color }, font: { color: invertColor ? invert(color, true) : color } });
      return newNode;
    }));
  }

  setNodeIcon(nodes: IdType[], iconCode: string) {
    this.nodes.update(this.nodes.get(nodes).map(node => {
      let newNode = Utils.deepMerge(node, { icon: { code: iconCode } });
      return newNode;
    }));
  }

  setNodeImage(nodes: IdType[], imagePath: any, isCircular = true) {
    this.nodes.update(this.nodes.get(nodes).map(node => {
      let newNode = Utils.deepMerge(node, {
        shape: isCircular ? 'circularImage' : 'image', image: imagePath, shapeProperties: {
          useBorderWithImage: true,  // only for image shape
        }, borderWidth: 0
      });
      return newNode;
    }));
  }

  setNodeShape(nodes: IdType[], visShape: string) {
    this.nodes.update(this.nodes.get(nodes).map(node => {
      let newNode = Utils.deepMerge(node, { shape: visShape }, {borderWidth: 1});
      return newNode;
    }));
  }

  public setNodesStyle(nodes: IdType[], style: NodeOptions) {
    this.nodes.update(this.nodes.get(nodes).map((i) => {
      return Object.assign(i, style);
    }));
  }

  public setEdgesStyle(edges: IdType[], style: EdgeOptions) {
    this.edges.update(this.edges.get(edges).map((i) => {
      return Object.assign(i, style);
    }));
  }


  public setSize(items: { nodes: IdType[], edges: IdType[] }, size: number) {
    this.nodes.update(this.nodes.get(items.nodes).map(node => {
      return Utils.deepMerge(node, { font: { size: size }, icon: { size: size }, size: size });
    }));
    this.edges.update(this.edges.get(items.edges).filter(edge => !ChartUtils.isFileEdge(edge)).map(egde => {
      return Utils.deepMerge(egde, { width: size / 5 }, { font: { size: size } });
    }));
  }

  public setNodesSize(nodes: IdType[], size) {
    this.nodes.update(this.nodes.get(nodes).map(node => {
      return Utils.deepMerge(node, { font: { size: size }, icon: { size: size }, size: size });
    }));
  }

  public getNodeSize(node: Node): number {
    return node.size
  }

  public setNodesFontSize(nodes: IdType[], size) {
    this.nodes.update(this.nodes.get(nodes).map(node => {
      return Utils.deepMerge(node, { font: { size: size } });
    }));
  }

  public getNodeFontSize(node: Node): number {
    return (node.font as Font).size
  }

  public setEdgesSize(edges: IdType[], size) {
    this.edges.update(this.edges.get(edges).filter(edge => !ChartUtils.isFileEdge(edge)).map(egde => {
      size = size / 5
      let dahsesObject = egde.dashes ? { dashes: [size, size * 2] } : {}
      return Utils.deepMerge(egde, { width: size }, dahsesObject);
    }));
  }

  public getEdgeSize(edge: Edge) {
    return edge.width
  }

  public setEdgesLength(edges: IdType[], length) {
    let lengthObject = length !== NaN && length > 0 ? { length: length, physics: true, smooth: true } : { physics: false, smooth: false, length: undefined }
    this.edges.update(this.edges.get(edges).filter(edge => !ChartUtils.isFileEdge(edge)).map(egde => {
      return Utils.deepMerge(egde, lengthObject);
    }));
  }

  public setEdgeDash(edges: IdType[], isDashed) {
    this.edges.update(this.edges.get(edges).filter(edge => !ChartUtils.isFileEdge(edge)).map(egde => {
      let dashesObject = isDashed ? (egde.width ? [egde.width, egde.width * 2] : true) : false
      return Utils.deepMerge(egde, { dashes: dashesObject });
    }));
  }

  public setEdgesFontSize(edges: IdType[], size) {
    this.edges.update(this.edges.get(edges).filter(edge => !ChartUtils.isFileEdge(edge)).map(egde => {
      return Utils.deepMerge(egde, { font: { size: size } });
    }));
  }

  public getEdgeFontSize(edge: Edge) {
    if(!edge.font) return
    return (edge.font as Font).size
  }

  public setArrows(items: { nodes: IdType[], edges: IdType[] }, leftSide: boolean, rightSide: boolean) {
    this.edges.update(this.edges.get(items.edges).filter(edge => !ChartUtils.isFileEdge(edge)).map(egde => {
      return Object.assign({}, egde, {
        arrows: {
          to: { enabled: leftSide },
          from: { enabled: rightSide }
        }
      });
    }));
  }

  public getTitle(element) {
    if (!element) return '';
    return element.label;
  }

  public getAttributes(element: Node | Edge) {
    return element['d'];
  }

  public getNode(id): Node {
    if (!id) return null
    return this.nodes.get(id) as Node;
  }

  public setProperties(attributesJson: any) {
    delete attributesJson.id;
    delete attributesJson.physics;
    this.chart.getSelectedNodes().forEach(el => {
      attributesJson.id = el;
      this.nodes.update(attributesJson as Node);
    });
  }

  public setNodeSize(element: Node, size) {
    element.size = size;
  }

  public setEdgeSize(element: Edge, size) {
    element.width = size;
  }

  public getSelection(): { nodes: IdType[], edges: IdType[] } {
    return this.chart.getSelection();
  }

  public getItem(id: IdType): Edge | Node {
    let returned: Edge | Node;
    returned = this.nodes.get(id) as Node;
    if (returned === null) {
      returned = this.edges.get(id) as Edge;
    }
    return returned;
  }

  public getItems(ids: IdType[]): { nodes: Node[], edges: Edge[] } {
    return { nodes: this.nodes.get(ids), edges: this.edges.get(ids) };
  }

  public getPosition(itemId: IdType) {
    return this.chart.getPositions(itemId)[itemId];
  }

  public deleteItems(items: { nodes: IdType[], edges: IdType[] }) {
    let nodes: Node[] = [...this.nodes.get(items.nodes) as Node[]];
    let edges: Edge[] = [...this.edges.get(items.edges)] as Edge[];
    this.addToHistory(false);

    this.nodes.remove(items.nodes);
    this.edges.remove(items.edges);
  }

  public getProperty(item, property) {
    return item[AttributesKey][property];
  }

  private printNotReady() {
    console.log(new Error('wrapper not ready'));
  }

  public setNodePosition(item: Node, pos: Position, updateChart?: boolean) {
    item.x = pos.x;
    item.y = pos.y;
    if (updateChart) {
      this.nodes.update(item);
    }
    return item;
  }

  public setNodesPosition(items: { node: Node, pos: Position }[], updateChart?: boolean) {
    let nodesWithPositions = items.map(i => {
      i.node.x = i.pos.x;
      i.node.y = i.pos.y;
      return i.node;
    });
    if (updateChart) {
      this.nodes.update(nodesWithPositions, null, true);
    }
  }

  public addToHistory(isSearch) {
    this.history.push(new HistoryItem(this), isSearch);
  }

  public addNodesAndLinks(items: Array<Node | Edge>, overrideExisiting = false) {
    let nodes = ChartUtils.filterNodes(items)
    /*
        nodes = nodes.map(node => {
          Object.assign(node, ChartUtils.getStyleForTypesJson(typesMapping, node));
          return Object.assign({}, ChartStyles.baseNode, ChartStyles.baseNode, node);
        });
    */
    if (!overrideExisiting) {
      let allIds = this.getAllItemIds();
      nodes.filter(i => allIds.nodes.indexOf(i.id) === -1);
    }

    let edges = ChartUtils.filterEdges(items).map(edge => Object.assign({}, CcItemStyles.baseLink, edge));

    this.nodes.update(nodes.filter(i => ChartUtils.isFileNode(i)));
    this.nodes.update(nodes.filter(i => !ChartUtils.isFileNode(i)));
    this.edges.update(edges);
  }

  public getAllMatchNodes(): Node[] {
    return this.getItems(this.getAllItemIds().nodes).nodes.filter(i => ChartUtils.isMatchNode(i));
  }

  public getAllFileNodes(): Node[] {
    return this.getItems(this.getAllItemIds().nodes).nodes.filter(i => ChartUtils.isFileNode(i));
  }

  public simpleLoadFromJson(data: { nodes: Node[], edges: Edge[] }, optionsAfterLoad: { fitToAll, selectLoaded }) {
    let nodesProcessed = data.nodes.
      // set physics to false, set chosen func
      map(i => {
        if (!i.physics) {
          i.physics = false;
        }
        i['chosen'] = {node: ChosenFunc.node}
        if (i.widthConstraint) i.widthConstraint = Utils.deepCopy(CcItemStyles.baseNode.widthConstraint)
        return i;
      })
    let existingNodeIds = this.nodes.map(i => i.id)
    let newNodes = nodesProcessed.filter((i) => existingNodeIds.indexOf(i.id) == -1)

    this.nodes.update(newNodes);


    data.edges = ChartUtils.removeOrphanEdges(data.edges, this)
    data.edges = data.edges.map((i)=>{
      i = Object.assign(i,  {chosen: {edge: chosenFunc.edge}});
      return i
    })
    this.edges.update(data.edges);
    this.app.addFilesToLegend(this.getAllFileNodes())
    setTimeout(() => {
      this.styleLoaded();
      if (!optionsAfterLoad) return
      if (optionsAfterLoad.fitToAll) this.app.fitAllNodesOnScreen()
      if (optionsAfterLoad.selectLoaded) this.chart.setSelection({ nodes: newNodes.map(i => i.id), edges: [] })
    })
  }

  private styleLoaded() {
    ChartStylingUtils.styleToCurrentStyle(this)
  }

  public getAllNodes(chart: ChartWrapper, filterFunc: (node: Node) => void) {
    let allIds = chart.getAllItemIds().nodes
    let allNodes = chart.getItems(allIds)
    return allNodes.nodes.filter(i => filterFunc(i))
  }



  public setSelectionNodes(nodesIds: IdType[]) {
    this.chart.selectNodes(nodesIds);
  }

  setSelectionEdges(edgesIds: IdType[]) {
    this.chart.selectEdges(edgesIds);
  }

  setSelection(selection: { nodes: IdType[], edges: IdType[] }) {
    this.chart.setSelection(selection);
  }

  public undo() {
    let historyItem = this.history.pop();
    if (!historyItem) return;

    this.nodes.clear();
    this.edges.clear();
    this.nodes.add(historyItem.items.nodes);
    this.edges.add(historyItem.items.edges);
    this.app.clearFilesInLegend()
    this.app.addFilesToLegend(historyItem.items.nodes.filter(i => ChartUtils.isFileNode(i)))
  }

  public fitToNodes(nodeIds: IdType[], isAnimate = true) {
    let ids: string[] = nodeIds.map(i => i as string);
    this.chart.fit({ nodes: ids, animation: isAnimate });
  }

  public setData(nodes: Node[], edges: Edge[]) {
    this.history.push(new HistoryItem(this), true);
    this.nodes.clear();
    this.edges.clear();
    this.nodes.add(nodes);
    this.edges.add(edges);
  }

  public createLink(from: IdType, to: IdType, attributes: any, options?: { title?: string, idPrefix?: string }): Edge {
    const id = (options && options.idPrefix) ? `${options.idPrefix}_${from}_${to}` : `${from}_${to}`;
    let link = Object.assign({
      'id': id,
      'from': from,
      'to': to
    }, CcItemStyles.baseLink, attributes) as Edge;
    if (options && options.title) {
      Object.assign(link, { label: options.title });
    }
    return link;
  }

  public createNode(id, label, otherAttributes?: any): Node {
    let node = Utils.deepMerge(
      { id: id },
      CcItemStyles.baseNode,
      otherAttributes
    );
    if (label) node.label = label.trim();
    if (!node.d) node.d = {};
    node = Utils.deepMerge(node, otherAttributes);
    return node as Node;
  }

  public getNeighbours(id: IdType): { nodes: IdType[], edges: IdType[] } {
    return {
      nodes: this.chart.getConnectedNodes(id) as IdType[],
      edges: this.chart.getConnectedEdges(id)
    };
  }

  public getNeighboursByEdge(id: IdType, filterFunc: (edge: Edge) => boolean): { nodes: IdType[], edges: IdType[] } {
    let edges = this.getNeighbours(id).edges.filter(i => filterFunc(this.getItem(i) as Edge))
    let nodes = edges.map((i: IdType) => { let edge = this.getItem(i) as Edge; return edge.to === id ? edge.from : edge.to })
    return {
      nodes: nodes,
      edges: edges
    }
  }
  public convertToJson(): any {
    this.printNotReady();
  }

  public recenter(id: IdType) {
    this.printNotReady();
  }

  public getNodeType(node: Node) {
    return this.getProperty(node, 'type');
  }

  public setKeyboardDeleteEvent(handler: (e) => void) {
    $(document).keyup((e) => handler(e));
  }

  public updateNodesWithoutAtts(nodes: Node[], updateObject) {
    let updatedNodes = nodes.map(node => {
      let attObj = {};
      attObj[AttributesKey] = ChartUtils.getMatchAttributes(node);
      return Object.assign(node, updateObject, attObj);
    });
    this.nodes.update(updatedNodes);
  }

  public updateEdgesWithoutAtts(edges: Edge[], updateObject) {
    this.edges.update(edges.map(edge => {
      Object.assign(edge, updateObject);
    }));
  }

  public updateNodeAtts(nodes: Node[], attsObject) {
    let updatedNodes = nodes.map(node => {
      return Object.assign(node, { d: Object.assign(ChartUtils.getMatchAttributes(node), attsObject) });
    });
    this.nodes.update(updatedNodes);
  }

  getViewPos(): Position {
    return this.chart.getViewPosition();
  }

  public splitEdge(edge: Edge) {
    let edgeColor = edge.color['color']
    const splitNode = this.createNode(edge.id + "split_node", '', (Utils.deepMerge(
        CcItemStyles.baseNode, CcItemStyles.splitNode, {size: edge.width ? edge.width*2/3 : 2  })
    ))
    if(edgeColor) splitNode.color = {background: edgeColor}; else splitNode.color = {background: '#9B9B9B'}
    const positions = [this.getPosition(edge.from), this.getPosition(edge.to)]
    splitNode.x = (positions[0].x + positions[1].x)/2
    splitNode.y = (positions[0].y + positions[1].y)/2
    const newEdge1 = Utils.deepCopy(edge)
    newEdge1.id = "s1_" + edge.id; newEdge1.from = edge.from; newEdge1.to = splitNode.id;
    const newEdge2 = Utils.deepCopy(edge)
    newEdge2.id = "s2_" + edge.id; newEdge2.to = edge.to; newEdge2.from = splitNode.id;
    this.nodes.update(splitNode)
    this.edges.update([newEdge1, newEdge2])
    this.edges.remove(edge.id)
  }

  getEdge(id1: IdType, id2: IdType) {
    return this.edges.get();
  }

  updatePathsWindowsToLinux() {
    /*
      // file nodes ids
      Global_app.chart.updateNodes({}, {
          filterFunc: (node)=>{return node.d.path},
          processFunc: (node)=>{node.id = node.id.replace(/\/\//gi, "/"); return node}
      })

      // file nodes paths
      Global_app.chart.updateNodes({}, {
          filterFunc: (node)=>{return node.d.path},
          processFunc: (node)=>{node.d.path = node.d.path.replace(/\/\//gi, "/"); return node}
      })

      // match nodes
      Global_app.chart.updateNodes({}, {
          filterFunc: (node)=>{return node.d.ofFile},
          processFunc: (node)=>{node.d.ofFile = node.d.ofFile.replace(/\/\//gi, "/"); return node}
      })
     */
  }

}

export class VisiNodes extends DataSet<Node> {
  public constructor(public app: AppComponent) {
    super()
  }

  public simpleUpdate(data: Node | Node[], senderId?: IdType): IdType[] {
    return super.update(data, senderId)
  }

  public update(data: Node | Node[], senderId?: IdType, alignToGrid = false): IdType[] {

    let dataArr = data instanceof Array ? data : [data]
    data = ChartStylingUtils.setCodeLinesVisible(this.app, dataArr)

    if (alignToGrid) {
      setTimeout(() => {
        ChartStylingUtils.alignChartToGrid(this.app.chart)
      })
    }
    return super.update(data, senderId)
  }
}

export class VisiEdges extends DataSet<Edge> {
  public constructor(public app: AppComponent) {
    super()
  }

  public update(data: Edge | Edge[], senderId?: IdType): IdType[] {
    let dataArr = data instanceof Array ? data : [data]
    data = ChartStylingUtils.setInContentLinesVisible(this.app, dataArr)

    return super.update(data, senderId)
  }
}

