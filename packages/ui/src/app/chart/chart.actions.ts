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

  getMatchNodesPositions(matchNodes: Node[], xPos, centerYPos): { x, y }[] {
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
    } else {
      return positions
    }

  }

  public positionHorizontal(addedItems: Array<Node | Edge>) {
    // file nodes
    let resultItems: Array<Node | Edge> = []
    let fileNodes = addedItems.filter(i=>ChartUtils.isFileNode(i))
    this.app.addFilesToLegend(fileNodes)

    ///// match nodes //////
    // set positions of match nodes
    let matchesXPos = this.app.selectedNode ? this.chart.getPosition(this.app.selectedNode.id).x + ChartConsts.matchDistance.x : ChartConsts.matchDistance.x;
    let matchNodes: Node[] = addedItems.filter((i)=>ChartUtils.isMatchNode(i))
    let positions: { x, y }[] = [];
    let yPos = this.app.selectedNode ? this.chart.getPosition(this.app.selectedNode.id).y : 0
    positions = this.getMatchNodesPositions(matchNodes, matchesXPos, yPos);
    matchNodes = matchNodes.map((i, index) => {
      i.x = positions[index].x;
      i.y = positions[index].y;
      return i;
    });
    let hiddenFileNodes: {[nodeId:string]:Node} = {}
    matchNodes.forEach((matchNode: Node)=>{
      let ofFileNodeId = ChartUtils.getOfFileId(matchNode)
      let ofFileNode = fileNodes.find(i=>i.id===ofFileNodeId)
      if(!ofFileNode) ofFileNode = ChartUtils.getOfFileNode(matchNode, this.chart)
      let ofFileItems = CreateUtils.createFileNameNode(ofFileNode.label, matchNode, ofFileNode.color as any, this.chart)
      resultItems = resultItems.concat(ofFileItems)
      hiddenFileNodes[ofFileNodeId] = ofFileNode
    })

    positions = this.positionsBelowExistingNodesOfSameX(positions, matchesXPos, this.chart.getAllMatchNodes().map(i=>i.id));
    matchNodes = matchNodes.map((i, index) => {
      i.x = positions[index].x;
      i.y = positions[index].y;
      return i;
    });


    // hide file nodes with matches
    for(let key in hiddenFileNodes) {
      hiddenFileNodes[key].hidden = true
    }
    // edges
    let edges = addedItems.filter(i=>!ChartUtils.isNode(i))

    return resultItems.concat(matchNodes, fileNodes, edges)

  }


  public positionVertical(addedItems: Array<Node | Edge>, moveBelowExisting): Array<Node | Edge> {
    let filesToMatches: { [fileId: string]: { matchNodes: Node[], fileNode: Node } } = {};
    let nodesAndLinksPositioned: Array<Node | Edge> = [];
    let addedFileIndex = 0;//existingFileNodesNumber;
    let selectedMatchFile = (this.app.selectedNode && ChartUtils.isMatchNode(this.app.selectedNode as Node)) ? ChartUtils.getOfFileId((this.app.selectedNode as Node)) : null;

    // arrange nodes into {fileId: matches[]} object
    addedItems.forEach((item: Node | Edge) => {
      if (ChartUtils.isNode(item)) {
        item = item as Node;
        // file nodes
        if (ChartUtils.isFileNode(item)) {
          this.app.addFilesToLegend([item as Node])

          let allFileNodes = this.chart.getItems(this.chart.getAllItemIds().nodes).nodes.filter(i => ChartUtils.isFileNode(i));
          let largestYPos = allFileNodes.map(i => this.chart.getFileNodeNeighboursBoudingBox(i.id)).map(i => i.bottom).sort((i, j) => {
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
          let ofFile = ChartUtils.getOfFileId(item);
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
        positions = this.getMatchNodesPositions(filesToMatches[fileId].matchNodes, matchesXPos, this.chart.getPosition(this.app.selectedNode.id).y);
      }
      // set positions of other files matches
      else {
        let filePosY = filesToMatches[fileId].fileNode.y ? filesToMatches[fileId].fileNode.y : this.chart.getPosition(fileId).y;
        positions = this.getMatchNodesPositions(filesToMatches[fileId].matchNodes, matchesXPos, filePosY);
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
    if (Options.positioning === PositioningOptions.VERTICAL) {
      newNodesAndLinks = this.positionVertical(newNodesAndLinks, options.moveBelowExisting);
    }
    else {
      // position non grouped matches horizontally. grouped matches will be positioned vertically.
      // grouped matches belong to existing file nodes and need to be positioned aligned to them
      let matchNodes = newNodesAndLinks.filter(i=>ChartUtils.isMatchNode(i))
      let groupedMatchAndFiles = matchNodes.filter((i)=>{
        return (
          // a grouped file
          ChartUtils.getFileNodeIsGrouped(i)
          ||
            // a grouped match
          (ChartUtils.isMatchNode(i) && ChartUtils.getOfFileNode(i, this.chart) && ChartUtils.getFileNodeIsGrouped(ChartUtils.getOfFileNode(i, this.chart)))
        )
      })
      let otherItems = newNodesAndLinks.filter((i)=>!groupedMatchAndFiles.find(j=>i.id===i.id))

      let positionedNonGrouped = this.positionHorizontal(otherItems)
      let positionedGrouped = this.positionVertical(groupedMatchAndFiles, true)
      newNodesAndLinks = positionedNonGrouped.concat(positionedGrouped)
    }

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
        if (ChartUtils.getOfFileId(i) !== ChartUtils.getOfFileId(j)) return;
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
    this.app.clearFilesInLegend()
  }

  public createShape(selectedNodeIds: IdType[], shapeType: string): Node {
    shapeType = shapeType.toLowerCase();
    let shape = ChartStyles.nodesTypes.find(i=>i.name === shapeType).details
    this.chart.addToHistory(false);
    let selectedNodes = this.chart.getItems(selectedNodeIds).nodes;
    let addedItems = [];

    // node selected
    if (selectedNodes !== null && selectedNodes.length>0) {
      let id = selectedNodes.map(i => i.id.toString()).reduce((total, current) => {
        return total + '_' + current;
      }, '');
      let newNode = this.chart.createNode(shapeType + id + new Date().getTime(), 'new remark', shape.node);

      // position in middle of selected nodes
      let xPos = ChartUtils.getMiddlePoint(selectedNodes, 'x', this.chart);
      let yPos = ChartUtils.getMiddlePoint(selectedNodes, 'y', this.chart);
      this.chart.setNodePosition(newNode, {x: xPos, y: yPos});
      //if only one node selected, add above that node
      if (selectedNodes.length === 1)
        newNode.y = newNode.y - (selectedNodes[0].size ? selectedNodes[0].size / 2 : 13/*default is 25*/) - 35;
      addedItems.push(newNode);

      // create links for all nodes
      selectedNodes.forEach(node => {
        let newLink = this.chart.createLink(node.id, newNode.id, shape.link);
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
            fileNode = ChartUtils.getOfFileId(node);
          }
          let fileLink = CreateUtils.createFileEdge(this.chart, fileNode, newNode.id);
          ChartUtils.setOfFile(newNode, fileNode, this.chart);
          addedItems.push(fileLink);
        }
      }
    } /*no node selected*/ else {
      let newNode = this.chart.createNode(shapeType + new Date().getTime(), 'new remark', shape.node);
      this.chart.setNodePosition(newNode, this.chart.getViewPos());
      addedItems.push(newNode);
    }
    this.chart.addNodesAndLinks(addedItems);
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
    // get matches of file nodes
    let fileNodes: IdType[] = selection.nodes.filter(item => this.chart.getNode(item)['d']['fileContent']);
    this.app.removeFilesFromLegend(this.chart.getItems(fileNodes).nodes)
    let fileMatchIds: IdType[] = [];
    fileNodes.forEach(node => {
      let matchNodeIds = this.getFileNodeMatcheNodes(node).map(i=>i.id)
      // get filename nodes
      let matchFilenameNodes = matchNodeIds.map((i)=>{
        return ChartUtils.getFilenameNodeId(this.chart.getItem(i), this.chart)
      }).filter(i=>i)
      fileMatchIds = fileMatchIds.concat(matchFilenameNodes);
    });

    // get edges going out and into selected nodes, and also filename nodes
    let matchNodes: IdType[] = selection.nodes.filter(item => ChartUtils.isMatchNode(this.chart.getNode(item)));
    let newEdges: Edge[] = [];
    let filenameNodes: IdType[] = []
    matchNodes.forEach((nodeId) => {
      let fileNode = this.chart.getNeighbours(nodeId).nodes.filter(i=>i.toString().startsWith("filename"))
      filenameNodes = filenameNodes.concat(fileNode)

      let connectedEdgeIds = this.chart.getNeighbours(nodeId).edges;
      let conncetedEdges = [...this.chart.getItems(connectedEdgeIds).edges]
      let connectedToMatchEdges = conncetedEdges.filter((i)=>{return ChartUtils.isMatchEdge(i)}).filter(i => i.to === nodeId);
      let edgesFromMatchToIds = conncetedEdges.filter((i)=>{return ChartUtils.isMatchEdge(i)}).filter(i => i.from === nodeId).map(i => i.to);
      connectedToMatchEdges.forEach((edge) => {
        edgesFromMatchToIds.forEach((toId) => {
          let newEdge = Utils.deepCopy(edge) as Edge;
          newEdge.to = toId;
          newEdge.id = newEdge.id.toString().replace(nodeId.toString(), toId.toString());
          newEdges.push(newEdge);
        });
      });
    });
    this.chart.deleteItems({nodes: filenameNodes, edges: []});
    this.chart.deleteItems({nodes: fileMatchIds, edges: []});
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
      this.chart.setLabel(node, CreateUtils.getMatchNodeLabel(lineNumber, endLineNumber, titleNoLineNumbers));
    } else {
      this.chart.setLabel(node, title);
    }
  }

  public getFileNodeMatcheNodes(fileNode: Node, includeFilenameNodes = true): Node[] {
    let matchNodes = this.chart.getItems(this.chart.getNeighbours(fileNode.id).nodes).nodes.filter(i => ChartUtils.isMatchNode(i));
    if(!includeFilenameNodes) return matchNodes
    let filenameNodes: Node[] = []
    matchNodes.forEach((i)=>{
      let filenameNodeId = ChartUtils.getFilenameNodeId(i, this.chart)
      if(!filenameNodeId) return
      filenameNodes.push(this.chart.getNode(filenameNodeId))
    })
    return filenameNodes.concat(matchNodes)
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

  groupUngroupFile(node: Node) {
    if(!node) {
      console.log("no selected node")
      return
    }
    let fileNode = ChartUtils.getOfFileNode(node, this.chart)
    if(!fileNode) {
      if(ChartUtils.isFileNode(node)) fileNode = Utils.deepCopy(node)
      else {
        console.log("no of file node")
        return
      }
    }
    if(ChartUtils.getFileNodeIsGrouped(node)) {
      ChartUtils.setFileNodIsGrouped(node, false)
      ChartUtils.setFileNodIsGrouped(fileNode, false)
      this.getFileNodeMatcheNodes(fileNode).forEach((i)=>{
        if(!ChartUtils.getFilenameNodeId(i, this.chart) && ChartUtils.isMatchNode(i)) {
          let filenameItems = CreateUtils.createFileNameNode(fileNode.label, i, fileNode.color, this.chart)
          this.chart.addNodesAndLinks(filenameItems)
        }
      })
      fileNode.hidden = true
    } else {
      ChartUtils.setFileNodIsGrouped(node, true)
      ChartUtils.setFileNodIsGrouped(fileNode, true)
      let fileMatches = this.getFileNodeMatcheNodes(fileNode, false)
      fileNode.hidden = false
      fileNode.y = ChartUtils.getMiddlePoint(fileMatches, 'y', this.chart)
      fileNode.x = fileMatches.sort((a, b)=>{return a.x - b.x})[0].x - 500
    }
    this.chart.nodes.update(fileNode)
  }

  selectMatchesOfLine(row: number, fileNode: Node) {
    let matches = this.getFileNodeMatcheNodes(fileNode)
    matches = matches.filter((match:Node)=>{
      if(ChartUtils.getEndLineNumber(match)) {
        return ChartUtils.getLineNumber(match)>=row && ChartUtils.getEndLineNumber(match)<=row
      } else {
        return ChartUtils.getLineNumber(match)==row
      }
    })
    if(matches.length) this.chart.setSelectionNodes(matches.map(i=>i.id))
  }
}
