import {AppComponent, Options} from '../app.component';
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
  endIndex: number
}

export interface AddedFileMatches {
  fileNode: Node,
  matches: Node[],
  links: Edge[]
}

export enum PositioningOptions {VERTICAL, HORIZONTAL}

export class ChartActions {
  private app: AppComponent;
  private chart: ChartWrapper;

  constructor(appComponent: AppComponent) {
    this.app = appComponent;
  }

  initialize() {
    this.chart = this.app.chart;
  }

  getMatcheNodesPositions(matchNodes: Node[], xPos, centerYPos): { x, y }[] {
    if (matchNodes.length === 0) return [{y: centerYPos, x: xPos}];
    let yStep = ChartConsts.matchDistance.y;
    let yRange = yStep * (matchNodes.length - 1);
    let topY = centerYPos - yRange / 2;
    let positions: { x, y }[] = matchNodes.map((i, index) => {
      if (i.x || i.y) return {x: i.x, y: i.y};
      if (this.chart.getNode(i.id)) return this.chart.getPosition(i.id);
      else return {
        y: topY + index * yStep,
        x: xPos
      };
    });
    return positions;
  }

  private positionsBelowExistingNodesOfSameX(positions: { x, y }[], matchesXPos: number, checkNodes: IdType[]): {x,y}[] {
    let correctedPositions: {x,y}[] = []
    const allMatchIdsOfSameX = this.chart.getItems(checkNodes).nodes.filter(i => (i.x >= matchesXPos - 100 && i.x <= matchesXPos + 100));
    if (allMatchIdsOfSameX.length > 0) {
      const largestYMatchPos = allMatchIdsOfSameX.map(i => i.y).sort((a, b) => {
        return b - a;
      })[0];
      const sortedPositions = positions.sort((a, b) => {
        return b.y - a.y;
      });
      correctedPositions = sortedPositions.map((i, index) => {
        return {
          x: i.x,
          y: largestYMatchPos + ChartConsts.matchDistance.y * (index + 1)
        };
      });
      return correctedPositions
    }

  }

  public positionVertical(addedItems: Array<Node | Edge>, moveBelowExisting): Array<Node | Edge> {
    let filesToMatches: { [fileId: string]: { matchNodes: Node[], fileNode: Node } } = {};
    let nodesAndLinksPositioned: Array<Node | Edge> = [];
    let addedFileIndex = 0;//existingFileNodesNumber;
    let selectedMatchFile = (this.app.selectedNode && ChartUtils.isMatchNode(this.app.selectedNode as Node)) ? ChartUtils.getOfFile((this.app.selectedNode as Node)) : null;

    // arrange nodes into {fileId: matches[]} object
    addedItems.forEach((item: Node | Edge) => {
      if (ChartUtils.isNode(item)) {
        item = item as Node;
        // file nodes
        if (ChartUtils.isFileNode(item)) {
          let allFileNodes = this.chart.getItems(this.chart.getAllItemIds().nodes).nodes.filter(i => ChartUtils.isFileNode(i));
          let largestYPos = allFileNodes.map(i => this.chart.getNeighboursBoudingBox(i.id)).map(i => i.bottom).sort((i, j) => {
            return j - i;
          })[0];
          addedFileIndex++;
          let fileNode = this.setFileNodePos_Directional(item as Node, addedFileIndex, largestYPos);
          nodesAndLinksPositioned.push(fileNode);
          if (!filesToMatches[fileNode.id]) {
            filesToMatches[fileNode.id] = {matchNodes: [], fileNode: fileNode};
          } else {
            filesToMatches[fileNode.id].fileNode = fileNode;
          }
          return;
        }
        // match node
        else if (ChartUtils.isMatchNode(item)) {
          let ofFile = ChartUtils.getOfFile(item);
          if (!filesToMatches[ofFile]) {
            filesToMatches[ofFile] = {matchNodes: [item], fileNode: this.chart.getNode(ofFile)};
          } else filesToMatches[ofFile].matchNodes.push(item);
          return;
        }
      }
      // edges or non match nodes
      nodesAndLinksPositioned.push(item);
    });

    // position match Nodes
    let matchesXPos = this.app.selectedNode ? this.chart.getPosition(this.app.selectedNode.id).x + ChartConsts.matchDistance.x : ChartConsts.matchDistance.x;
    for (let fileId in filesToMatches) {
      let positions: { x, y }[] = [];
      // set positions of selected file matches
      if ((selectedMatchFile && fileId === selectedMatchFile) && this.app.selectedNode) {
        positions = this.getMatcheNodesPositions(filesToMatches[fileId].matchNodes, matchesXPos, this.chart.getPosition(this.app.selectedNode.id).y);
      }
      // set positions of other files matches
      else {
        let filePosY = filesToMatches[fileId].fileNode.y ? filesToMatches[fileId].fileNode.y : this.chart.getPosition(fileId).y;
        positions = this.getMatcheNodesPositions(filesToMatches[fileId].matchNodes, matchesXPos, filePosY);
      }

      // if any nodes exist in added nodes positions - move down added nodes to below lowest existing node
      if (moveBelowExisting) {
        const allMatchIdsOfFile = this.chart.getNeighbours(fileId).nodes;
        positions = this.positionsBelowExistingNodesOfSameX(positions, matchesXPos, allMatchIdsOfFile);
      }
      filesToMatches[fileId].matchNodes = filesToMatches[fileId].matchNodes.map((i, index) => {
        i.x = positions[index].x;
        i.y = positions[index].y;
        return i;
      });
    }
    return addedItems;

  }

  public addToChartAndPosition(nodesAndLinks: Array<Node | Edge>, options: { moveBelowExisting } = {moveBelowExisting: true}): Array<Node | Edge> {
    let addedIds = nodesAndLinks.filter(i => {
      return (ChartUtils.isNode(i) && ChartUtils.isMatchNode(i as Node));
    }).map(i => i.id);

    // update ones where atts changed
    let newNodesAndLinks = nodesAndLinks.map((item) => {
      let itemOnChart = this.chart.getItem(item.id);
      if (itemOnChart !== null) {
        ChartUtils.setAttributes(item as Node, ChartUtils.getMatchAttributes(item as Node));
        return null;
      }
      return item;
    }).filter(i => i !== null);


    // position match nodes and file nodes
    if (Options.positioning === PositioningOptions.VERTICAL) newNodesAndLinks = this.positionVertical(newNodesAndLinks, options.moveBelowExisting);
    // else this.positionsBelowExistingNodesOfSameX(pos)

    console.log('added nodes and links', newNodesAndLinks);
    console.log(newNodesAndLinks.filter((i: Node) => ChartUtils.isMatchNode(i)).map((i: Node) => i.y));

    let currentMatches = this.chart.getAllMatchNodes();
    let isFirstAdded = false;
    if (this.chart.nodes.length === 0) isFirstAdded = true;
    this.chart.addNodesAndLinks(newNodesAndLinks, true);
    if (isFirstAdded) setTimeout(() => {
      this.chart.fitToNodes(newNodesAndLinks.map(i => i.id));
    }, 1000);

    setTimeout(() => {
      let addedMatches = newNodesAndLinks.filter((i: Node) => {
        return (ChartUtils.isNode(i) && ChartUtils.isMatchNode(i));
      });
      this.setInnerContentEdges((node: Node) => {
        return ChartUtils.getContentEndLine(node);
      }, ChartStyles.insideContentLink, ContentEdgeTypes.insideContent, addedMatches, currentMatches);
      this.setInnerContentEdges((node: Node) => {
        return ChartUtils.getEndLineNumber(node);
      }, ChartStyles.insideSelectionLink, ContentEdgeTypes.insideSelection, addedMatches, currentMatches);
      this.app.codeEditor.markMatchesInFile(this.getSeletedFileMatchesRows());
    }, 0);
    return nodesAndLinks;
  }

  private setInnerContentEdges(getOtherEndLine: (node: Node) => number, edgeStyle: any, edgeType: ContentEdgeTypes_type, addedMatches: Node[], existingMatches: Node[]) {
    let addedEdges: Edge[] = [];
    addedMatches.forEach(i => {
      existingMatches.forEach(j => {
        if (i.id === j.id) return;
        let otherEndLineNumber = getOtherEndLine(j);
        let otherLineNumber = ChartUtils.getLineNumber(j);
        let myLineNumber = ChartUtils.getLineNumber(i);
        let myEndLineNumber = getOtherEndLine(i);
        if (ChartUtils.getOfFile(i) !== ChartUtils.getOfFile(j)) return;
        let isInside = (myLine, otherLine, otherEndLine) => {
          return (otherEndLine && (myLine > otherLine && myLine < otherEndLine));
        };
        if (
          (myEndLineNumber && isInside(myEndLineNumber, otherLineNumber, otherEndLineNumber))
          ||
          isInside(myLineNumber, otherLineNumber, otherEndLineNumber)
        ) {
          addedEdges.push(this.chart.createLink(j.id, i.id, edgeStyle, {title: edgeType, idPrefix: edgeType}));
        } else if ((otherEndLineNumber && isInside(otherEndLineNumber, myLineNumber, myEndLineNumber))
          ||
          isInside(otherLineNumber, myLineNumber, myEndLineNumber)
        ) {
          addedEdges.push(this.chart.createLink(i.id, j.id, edgeStyle, {title: edgeType, idPrefix: edgeType}));
        }
      });
    });
    this.chart.addNodesAndLinks(addedEdges);
  }

  private setFileNodePos_Directional(node: Node, fileNodeIndex: number, largestYPos) {
    if (this.chart.getItem(node.id) && this.chart.getItem(node.id) !== null) return node;
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

  public createShape(selectedNodeIds: IdType[], shapeType: string): Node {
    shapeType = shapeType.toLowerCase();
    this.chart.addToHistory(false);
    let selectedNodes = this.chart.getItems(selectedNodeIds).nodes;
    let addedItems = [];
    let getMiddlePoint = (nodes: Node[], xOrY: string) => {
      return selectedNodes.map(i => this.chart.getPosition(i.id)[xOrY]).reduce((soFar, current) => {
        return (current + soFar);
      }, 0) / nodes.length;
    };
    // node selected
    if (selectedNodes !== null && selectedNodes.length>0) {
      let id = selectedNodes.map(i => i.id.toString()).reduce((total, current) => {
        return total + '_' + current;
      }, '');
      let newNode = this.chart.createNode(shapeType + id + new Date().getTime(), 'new remark', ChartStyles.nodesTypes[shapeType].node);

      // position in middle of selected nodes
      let xPos = getMiddlePoint(selectedNodes, 'x');
      let yPos = getMiddlePoint(selectedNodes, 'y');
      this.chart.setNodePosition(newNode, {x: xPos, y: yPos});
      //if only one node selected, add above that node
      if (selectedNodes.length === 1)
        newNode.y = newNode.y - (selectedNodes[0].size ? selectedNodes[0].size / 2 : 13/*default is 25*/) - 35;
      addedItems.push(newNode);

      // create links for all nodes
      selectedNodes.forEach(node => {
        let newLink = this.chart.createLink(node.id, newNode.id, ChartStyles.nodesTypes[shapeType].link);
        addedItems.push(newLink);
      });
      // create file link - only if single node is selected
      if (selectedNodes.length === 1) {
        let node = selectedNodes[0];
        if (ChartUtils.isOfFile(node) || ChartUtils.isFileNode(node)) {
          let fileNode;
          if (ChartUtils.isFileNode(node)) {
            fileNode = node.id;
          } else {
            fileNode = ChartUtils.getOfFile(node);
          }
          let fileLink = CreateUtils.createFileEdge(this.chart, fileNode, newNode.id);
          ChartUtils.setOfFile(newNode, fileNode, this.chart);
          addedItems.push(fileLink);
        }
      }
    } /*no node selected*/ else {
      let newNode = this.chart.createNode(shapeType + new Date().getTime(), 'new remark', ChartStyles.nodesTypes[shapeType].node);
      this.chart.setNodePosition(newNode, this.chart.getViewPos());
      addedItems.push(newNode);
    }
    this.addToChartAndPosition(addedItems);
    return addedItems;
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
    // select neighbour nodes of selected file nodes
    let fileNodes: IdType[] = selection.nodes.filter(item => this.chart.getNode(item)['d']['fileContent']);
    let fileNodesNeighbours: IdType[] = [];
    fileNodes.forEach(node => {
      fileNodesNeighbours = fileNodesNeighbours.concat(this.getNeighborNodesIds(node));
    });
    // select neighbour edges of selected match nodes
    let matchNodes: IdType[] = selection.nodes.filter(item => ChartUtils.isMatchNode(this.chart.getNode(item)));
    let newEdges: Edge[] = [];
    matchNodes.forEach((nodeId) => {
      let connectedToMatchEdgeIds = this.chart.getNeighbours(nodeId).edges;
      let connectedToMatchEdges = this.chart.getItems(connectedToMatchEdgeIds).edges.filter((i)=>{!ChartUtils.isFileEdge(i)}).filter(i => i.to === nodeId);
      let edgesFromMatchToIds = this.chart.getItems(connectedToMatchEdgeIds).edges.filter((i)=>{!ChartUtils.isFileEdge(i)}).filter(i => i.from === nodeId).map(i => i.to);
      connectedToMatchEdges.forEach((edge) => {
        edgesFromMatchToIds.forEach((toId) => {
          let newEdge = Utils.deepCopy(edge) as Edge;
          newEdge.to = toId;
          newEdge.id = newEdge.id.toString().replace(nodeId.toString(), toId.toString());
          newEdges.push(newEdge);
        });
      });
    });
    this.chart.deleteItems({nodes: fileNodesNeighbours, edges: []});
    this.chart.deleteItems(selection);
    this.chart.addNodesAndLinks(newEdges);
    this.app.codeEditor.markMatchesInFile(this.getSeletedFileMatchesRows());
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
    if (1 === 1) return node;
    // need to fix this later, look for commit of path node
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
    let nodeLine = ChartUtils.getLineNumber(node);
    let endLine = Utils.getEndLineOfBlock(this.app.currentFile.lines, nodeLine);
    let content = endLine ? this.app.currentFile.lines.slice(nodeLine, nodeLine + endLine).join('\r\n') : this.app.currentFile.lines[nodeLine];

    return {
      content: content,
      startIndex: nodeLine,
      endIndex: endLine
    };
  }

  public setNodeTitle(node: Node, title) {
    let lineNumber = ChartUtils.getLineNumber(node);
    let endLineNumber = ChartUtils.getEndLineNumber(node);
    if (lineNumber) {
      let linesMatch = title.match(/\(\d+(-\d+)?\):/gi);
      let titleNoLineNumbers = '';
      if (linesMatch) titleNoLineNumbers = title.substring(linesMatch[0].length, title.length);
      else titleNoLineNumbers = title;
      this.chart.setTitle(node, CreateUtils.getMatchNodeLabel(lineNumber, endLineNumber, titleNoLineNumbers));
    } else {
      this.chart.setTitle(node, title);
    }
  }

  public getFileNodeMatcheNodes(fileNode: Node): Node[] {
    return this.chart.getItems(this.chart.getNeighbours(fileNode.id).nodes).nodes.filter(i => ChartUtils.isMatchNode(i));
  }

  public getSeletedFileMatchesRows(): { startRowNumber, endRowNumber }[] {
    if (!this.app.currentFile) return [];
    return this.getFileNodeMatcheNodes(this.app.currentFile.node).map(i => {
      return {
        startRowNumber: ChartUtils.getLineNumber(i),
        endRowNumber: ChartUtils.getEndLineNumber(i)
      };
    });

  }

  //Global_app.chart.getAllItemIds().edges.filter(i=>i.startsWith("inside content"))
  //var otherEdges = Global_app.chart.getAllItemIds().edges.filter(i=>{return (i.startsWith("match") || i.startsWith("user"))})

  getMatchNodeOfLineNumber(lineNumber: number): Node {
    return this.chart.getAllMatchNodes().find(i => {
      let matchStartRow = ChartUtils.getLineNumber(i);
      let endMatchRow = ChartUtils.getEndLineNumber(i);
      if (endMatchRow) {
        return (lineNumber > matchStartRow && lineNumber < endMatchRow);
      } else {
        return lineNumber === matchStartRow;
      }
    });
  }
}
