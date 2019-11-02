import {AppComponent} from '../app.component';
import {ChartConsts, ChartStyles, ContentEdgeTypes, ContentEdgeTypes_type} from './chart.consts';
import {Edge, IdType, Node} from 'vis';
import {ChartWrapper} from './chart.wrapper';
import {ChartUtils} from './chart.utils';
import {MatchInfo} from '../types.nodejs';
import {CreateUtils} from './create.utils';
import {Utils} from './Utils';

export interface ContentOfMatch {
  content: string,
  startIndex: number,
  endIndex: number,
  lineStartIndex: number
}
export interface AddedFileMatches {fileNode: Node, matches: Node[], links: Edge[]}

export class ChartActions {
  private app: AppComponent;
  private chart: ChartWrapper;

  constructor(appComponent: AppComponent) {
    this.app = appComponent;
  }

  initialize() {
    this.chart = this.app.chart;
  }

  getMatcheNodesPositions (matchNodes: Node[], xPos, centerYPos): {x, y}[] {
    let yStep = ChartConsts.matchDistance.y
    let yRange = yStep * (matchNodes.length - 1)
    let topY = centerYPos - yRange/2
    let positions: {x, y}[] = matchNodes.map((i, index)=>{
      if(i.x || i.y) return {x: i.x, y: i.y}
      else return {
        y:  topY + index*yStep,
        x: xPos
      }
    })
    return positions
  }

  public addToChartAndPosition(nodesAndLinks: Array<Node | Edge>): Array<Node | Edge> {
    let addedIds = nodesAndLinks.filter(i=>{return (ChartUtils.isNode(i) && ChartUtils.isMatchNode(i))}).map(i=>i.id)

    // update ones where atts changed
    let newNodesAndLinks = nodesAndLinks.map((item) => {
      let itemOnChart = this.chart.getItem(item.id);
      if (itemOnChart === null) return item;
      ChartUtils.setAttributes(item, ChartUtils.getMatchAttributes(item));
      return item
    });

    // position matche nodes and file nodes
    let addedFileIndex = 0;//existingFileNodesNumber;
    let filesToMatches: {[fileId: string]: {matchNodes: Node[], fileNode: Node}} = {}
    let nodesAndLinksPositioned: Array<Node | Edge> = []
    let selectedMatchFile = (this.app.selectedNode && ChartUtils.isMatchNode(this.app.selectedNode)) ? ChartUtils.getOfFile((this.app.selectedNode)) : null
    newNodesAndLinks.forEach((item: Node | Edge) => {
      if (ChartUtils.isNode(item )) {
        item = item as Node;
        // file nodes
        if (ChartUtils.isFileNode(item)) {
          let allFileNodes = this.chart.getItems(this.chart.getAllItemIds().nodes).nodes.filter(i => ChartUtils.isFileNode(i));
          let largestYPos = allFileNodes.map(i => this.chart.getNeighboursBoudingBox(i.id)).map(i => i.bottom).sort((i, j) => {
            return j - i;
          })[0];
          addedFileIndex++;
          let fileNode = this.setFileNodePos_Directional(item as Node, addedFileIndex, largestYPos)
          nodesAndLinksPositioned.push(fileNode)
          if(!filesToMatches[fileNode.id]) {
            filesToMatches[fileNode.id] = {matchNodes: [], fileNode: fileNode}
          } else {
            filesToMatches[fileNode.id].fileNode = fileNode
          }
          return
        }
        // match node
        else if (ChartUtils.isMatchNode(item)) {
          let ofFile = ChartUtils.getOfFile(item)
          if(!filesToMatches[ofFile]) {
            filesToMatches[ofFile] = {matchNodes: [item], fileNode: this.chart.getNode(ofFile)}
          }
          else filesToMatches[ofFile].matchNodes.push(item)
          return
        }
      }
      // edges or non match nodes
      nodesAndLinksPositioned.push(item);
    });

    // position match Nodes
    let matchesXPos = this.app.selectedNode ? this.chart.getPosition(this.app.selectedNode.id).x + ChartConsts.matchDistance.x : ChartConsts.matchDistance.x
    for(let fileId in filesToMatches) {
      let positions: {x,y}[] = []
      if((selectedMatchFile && fileId===selectedMatchFile) && this.app.selectedNode.id) {
        positions = this.getMatcheNodesPositions(filesToMatches[fileId].matchNodes, matchesXPos, this.chart.getPosition(this.app.selectedNode.id).y)
      } else {
        let filePosY = filesToMatches[fileId].fileNode.y ? filesToMatches[fileId].fileNode.y : this.chart.getPosition(fileId).y
        positions = this.getMatcheNodesPositions(filesToMatches[fileId].matchNodes, matchesXPos, filePosY)
      }

      // if any nodes exist in added nodes positions - move down added nodes to below lowest existing node
      const allMatchIdsOfFile = this.chart.getNeighbours(fileId).nodes;
      const allMatchIdsOfSameX = this.chart.getItems(allMatchIdsOfFile).nodes.filter(i=>(i.x>=matchesXPos-100 && i.x<=matchesXPos+100))
      if(allMatchIdsOfSameX.length>0) {
        const largestYMatchPos = allMatchIdsOfSameX.map(i=>i.y).sort((a,b)=>{return b-a})[0]
        positions = positions.map((i)=>{return {
          x: i.x,
          y: i.y + largestYMatchPos
        }})
      }
      filesToMatches[fileId].matchNodes = filesToMatches[fileId].matchNodes.map((i, index)=>{
        i.x = positions[index].x
        i.y = positions[index].y
        return i
      })
    }

    console.log('added nodes and links', newNodesAndLinks);
    console.log(newNodesAndLinks.filter(i=>ChartUtils.isMatchNode(i)).map((i: Node)=>i.y))

    this.chart.addNodesAndLinks(newNodesAndLinks, true);

    this.app.resultIndex++;
    setTimeout(() => {
      let addedMatches = newNodesAndLinks.filter(i=>{return (ChartUtils.isNode(i) && ChartUtils.isMatchNode(i))})
      this.setInnerContentEdges((node: Node)=>{return ChartUtils.getContentEndLine(node)}, ChartStyles.insideContentLink, ContentEdgeTypes.insideContent, addedMatches);
      this.setInnerContentEdges((node: Node)=>{return ChartUtils.getEndLineNumber(node)}, ChartStyles.insideSelectionLink, ContentEdgeTypes.insideSelection, addedMatches);
    }, 0);
    return nodesAndLinks;
  }

  private setInnerContentEdges(getOtherEndLine: (node: Node) => number, edgeStyle: any, edgeType: ContentEdgeTypes_type, matchNodes: Node[]) {
    let addedEdges: Edge[] = [];
    let allMatches = this.chart.getAllMatchNodes();
    matchNodes.forEach(i => {
      allMatches.forEach(j => {
        if (i.id === j.id) return;
        let otherEndLineNumber = getOtherEndLine(j);
        let otherLineNumber = ChartUtils.getLineNumber(j);
        let myLineNumber = ChartUtils.getLineNumber(i);
        let myEndLineNumber = getOtherEndLine(i)
        if(ChartUtils.getOfFile(i)!==ChartUtils.getOfFile(j)) return
        let isInside = (myLine, otherLine, otherEndLine) => {
          return (otherEndLine && (myLine > otherLine && myLine < otherEndLine))
        }
        if(
          (myEndLineNumber && isInside(myEndLineNumber, otherLineNumber, otherEndLineNumber))
          ||
          isInside(myLineNumber, otherLineNumber, otherEndLineNumber)
        ){
          addedEdges.push(this.chart.createLink(j.id, i.id, edgeStyle, edgeType));
        } else if (          (otherEndLineNumber && isInside(otherEndLineNumber, myLineNumber, myEndLineNumber))
          ||
          isInside(otherLineNumber, myLineNumber, myEndLineNumber)
        ){
          addedEdges.push(this.chart.createLink(i.id, j.id, edgeStyle, edgeType));
        }
      });
    });
    this.chart.addNodesAndLinks(addedEdges);
  }

  private setFileNodePos_Directional(node: Node, fileNodeIndex: number, largestYPos) {
    if(this.chart.getItem(node.id) && this.chart.getItem(node.id)!==null) return node
    let xPos, yPos;
    if (largestYPos === undefined) {
      xPos = 0;
      yPos = ChartConsts.fileDistance.y * fileNodeIndex;
    } else {
      xPos = 0;
      yPos = ChartConsts.fileDistance.y * fileNodeIndex + largestYPos;
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
    return (ChartUtils.getMatchAttributes(node).pathNodeAttribute);
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
    let nodeLine = ChartUtils.getLineNumber(node)
    let endLine = Utils.getEndLineOfBlock(this.app.currentFile.lines, nodeLine)
    let content = endLine ? this.app.currentFile.lines.slice(nodeLine, nodeLine + endLine).join('\r\n') : this.app.currentFile.lines[nodeLine]

    return {
      content: content,
      startIndex: nodeLine,
      endIndex: endLine,
      lineStartIndex: 0
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
