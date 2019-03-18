import {AppComponent} from '../app.component';
import {ChartStyles, ChartConsts} from './chart.consts';
import {Node, Edge, IdType} from 'vis';
import {ChartWrapper} from './chart.wrapper';
import {AttributesKey, ChartUtils} from './chart.utils';
import {MatchInfo} from '../types.nodejs';
import {CreateUtils} from './create.utils';

export interface ContentOfMatch {
  content: string,
  startIndex: number,
  endIndex: number,
  lineStartIndex: number
}

export class ChartActions {
  private app: AppComponent;
  private chart: ChartWrapper;

  constructor(appComponent: AppComponent) {
    this.app = appComponent;
  }

  initialize() {
    this.chart = this.app.chart;
  }

  public clearDimmed() {
    let removedNodes: IdType[] = this.chart.nodes.get().filter(node => {
      return (node.color !== undefined && node.color.background === ChartConsts.dimColor && !ChartUtils.isFileNode(node));
    }).map(node => node.id);
    this.chart.deleteItems({nodes: removedNodes, edges: []});
  }

  public addNodesToChart(nodesAndLinks: Array<Node | Edge>): Array<Node | Edge> {
    let newNodesAndLinks = nodesAndLinks.filter((item) => {
      let itemOnChart = this.chart.getItem(item.id);
      if (itemOnChart === null) return true;
      let itemAttsChanged = (JSON.stringify(ChartUtils.getAttributes(itemOnChart)) !== JSON.stringify(ChartUtils.getAttributes(item)));
      if (itemAttsChanged) return true;
      else return false;
    });
    let existingFileNodesNumber = ChartUtils.filterNodes(this.chart.nodes.get()).filter(node => ChartUtils.isFileNode(node)).length;

    let addedFileIndex = 0//existingFileNodesNumber;
    // newNodesAndLinks.forEach((item: Node | Edge) => {
    //   if (ChartUtils.isFileNode(item)) {
    //     if (this.chart.getItem(item.id) === null) {
    //       let fileNode = this.setFileNodePos(item as Node, addedFileIndex);
    //       item = Object.assign(fileNode, ChartStyles.fileNode);
    //       addedFileIndex++;
    //     } else {
    //       return item
    //     }
    //   }
    // });

    console.log('added nodes and links', newNodesAndLinks);

    this.chart.addNodesAndLinks(newNodesAndLinks);

    this.app.resultIndex++;
    return nodesAndLinks;
  }

  private setFileNodePos(node: Node, fileNodeIndex: number) {
    let allFileNodes = this.chart.getItems(this.chart.getAllItemIds().nodes).nodes.filter(i=>ChartUtils.isFileNode(i))
    let allPositions = allFileNodes.map(i=>this.chart.getPosition(i.id))
    let largestXPos = allFileNodes.map(i=>this.chart.getPositions(i.id)).map(i=>i.x).filter(i=>i!=0).sort()[0]
    if(!largestXPos) largestXPos = 0
    let positions = ChartConsts.filePositions;
    let xPos = positions.distance*1.5 + largestXPos;
    let yPos = positions.distance * fileNodeIndex;
    let fileNode = Object.assign(node, {
      x: xPos,
      y: yPos
    });
    return fileNode;
  }

  public actionsAfterLoad(loadedNodesAndEdges) {
    // this.dimNodes(loadedNodesAndEdges)
  }

  public dimNodes(nodesAndEdges: Array<Node | Edge>) {
    let dimmedNodesIds = this.chart.getAllItemIds().nodes.filter(nodeId => {
      return (
        // not a file node
        !ChartUtils.isFileNode(this.chart.getItem(nodeId) as Node) &&
        // not a non path node
        !this.isPathNode(this.chart.getItem(nodeId) as Node) &&
        //not added now
        nodesAndEdges.map(node => {
          return node.id;
        }).indexOf(nodeId) == -1
      );
    });
    let dimmedNodes: Node[] = dimmedNodesIds.map(nodeId => {
      return this.chart.getItem(nodeId) as Node;
    });
    this.chart.updateNodesWithoutAtts(dimmedNodes, ChartStyles.dimmedNode);

    let addedNodes = ChartUtils.filterNodes(nodesAndEdges).filter(node => !ChartUtils.isFileNode(node));
    this.chart.updateNodesWithoutAtts(addedNodes, ChartStyles.normalNode);
  }

  private dimEdges(addedNodesAndEdges: Array<Node | Edge>) {
    let dimmedEdgesIds = this.chart.getAllItemIds().edges.filter(edgeId => {
      return (
        // not a file edge
        !ChartUtils.isFileEdge(this.chart.getItem(edgeId) as Edge) &&
        // is an edge connecting
        !this.isPathEdge(this.chart.getItem(edgeId) as Edge) &&
        //not added now
        addedNodesAndEdges.map(edge => {
          return edge.id;
        }).indexOf(edgeId) == -1
      );
    });
    let dimmedEdges: Edge[] = dimmedEdgesIds.map(edgeId => {
      return this.chart.getItem(edgeId) as Edge;
    });
    this.chart.updateEdgesWithoutAtts(dimmedEdges, ChartStyles.dimmedEdge);
  }

  public clearChart() {
    this.app.chart.setData([], []);
  }

  public createShape(selectedNode, shapeType: string): Node {
    let newNode, newLink = null;
    if (selectedNode !== null && selectedNode) {
      let newNode = this.chart.createNode(shapeType + selectedNode.id + new Date().getTime(), 'new remark', ChartStyles.nodesTypes[shapeType].node);
      let newLink = this.chart.createLink(selectedNode.id, newNode.id, ChartStyles.nodesTypes[shapeType].link);
      this.addNodesToChart([newNode, newLink]);
    } else {
      let newNode = this.chart.createNode(shapeType + new Date().getTime(), 'new remark', ChartStyles.nodesTypes[shapeType].node);
      this.addNodesToChart([newNode]);
    }
    return newNode;
  }

  public setNodesStyle(nodes: Node[], newStyle: any) {
    let updatedNodes: Node[] = [];
    nodes.forEach((node) => {
      updatedNodes.push(ChartUtils.setNewStyleAndGet(node, newStyle));
    });
    this.chart.nodes.update(updatedNodes);
  }

  public setEdgesStyle(edges: Edge[], newStyle: any) {
    let updatedEdges: Edge[] = [];
    edges.forEach((edge) => {
      updatedEdges.push(ChartUtils.setNewStyleAndGet(edge, newStyle));
    });
    this.chart.edges.update(updatedEdges);
  }

  public loadNodePrevStyle(node) {
    if (!node.d.prevStyle) return;
    Object.keys(node.d.prevStyle).forEach(styleField => {
      node[styleField] = node.d.prevStyle[styleField];
      delete node.d.prevStyle[styleField];
    });
  }

  public getNeighborNodesIds(nodeId: IdType): IdType[] {
    return this.app.chart.getNeighbours(nodeId).nodes;
  }

  public getSurroundingEdgesIds(nodeId: IdType): IdType[] {
    return this.chart.getNeighbours(nodeId).edges;
  }

  public deleteSelected() {
    let selection = this.chart.getSelection();
    let fileNodes: IdType[] = selection.nodes.filter(item => this.chart.getNode(item)['d']['fileContent']);
    let fileNodesNeighbours: IdType[] = [];
    fileNodes.forEach(node => {
      fileNodesNeighbours = fileNodesNeighbours.concat(this.getNeighborNodesIds(node));
    });
    this.chart.deleteItems({nodes: fileNodesNeighbours, edges: []});
    this.chart.deleteItems(selection);
  }

  public getSelectedLinksOrNodesOnly() {
    let chartSelection = this.chart.getSelection()
    if(chartSelection.nodes.length>0) {
      return {edges:[], nodes: chartSelection.nodes}
    } else {
      return {edges:chartSelection.edges, nodes: []}
    }
  }

  public undo() {
    this.chart.undo();
  }

  setPathNode(node: Node | Edge) {
    let updatedNode = Object.assign({}, ChartStyles.pathNode, Object.assign(node['d'], ChartStyles.pathNodeAttribute));
    this.chart.updateNodesWithoutAtts([node as Node], updatedNode);
  }

  isPathNode(node: Node) {
    return (ChartUtils.getAttributes(node).pathNodeAttribute);
  }

  isPathEdge(edge: Edge) {
    return (this.isPathNode(this.chart.getItem(edge.to) as Node)
      &&
      this.isPathNode(this.chart.getItem(edge.from) as Node));
  }

  public setSelectedAsPath() {
    if (this.app.selectedNode === null) return;
    this.setPathNode(this.app.selectedNode);
  }

  public getNodeContent(node): ContentOfMatch {
    if (this.app.currentFile === null) {
      console.log('no file selected');
      return;
    }
    let match: MatchInfo = ChartUtils.getAttributes(node) as MatchInfo;
    let index = match.indexInLine + match.lineStartIndex;
    let stopConditionMax = 10000;
    let stopCondition = 0;
    let fileContent = this.app.currentFile.content;
    while (fileContent.charAt(index) !== '{' && stopCondition < stopConditionMax) {
      index++;
      stopCondition++;
    }
    let startIndex = index;
    index++;
    let count = 1;
    while (count != 0 && stopCondition < stopConditionMax) {
      if (fileContent.charAt(index) === '{') count++;
      else if (fileContent.charAt(index) === '}') count--;
      index++;
      stopCondition++;
    }
    let endIndex = index + 1;
    return {
      content: this.app.currentFile.content.substring(startIndex, endIndex),
      startIndex: startIndex,
      endIndex: endIndex,
      lineStartIndex: startIndex
    };
  }

  public setNodeTitle(node: Node, title){
    let lineNumber = ChartUtils.getLineNumber(node)
    if(lineNumber) {
      this.chart.setTitle(node, CreateUtils.getMatchNodeLabel(lineNumber, title))
    } else {
      this.chart.setTitle(node, title)
    }
  }

  public getNodesInMatchContent(content: ContentOfMatch, fileNodeId: IdType): Node[] {
    let ids: IdType[] = this.chart.getNeighbours(fileNodeId).nodes;
    let fileNodes = this.chart.getItems(ids).nodes;
    return fileNodes.filter((node: Node) => {
      let lineStartIndex = ChartUtils.getLineStartIndex(node);
      let indexInLine = ChartUtils.getIndexInLine(node);
      if (lineStartIndex === undefined || indexInLine === undefined) return false;
      let matchIndex = lineStartIndex + indexInLine;
      return (matchIndex > content.startIndex && matchIndex < content.endIndex);
    });
  }

  public connectNodeToMatchesInContent(node: Node) {
    if (ChartUtils.isFileNode(node)) return;
    let content: ContentOfMatch = this.getNodeContent(node);
    let fileNodeId = ChartUtils.isFileNode(node) ? node.id : ChartUtils.getOfFile(node);
    let nodesInsideContent = this.getNodesInMatchContent(content, fileNodeId);
    if (nodesInsideContent.length === 0) {
      console.log('no nodes inside content of match', node);
      return;
    }
    let addedLinks: Edge[] = [];
    nodesInsideContent.forEach(insideNode => {
      addedLinks.push(CreateUtils.createMatchEdge(this.chart, node.id, insideNode.id, 'inside content'));
    });
    this.addNodesToChart(addedLinks);
  }

}
