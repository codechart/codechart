import {AppComponent} from '../app.component';
import {ChartConsts, ChartStyles, ContentEdgeTypes, ContentEdgeTypes_type} from './chart.consts';
import {Edge, IdType, Node} from 'vis';
import {ChartWrapper} from './chart.wrapper';
import {ChartUtils} from './chart.utils';
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


  public addToChartAndPosition(nodesAndLinks: Array<Node | Edge>, alignByNode: Node = null): Array<Node | Edge> {
    if(!alignByNode) alignByNode = this.app.selectedNode as Node
    // filter out nodes that exist
    let newNodesAndLinks = nodesAndLinks.filter((item) => {
      let itemOnChart = this.chart.getItem(item.id);
      if (itemOnChart === null) return true;
      let itemAttsChanged = (JSON.stringify(ChartUtils.getAttributes(itemOnChart)) !== JSON.stringify(ChartUtils.getAttributes(item)));
      if (itemAttsChanged) return true;
      else return false;
    });

    let addedFileIndex = 0;//existingFileNodesNumber;
    newNodesAndLinks.map((item: Node | Edge) => {
      if (ChartUtils.isNode(item)) {
        item = item as Node;
        // file nodes
        if (ChartUtils.isFileNode(item)) {
          let allFileNodes = this.chart.getItems(this.chart.getAllItemIds().nodes).nodes.filter(i => ChartUtils.isFileNode(i));
          let largestYPos = allFileNodes.map(i => this.chart.getNeighboursBoudingBox(i.id)).map(i => i.bottom).sort((i, j) => {
            return j - i;
          })[0];
          addedFileIndex++;
          if (this.app.layout === 'directional')
            return this.setFileNodePos_Directional(item as Node, addedFileIndex, largestYPos);
          else
            return this.setFileNodePos_Normal(item as Node, addedFileIndex, largestYPos);
        }
        // match node
        else if (ChartUtils.isMatchNode(item)) {
          let ofFileId = ChartUtils.getOfFile(item);
          let ofFileNode = this.chart.getPosition(ofFileId);
          if (!ofFileNode) {
            ofFileNode = newNodesAndLinks.find(i => i.id === ofFileId);
          }

          if (item['x'] === undefined && item['y'] === undefined) {
            if (this.app.layout === 'spread') {
              item['x'] = ofFileNode.x + Math.random() * (ChartConsts.filePositions.distance / 2 + ChartConsts.filePositions.distance / 2) - ChartConsts.filePositions.distance / 2;
              item['y'] = ofFileNode.y + Math.random() * (ChartConsts.filePositions.distance / 2 + ChartConsts.filePositions.distance / 2) - ChartConsts.filePositions.distance / 2;
            } else {
              item['x'] = alignByNode ? (this.chart.getPosition(alignByNode.id).x + ChartConsts.filePositions.distance) : 0;
              item['y'] = ofFileNode.y + Math.random() * (ChartConsts.filePositions.distance - 10) - ChartConsts.filePositions.distance / 2;
            }
            item.physics = false;
          }
        }
      }
      return item;
    });

    console.log('added nodes and links', newNodesAndLinks);

    this.chart.addNodesAndLinks(newNodesAndLinks);

    this.app.resultIndex++;
    setTimeout(() => {
      this.setInnerContentEdges((node: Node)=>{return ChartUtils.getContentEndLine(node)}, ChartStyles.insideContentLink, ContentEdgeTypes.insideContent);
      this.setInnerContentEdges((node: Node)=>{return ChartUtils.getEndLineNumber(node)}, ChartStyles.insideSelectionLink, ContentEdgeTypes.insideSelection);
    }, 0);
    return nodesAndLinks;
  }

  private setInnerContentEdges(getOtherEndLine: (node: Node) => number, edgeStyle: any, edgeType: ContentEdgeTypes_type) {
    let addedEdges: Edge[] = [];
    let allMatches = this.chart.getAllMatchNodes();
    allMatches.forEach(i => {
      allMatches.forEach(j => {
        if (i.id === j.id) return;
        let otherEndLineNumber = getOtherEndLine(j);
        if(!otherEndLineNumber) return
        let otherLineNumber = ChartUtils.getLineNumber(j);
        let myLineNumber = ChartUtils.getLineNumber(i);
        let myEndLineNumber = getOtherEndLine(i)
        if(ChartUtils.getOfFile(i)!==ChartUtils.getOfFile(j)) return
        let isInside = (myLine, otherLine, otherEndLine) => {
          return (myLine > otherLine && myLine < otherEndLine)
        }
        if(
          (myEndLineNumber && isInside(myEndLineNumber, otherLineNumber, otherEndLineNumber))
          ||
          isInside(myLineNumber, otherLineNumber, otherEndLineNumber)
        ){
          addedEdges.push(this.chart.createLink(j.id, i.id, edgeStyle, edgeType));
        }
      });
    });
    this.chart.addNodesAndLinks(addedEdges);
  }

  private setFileNodePos_Directional(node: Node, fileNodeIndex: number, largestYPos) {
    if(this.chart.getItem(node.id) && this.chart.getItem(node.id)!==null) return node
    let positions = ChartConsts.filePositions;
    let xPos, yPos;
    if (largestYPos === undefined) {
      xPos = 0;
      yPos = positions.distance * fileNodeIndex;
    } else {
      xPos = 0;
      yPos = positions.distance * fileNodeIndex + largestYPos;
    }
    let fileNode = Object.assign(node, {
      x: xPos,
      y: yPos
    });
    return fileNode;
  }


  private setFileNodePos_Normal(node: Node, fileNodeIndex: number, largestXPos) {
    let allFileNodes = this.chart.getItems(this.chart.getAllItemIds().nodes).nodes.filter(i => ChartUtils.isFileNode(i));
    let positions = ChartConsts.filePositions;
    let xPos, yPos;
    if (largestXPos === undefined) {
      xPos = 0;
      yPos = positions.distance * fileNodeIndex;
    } else {
      xPos = positions.distance * 1.5 + largestXPos;
      yPos = positions.distance * fileNodeIndex;
    }
    let fileNode = Object.assign(node, {
      x: xPos,
      y: yPos
    });
    return fileNode;
  }


  public clearChart() {
    this.app.chart.setData([], []);
  }

  public createShape(selectedNode, shapeType: string): Node {
    shapeType = shapeType.toLowerCase();
    let newNode, newLink = null;
    if (selectedNode !== null && selectedNode) {
      let addedNodes = []
      let newNode = this.chart.createNode(shapeType + selectedNode.id + new Date().getTime(), 'new remark', ChartStyles.nodesTypes[shapeType].node);

      this.chart.setNodePosition(newNode, this.chart.getViewPos());
      let newLink = this.chart.createLink(selectedNode.id, newNode.id, ChartStyles.nodesTypes[shapeType].link);
      addedNodes.push(newLink)
      if(ChartUtils.isOfFile(selectedNode) || ChartUtils.isFileNode(selectedNode)) {
        let fileNode
        if(ChartUtils.isFileNode(selectedNode)) {
          fileNode = selectedNode.id
        } else {
          fileNode = ChartUtils.getOfFile(selectedNode)
        }
        let fileLink = CreateUtils.createFileEdge(this.chart, fileNode, newNode.id)
        ChartUtils.setOfFile(newNode, fileNode, this.chart) 
        addedNodes.push(fileLink)
      }
      addedNodes.push(newNode)
      this.addToChartAndPosition(addedNodes);
    } else {
      let newNode = this.chart.createNode(shapeType + new Date().getTime(), 'new remark', ChartStyles.nodesTypes[shapeType].node);
      this.addToChartAndPosition([newNode]);
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
    let chartSelection = this.chart.getSelection();
    if (chartSelection.nodes.length > 0) {
      return {edges: [], nodes: chartSelection.nodes};
    } else {
      return {edges: chartSelection.edges, nodes: []};
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

  public setNodeTitle(node: Node, title) {
    let lineNumber = ChartUtils.getLineNumber(node);
    let endLineNumber = ChartUtils.getEndLineNumber(node)
    if (lineNumber) {
      title = title.substring(title.match(/(\(\d+-?\d+?\):)|(.+)/gi)[0].length, title.length)
      this.chart.setTitle(node, CreateUtils.getMatchNodeLabel(lineNumber, endLineNumber, title));
    } else {
      this.chart.setTitle(node, title);
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

}
