import { AppComponent, Options } from '../app.component';
import {
  ChartConsts,
  CcItemStyles,
  ContentEdgeTypes,
  ContentEdgeTypes_type,
  MatchDistance,
  NodeTypes, EdgeTypes,
} from './chart.consts'
import { Edge, EdgeOptions, IdType, Node } from 'vis';
import { ChartWrapper, VisiEdges } from './chart.wrapper'
import { ChartUtils } from './chart.utils';
import {
  FileId,
  FileNode,
  GroupNode,
  MatchInfo,
  MatchNode,
  ReloadFilesResponse,
  VisiEdge,
  VisiNode,
} from '../types.nodejs'
import { CreateUtils } from './create.utils';
import { Utils } from './Utils';
import * as Util from 'util'
import { TextComparison } from './text.comparison';
import { SynchActions } from './synch.actions';

export interface ReloadOptions { addFailedReloadToDiagram?: boolean, markNullFiles?: boolean }
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

export enum PositioningOptions { DOWN, RIGHT, LEFT, UP }

export class ChartActions {
  codeEditor: any;
  private chart: ChartWrapper;
  public synchActions: SynchActions;

  constructor(private app: AppComponent) {
  }

  initialize() {
    this.chart = this.app.chart;
    this.codeEditor = this.app.codeEditor;
    this.synchActions = new SynchActions(this.app);
    this.synchActions.initialize();
  }

  getMatchNodesPositions(matchNodes: Node[], alignToPos: { x, y }): { x, y }[] {
    if (matchNodes.length === 0) return [alignToPos];
    let varyingStepSize = MatchDistance.betweenMatches();
    let fixedStepSize = MatchDistance.toPreviousMatch();
    // if(this.app.Options.positioning === PositioningOptions.DOWN || this.app.Options.positioning === PositioningOptions.UP) {
    //   fixedStepSize = fixedStepSize / 3
    // }

    let range = varyingStepSize * (matchNodes.length - 1);
    let firstInRangePos;
    if (this.app.Options.positioning === PositioningOptions.LEFT || this.app.Options.positioning === PositioningOptions.RIGHT) {
      firstInRangePos = alignToPos.y - range / 2;
    } else {
      firstInRangePos = alignToPos.x - range / 2;
    }

    let positions: { x, y }[] = matchNodes.map((i, index) => {
      if (i.x || i.y) return { x: i.x, y: i.y };
      if (this.chart.getNode(i.id)) return this.chart.getPosition(i.id);

      if (this.app.Options.positioning === PositioningOptions.RIGHT) {
        return {
          y: firstInRangePos + index * varyingStepSize,
          x: alignToPos.x + fixedStepSize
        };
      } else if (this.app.Options.positioning === PositioningOptions.LEFT) {
        return {
          y: firstInRangePos + index * varyingStepSize,
          x: alignToPos.x - fixedStepSize
        };
      } else if (this.app.Options.positioning === PositioningOptions.DOWN) {
        return {
          x: firstInRangePos + index * varyingStepSize,
          y: alignToPos.y + fixedStepSize
        };
      } else if (this.app.Options.positioning === PositioningOptions.UP) {
        return {
          x: firstInRangePos + index * varyingStepSize,
          y: alignToPos.y - fixedStepSize
        };
      }
    });
    return positions;
  }

  private positionNextToOverlappingNodes(positions: { x, y }[], matchPos: { x, y }, checkNodes: IdType[]): { x, y }[] {
    let correctedPositions: { x, y }[] = [];
    let varyingPosKey = (this.app.Options.positioning === PositioningOptions.RIGHT || this.app.Options.positioning === PositioningOptions.LEFT) ? 'y' : 'x';
    let fixedPosKey = varyingPosKey === 'x' ? 'y' : 'x';

    let fixedPosToCheck =
      (this.app.Options.positioning === PositioningOptions.RIGHT || this.app.Options.positioning === PositioningOptions.DOWN) ?
        matchPos[fixedPosKey] + MatchDistance.toPreviousMatch() :
        matchPos[fixedPosKey] - MatchDistance.toPreviousMatch();

    const allMatchIdsOfSamePos = this.chart.getItems(checkNodes).nodes.filter(i =>
      (i[fixedPosKey] >= fixedPosToCheck - ChartConsts.gridBaseSize && i[fixedPosKey] <= fixedPosToCheck + ChartConsts.gridBaseSize)
    );
    if (allMatchIdsOfSamePos.length > 0) {
      const largestVaryingMatchPos = allMatchIdsOfSamePos.map(i => i[varyingPosKey]).sort((a, b) => {
        return b - a;
      })[0];
      const sortedPositions = positions.sort((a, b) => {
        return b[varyingPosKey] - a[varyingPosKey];
      });
      correctedPositions = sortedPositions.map((i, index) => {
        let newPos: { x, y } = { x: 0, y: 0 };
        newPos[varyingPosKey] = largestVaryingMatchPos + MatchDistance.betweenMatches() * (index + 1);
        newPos[fixedPosKey] = i[fixedPosKey];
        return newPos;
      });
      return correctedPositions;
    } else {
      return positions;
    }

  }

  public positionNormal(addedItems: Array<Node | Edge>) {
    // file nodes
    let resultItems: Array<Node | Edge> = [];
    let fileNodes = addedItems.filter(i => ChartUtils.isFileNode(i));

    ///// match nodes //////
    // set positions of match nodes
    let alignToPos = this.app.selectedNode ? this.chart.getPosition(this.app.selectedNode.id) : { x: 0, y: 0 };
    let matchNodes: Node[] = addedItems.filter((i) => ChartUtils.isMatchNode(i as Node)) as Node[];
    let positions: { x, y }[] = [];
    positions = this.getMatchNodesPositions(matchNodes, alignToPos);
    matchNodes = matchNodes.map((i, index) => {
      i.x = positions[index].x;
      i.y = positions[index].y;
      return i;
    });
    let hiddenFileNodes: { [nodeId: string]: Node } = {};

    let possibleOverlapNodes: IdType[];
    if (this.app.selectedNode) {
      possibleOverlapNodes = this.chart.getNeighboursByEdge(this.app.selectedNode.id, (edge: Edge) => true).nodes;
      possibleOverlapNodes = this.chart.getItems(possibleOverlapNodes).nodes.filter(i => ChartUtils.isMatchNode(i)).map(i => i.id);
    } else
      possibleOverlapNodes = this.chart.getAllMatchNodes().filter(i => (!i.x || i.x === 0)).map(i => i.id);

    positions = this.positionNextToOverlappingNodes(positions, alignToPos, possibleOverlapNodes);
    matchNodes = matchNodes.map((i, index) => {
      i.x = positions[index].x;
      i.y = positions[index].y;
      return i;
    });

    matchNodes.forEach((matchNode: MatchNode) => {
      let ofFileNodeFileId = ChartUtils.getOfFileId(matchNode)
      let ofFileNodeId = CreateUtils.createFileNodeId(ChartUtils.getOfFileId(matchNode));
      let ofFileNode = fileNodes.find((i: FileNode) => ChartUtils.isSameFileId(i.d.fileId, ofFileNodeFileId));
      if (!ofFileNode) ofFileNode = this.getFileNodeByPath(ofFileNodeFileId);
      if (!ChartUtils.isCustomNode(ofFileNode)) {
        let ofFileItems = CreateUtils.createFileNameNode(ofFileNode.label, matchNode, ofFileNode.color as any, this.chart);
        resultItems = resultItems.concat(ofFileItems);
      }
      hiddenFileNodes[ofFileNodeId] = ofFileNode as Node;
    });


    // hide file nodes with matches
    for (let key of Object.keys(hiddenFileNodes)) {
      hiddenFileNodes[key].hidden = true;
    }
    // edges
    let edges = addedItems.filter(i => !ChartUtils.isNode(i));

    /// horrible fix - we need to move positioning of files to here as well. I add here a case where only a file is added using "open file", and position in in middle of screen
    // in default behaviour  it is hidden and is positioned when toggle hide/unhide file,
    if (fileNodes.length === 1 && matchNodes.length === 0) {
      let position = this.chart.getViewPos();
      (fileNodes[0] as Node).x = position.x;
      (fileNodes[0] as Node).y = position.y;
    }

    return resultItems.concat(matchNodes, fileNodes, edges);

  }

  public addToChartAndPosition(nodesAndLinks: Array<Node | Edge>, options: { moveBelowExisting } = { moveBelowExisting: true }): Array<Node | Edge> {
    try {
      let addedIds = nodesAndLinks.filter(i => {
        return (ChartUtils.isNode(i) && ChartUtils.isMatchNode(i as Node));
      }).map(i => i.id);

      let updatedNodes: Node[] = [];
      // update ones where atts changed
      let newNodesAndLinks = nodesAndLinks.map((item) => {
        let itemOnChart = this.chart.getItem(item.id);
        if (itemOnChart !== null) {
          if (!ChartUtils.isFileNode(item)) item.hidden = false
          ChartUtils.setAttributes(item as Node, ChartUtils.getMatchAttributes(item as Node));
          updatedNodes.push(item as Node);
          return null;
        }
        return item;
      }).filter(i => i !== null);

      // if invisible files exist, show them
      updatedNodes.forEach((i) => {
        if (ChartUtils.isFileNode(i) && this.chart.getNeighbours(i.id).nodes.length === 0) i.hidden = false
      })
      this.chart.nodes.update(updatedNodes);
      // position match nodes and file nodes
      // position non grouped matches horizontally. grouped matches will be positioned vertically.
      // grouped matches belong to existing file nodes and need to be positioned aligned to them
      newNodesAndLinks.filter(i => ChartUtils.isMatchNode(i as Node));
      newNodesAndLinks = this.positionNormal(newNodesAndLinks);

      console.log('added nodes and links', newNodesAndLinks);
      console.log(newNodesAndLinks.filter((i: Node) => ChartUtils.isMatchNode(i)).map((i: Node) => i.y));

      let currentMatches = this.chart.getAllMatchNodes();
      let isFirstAdded = false;
      if (this.chart.nodes.length === 0) isFirstAdded = true;
      this.chart.addNodesAndLinks(newNodesAndLinks, true);

      let fileNodes = newNodesAndLinks.filter(i => ChartUtils.isFileNode(i));
      this.app.addFilesToLegend(fileNodes as Node[]);

      if (isFirstAdded) setTimeout(() => {
        try {
          this.chart.fitToNodes();
        } catch (e) {
          console.error('failed to fit to nodes')
        }
      }, 0);

      setTimeout(() => {
        let addedMatches = newNodesAndLinks.filter((i: Node) => {
          return (ChartUtils.isNode(i) && ChartUtils.isMatchNode(i));
        });
        this.setInnerContentEdges((node: Node) => {
          return ChartUtils.getContentEndLine(node);
        }, CcItemStyles.insideContentLink, ContentEdgeTypes.insideContent, addedMatches as Node[], currentMatches);
        // this.setInnerContentEdges((node: Node) => {
        //   return ChartUtils.getEndLineNumber(node);
        // }, ChartStyles.insideSelectionLink, ContentEdgeTypes.insideSelection, addedMatches as Node[], currentMatches);
        this.codeEditor.markMatchesInFile(this.getSeletedFileMatchesRows());
      }, 0);
      return nodesAndLinks;
    } catch (ex) {
      console.error(ex)
    }
  }

  private setInnerContentEdges(getOtherEndLine: (node: Node) => number, edgeStyle: any, edgeType: ContentEdgeTypes_type, addedMatches: Node[], existingMatches: Node[]) {
    let addedEdges: Edge[] = [];
    addedMatches.forEach(addedMatch => {
      let contentLinks: { otherEndLineNumber: number, otherLineNumber: number, edge: Edge }[] = []
      existingMatches.forEach(j => {
        if (addedMatch.id === j.id) return;
        let otherEndLineNumber = getOtherEndLine(j);
        let otherLineNumber = ChartUtils.getLineNumber(j);
        let myLineNumber = ChartUtils.getLineNumber(addedMatch);
        let myEndLineNumber = getOtherEndLine(addedMatch);
        if (ChartUtils.getOfFileId(addedMatch) !== ChartUtils.getOfFileId(j)) return;
        let isInside = (myLine, otherLine, otherEndLine) => {
          return (otherEndLine && (myLine > otherLine && myLine < otherEndLine));
        };
        if (
          (myEndLineNumber && isInside(myEndLineNumber, otherLineNumber, otherEndLineNumber))
          ||
          isInside(myLineNumber, otherLineNumber, otherEndLineNumber)
        ) {
          contentLinks.push({ otherEndLineNumber: otherEndLineNumber, otherLineNumber: otherLineNumber, edge: this.chart.createLink(j.id, addedMatch.id, edgeStyle, { idPrefix: edgeType }) })
        } else if ((otherEndLineNumber && isInside(otherEndLineNumber, myLineNumber, myEndLineNumber))
          ||
          isInside(otherLineNumber, myLineNumber, myEndLineNumber)
        ) {
          contentLinks.push({ otherEndLineNumber: otherEndLineNumber, otherLineNumber: otherLineNumber, edge: this.chart.createLink(addedMatch.id, j.id, edgeStyle, { idPrefix: edgeType }) })
        }
      });
      if (contentLinks.length > 0) {
        if (contentLinks.length > 1) contentLinks.sort((i, j) => (i.otherEndLineNumber - i.otherLineNumber) - (j.otherEndLineNumber - j.otherLineNumber))
        addedEdges.push(contentLinks[0].edge)
      }
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
    this.chart.setData([], []);
    this.app.clearLegend();
  }

  public createShape(selectedNodeIds: IdType[], shapeType: string): Array<Node | Edge> {
    shapeType = shapeType.toLowerCase();
    let shapeInfo = CcItemStyles.nodesTypes.find(i => i.name === shapeType)
    let shape = Utils.deepCopy(shapeInfo.details);
    this.chart.addToHistory(false);
    let selectedNodes = this.chart.getItems(selectedNodeIds).nodes;
    let addedItems = [];
    let newNode = this.chart.createNode(null, 'new remark', shape.node);
    newNode = ChartUtils.setDragWithParent(newNode)


    // node selected
    if (selectedNodes !== null && selectedNodes.length > 0) {
      let id = selectedNodes.map(i => i.id.toString()).reduce((total, current) => {
        return total + '_' + current;
      }, '');
      newNode.id = CreateUtils.createShapeId(shapeType, id)
      this.positionAndLinkToSelected(newNode, addedItems, CcItemStyles.shapeLink);
    } /*no node selected*/ else {
      let id = shapeType + new Date().getTime()
      newNode.id = CreateUtils.createShapeId(shapeType, id)
      this.chart.setNodePosition(newNode, this.chart.getViewPos());
      addedItems.push(newNode);
    }
    this.chart.addNodesAndLinks(addedItems);
    this.chart.setSelection({ nodes: [newNode.id], edges: [] })
    return addedItems;
  }

  public positionAndLinkToSelected(newNode: Node, addedItems: (Node | Edge)[], linkInfo: EdgeOptions) {
    let selectedNodes = this.chart.getSelection().nodes.map(i => this.chart.getNode(i)) as Node[]
    let xPos = 0; let yPos = 0
    // position in middle of selected nodes
    if (selectedNodes.length === 0) {
      xPos = this.chart.getViewPos().x
      yPos = this.chart.getViewPos().y
    } else {
      if (selectedNodes.length === 1) {
        yPos = newNode.y ? newNode.y - (MatchDistance.betweenMatches() / 2) :
          this.chart.getViewPos().y;
        xPos = this.chart.getPosition(selectedNodes[0].id).x + (MatchDistance.betweenMatches() / 2)
      } else {
        xPos = ChartUtils.getMiddlePoint(selectedNodes, 'x', this.chart);
        yPos = ChartUtils.getMiddlePoint(selectedNodes, 'y', this.chart);
      }
    }
    this.chart.setNodePosition(newNode, { x: xPos, y: yPos });
    // if only one node selected, add above that node
    addedItems.push(newNode);

    // create links for all nodes
    selectedNodes.forEach(node => {
      let newLink = this.chart.createLink(node.id, newNode.id, linkInfo);
      addedItems.push(newLink);
    });
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

  public setSelectionStyle(newStyle) {
    let selection = this.chart.getSelection()
    this.setNodesStyle(this.chart.getItems(selection.nodes).nodes, newStyle)
    this.setEdgesStyle(this.chart.getItems(selection.edges).edges, newStyle)
  }

  public loadNodePrevStyle(node) {
    if (!node.d.prevStyle) return;
    Object.keys(node.d.prevStyle).forEach(styleField => {
      node[styleField] = node.d.prevStyle[styleField];
      delete node.d.prevStyle[styleField];
    });
  }

  public getNeighborNodesIds(nodeId: IdType): IdType[] {
    return this.chart.getNeighbours(nodeId).nodes;
  }

  public getSurroundingEdgesIds(nodeId: IdType): IdType[] {
    return this.chart.getNeighbours(nodeId).edges;
  }

  public getOutlierNeighbours(nodes: Node[]): IdType[] {
    let returned: IdType[] = []
    nodes.forEach((node) => {
      let neighborIds = this.chart.getNeighboursByEdge(node.id, (edge: Edge) => !ChartUtils.isFileEdge(edge)).nodes
      neighborIds.forEach((neighbourId) => {
        let edgesOfNeighbourIds = this.chart.getNeighboursByEdge(neighbourId, (edge: Edge) => !ChartUtils.isFileEdge(edge)).edges
        if (edgesOfNeighbourIds.length === 1) returned.push(neighbourId)
      })
    })
    return returned
  }

  public deleteSelected() {
    let selection = this.extendSelection(this.chart.getSelection());

    // get edges going out and into selected nodes, and also filename nodes
    let matchNodes: IdType[] = selection.nodes.filter(item => ChartUtils.isMatchNode(this.chart.getNode(item)));
    let newEdges: Edge[] = [];
    matchNodes.forEach((nodeId) => {
      let connectedEdgeIds = this.chart.getNeighbours(nodeId).edges;
      let conncetedEdges = [...this.chart.getItems(connectedEdgeIds).edges];
      let connectedToMatchEdges = conncetedEdges.filter((i) => {
        return ChartUtils.isMatchEdge(i);
      }).filter(i => i.to === nodeId);
      let edgesFromMatchToIds = conncetedEdges.filter((i) => {
        return ChartUtils.isMatchEdge(i);
      }).filter(i => i.from === nodeId).map(i => i.to);
      connectedToMatchEdges.forEach((edge) => {
        edgesFromMatchToIds.forEach((toId) => {
          let newEdge = Utils.deepCopy(edge) as Edge;
          newEdge.to = toId;
          newEdge.id = newEdge.id.toString().replace(nodeId.toString(), toId.toString());
          newEdges.push(newEdge);
        });
      });
    });
    let deletedFiles = this.chart.getItems(selection.nodes).nodes.filter(i => ChartUtils.isFileNode(i))
    this.app.removeFilesFromLegend(deletedFiles as FileNode[])
    this.chart.deleteItems(selection);

    let orphanedFiles = this.chart.getAllFileNodes().filter(i => !ChartUtils.isCustomNode(i)).filter((i: FileNode) => this.getFileNodeMatchNodes(i).length === 0 && i.hidden)
    this.app.removeFilesFromLegend(orphanedFiles as FileNode[])
    this.chart.deleteItems({ nodes: orphanedFiles.map(i => i.id), edges: [] });

    this.chart.addNodesAndLinks(newEdges);
    this.codeEditor.markMatchesInFile(this.getSeletedFileMatchesRows());
  }

  public getGroupBoundaryNodes(groupNodeId: IdType): VisiNode[] {
    let groupNode = this.chart.getNode(groupNodeId) as FileNode
    return this.chart.getAllNodes((i: VisiNode) => (
      i.d && !i.hidden && (
        (i.id === groupNode.id) ||
        (i.d.type === NodeTypes.boundaryNode && i.d.belongsToGroup === groupNode.id) ||
        (ChartUtils.isMatchNode(i) && (ChartUtils.isSameFileId((i as MatchNode).d.ofFile, groupNode.d.fileId))))
    )) as VisiNode[]
  }

  public extendSelection(selection: { nodes: IdType[], edges: IdType[] }): { nodes: IdType[], edges: IdType[] } {
    console.log('selection before extension', selection.nodes.length, selection.nodes)
    let returnedSelection: { nodes: IdType[], edges: IdType[] } = Utils.deepCopy(selection)
    // match nodes of file
    let fileNodes: IdType[] = selection.nodes.filter((id: IdType) => {
      const node = this.chart.getNode(id);
      return !node.hidden && ChartUtils.isFileNode(node);
    });
    fileNodes.forEach((id) => {
      const fileNode: VisiNode = this.chart.getNode(id) as VisiNode
      let matchNodes = !ChartUtils.isGroupNode(fileNode) ?
        // file matches
        this.getFileNodeMatchNodes(this.chart.getNode(id) as FileNode) :
        // group boundary node or attached nodes
        this.getAttachedToGroup(id)

      if (!matchNodes.length) return
      let matchNodeIds: IdType[] = matchNodes.map(i => i.id as IdType);
      returnedSelection.nodes = returnedSelection.nodes.concat(matchNodeIds)
    });

    // // get end neighbors nodes of matches
    let matchNodes: IdType[] = returnedSelection.nodes.filter(item => ChartUtils.isMatchNode(this.chart.getNode(item)));
    matchNodes.forEach((nodeId) => {
      let connected = this.getOutlierNeighbours(this.chart.getItems([nodeId]).nodes)
      connected = this.chart.getItems(connected).nodes.filter((node) => ChartUtils.isDragWithParent(node as VisiNode) || ChartUtils.isFilenameNode(node)).map(i => i.id)
      returnedSelection.nodes = returnedSelection.nodes.concat(connected)
    });


    console.log('selection after extension', returnedSelection.nodes.length, returnedSelection.nodes)
    return returnedSelection
  }

  public getSelectedLinksOrNodesOnly() {
    let chartSelection = this.chart.getSelection();
    if (chartSelection.nodes.length > 0) {
      return { edges: [], nodes: chartSelection.nodes };
    } else {
      return { edges: chartSelection.edges, nodes: [] };
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
    let endLine = ChartUtils.getContentEndLine(node);
    let content = endLine ? this.app.currentFile.lines.slice(nodeLine, nodeLine + endLine).join('\r\n') : this.app.currentFile.lines[nodeLine];

    return {
      content: content,
      startIndex: nodeLine,
      endIndex: endLine
    };
  }

  public setItemTitle(node: Node, title) {
    this.chart.setLabel(node, title);
    if (ChartUtils.isFileNode(node)) this.app.updateLabelInFileLegend(node as FileNode, title)
  }

  public getFileNodeByPath(path: FileId): FileNode {
    let fileNode = this.chart.getAllFileNodes().filter((i: FileNode) => {
      return ChartUtils.isSameFileId(i.d.fileId, path)
    })
    if (fileNode.length === 0) return null
    else return (fileNode[0] as FileNode)
  }

  public getFileNodeMatchNodes(fileNode: FileNode, includeFilenameNodes = true): Node[] {
    let matchNodes = this.chart.getAllNodes((i: MatchNode) => {
      if (ChartUtils.isMatchNode(i) && ChartUtils.isMatchOfFile(i, fileNode)) return true
      else return false
    })
    if (!includeFilenameNodes) return matchNodes;
    let filenameNodes: Node[] = [];
    matchNodes.forEach((i) => {
      let filenameNodeId = ChartUtils.getFilenameNode(i);
      if (!filenameNodeId) return;
      filenameNodes.push(this.chart.getNode(filenameNodeId));
    });
    return filenameNodes.concat(matchNodes).filter(i => i);
  }



  public getSeletedFileMatchesRows(): { startRowNumber, endRowNumber }[] {
    if (!this.app.currentFile) return [];
    return this.getFileNodeMatchNodes(this.app.currentFile.node as FileNode, false).map(i => {
      return {
        startRowNumber: ChartUtils.getLineNumber(i),
        endRowNumber: ChartUtils.getEndLineNumber(i)
      };
    });
  }


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
    if (!node) {
      console.log('no selected node');
      return;
    }
    let fileNode: FileNode = ChartUtils.isMatchNode(node) ? this.getFileNodeByPath((node as MatchNode).d.ofFile) : node as FileNode;
    if (!fileNode) {
      if (ChartUtils.isFileNode(node)) fileNode = Utils.deepCopy(node);
      else {
        console.log('no of file node');
        return;
      }
    }
    if (ChartUtils.getFileNodeIsGrouped(node)) {
      ChartUtils.setFileNodIsGrouped(node, false);
      ChartUtils.setFileNodIsGrouped(fileNode, false);
      fileNode.hidden = true;
    } else {
      ChartUtils.setFileNodIsGrouped(node, true);
      ChartUtils.setFileNodIsGrouped(fileNode, true);
      let fileMatches = this.getFileNodeMatchNodes(fileNode, false);
      fileNode.hidden = false;
      this.app.recalulateRectangles = true

      fileNode.y = fileMatches.sort((a, b) => {
        return a.y - b.y;
      })[0].y - (ChartConsts.matchDistance.toPreviousMatch * ChartConsts.gridBaseSize) / 2;
      fileNode.x = fileMatches.sort((a, b) => {
        return b.x - a.x;
      })[0].x - (ChartConsts.matchDistance.toPreviousMatch * ChartConsts.gridBaseSize);
    }
    this.chart.nodes.update(fileNode);
  }

  selectMatchOfLine(row: number, fileNode: FileNode) {
    let matches = this.getFileNodeMatchNodes(fileNode);
    matches = matches.filter((match: Node) => {
      return ChartUtils.getLineNumber(match) === row;
    });
    if (matches.length) {
      this.chart.setSelectionNodes(matches.map(i => i.id));
      this.app.selectedNode = matches[0]
    }
  }

  getNodesInGroupBoundaries(groupNodeId: IdType, excludeSelf = true): VisiNode[] {
    let boundaries = this.getGroupBoundaryNodes(groupNodeId).map((i) => ({ x: i.x, y: i.y }))
    const groupBoundary = this.chart.getBoundingBox(groupNodeId)
    let groupBoundaries = [{ x: groupBoundary.left, y: groupBoundary.top }, { x: groupBoundary.left, y: groupBoundary.bottom }, { x: groupBoundary.right, y: groupBoundary.top }, { x: groupBoundary.right, y: groupBoundary.bottom }]
    if (boundaries.length === 0) return []

    const leftToRight = boundaries.concat(groupBoundaries).map(i => i.x).sort((i, j) => i - j)
    const topToBottom = boundaries.concat(groupBoundaries).map(i => i.y).sort((i, j) => i - j)

    const rect = {
      left: leftToRight[0], top: topToBottom[0], right: leftToRight[leftToRight.length - 1], bottom: topToBottom[topToBottom.length - 1]
    }

    let confinedNodes = this.chart.getAllNodes((node) => (
      !node.hidden &&
      (node.x >= rect.left && node.x <= rect.right && node.y >= rect.top && node.y <= rect.bottom)
    )) as VisiNode[]
    // exclude self to check for inner groups
    confinedNodes = confinedNodes.filter(i => i.id !== groupNodeId)
    let confinedGroupNodes = confinedNodes.filter(i => ChartUtils.isGroupNode(i))
    confinedGroupNodes.forEach((i) => {
      confinedNodes = confinedNodes.concat(this.getNodesInGroupBoundaries(i.id, false))
    })

    // possibly include self in results
    if (!excludeSelf) confinedNodes.push(this.chart.getItem(groupNodeId) as VisiNode)
    return confinedNodes
  }

  collapseGroup(groupNodeId) {
    // un-attach all attached to group
    let existingGroupNodes = this.chart.getAllNodes((i: VisiNode) => (i.d && i.d.belongsToGroup === groupNodeId))
    this.chart.nodes.update(Utils.deepCopy(existingGroupNodes.map((i: VisiNode) => {
      if (i.d.type !== NodeTypes.boundaryNode) i.d.belongsToGroup = undefined
      return i
    })))

    // attach and hide all confined nodes in group rectangle
    let newGroupNodes = this.getNodesInGroupBoundaries(groupNodeId).map((i) => {
      i.d.belongsToGroup = groupNodeId;
      i.hidden = true;
      return i
    })
    this.chart.nodes.update(newGroupNodes)
    const groupNode = this.chart.getItem(groupNodeId) as GroupNode;
    groupNode.d.isCollpased = true
    this.chart.nodes.update([groupNode])

    // replace all edges in and out of group with edges to group
    const groupNodeIds = newGroupNodes.map(i => i.id)
    const toEdges = this.chart.getAllEdges(i => groupNodeIds.indexOf(i.to) !== -1 && groupNodeIds.indexOf(i.from) === -1)
    const fromEdges = this.chart.getAllEdges(i => groupNodeIds.indexOf(i.from) !== -1 && groupNodeIds.indexOf(i.to) === -1)
    const newEdges = toEdges.map((i) =>
      Utils.deepMerge(i, { to: groupNodeId, id: i.id + '_group' }, { d: { type: EdgeTypes.collapseEdge } })
    ).concat(fromEdges.map(i =>
      Utils.deepMerge(i, { from: groupNodeId, id: i.id + '_group' }, { d: { type: EdgeTypes.collapseEdge } })
    ))
    this.chart.addNodesAndLinks(newEdges)
  }

  expandGroup(groupNodeId) {
    let groupNodes = this.chart.getAllNodes((i: VisiNode) => (i.d && i.d.belongsToGroup === groupNodeId))
      .map((i: VisiNode) => {
        if (i.d.type !== NodeTypes.boundaryNode) i.d.belongsToGroup = undefined
        i.hidden = false
        return i
      })
    this.chart.nodes.update(groupNodes)

    let groupEdges = this.chart.getAllEdges((i: VisiEdge) =>
      i.d.type === EdgeTypes.collapseEdge &&
      (i.from === groupNodeId || i.to === groupNodeId)
    )

    this.chart.deleteItems({ nodes: [], edges: groupEdges.map(i => i.id) })

    const groupNode = this.chart.getItem(groupNodeId) as GroupNode;
    groupNode.d.isCollpased = false
    this.chart.nodes.update([groupNode])
    this.chart.setSelection({ nodes: groupNodes.concat([groupNode]).map(i => i.id), edges: [] })
  }

  getAttachedToGroup(groupNodeId) {
    return this.chart.getAllNodes((i: VisiNode) => i.d.belongsToGroup === groupNodeId)
  }

  /**
   * Gets all descendants of a node by recursively traversing outgoing connections
   * @param nodeId The ID of the node to get descendants for
   * @returns Array of node IDs representing all descendants
   */
  public getAllDescendants(nodeId: IdType): IdType[] {
    const visited = new Set<IdType>();
    const descendants: IdType[] = [];

    const traverseDescendants = (currentId: IdType) => {
      // Get all nodes connected from the current node
      const connectedNodes = this.chart.getNeighboursByEdge(currentId, (edge: Edge) => {
        // Only follow edges going from the current node
        return edge.from === currentId && !ChartUtils.isFileEdge(edge);
      }).nodes;

      // Process each connected node
      connectedNodes.forEach(connectedId => {
        // Avoid cycles
        if (!visited.has(connectedId)) {
          visited.add(connectedId);
          descendants.push(connectedId);
          // Recursively process this node's descendants
          traverseDescendants(connectedId);
        }
      });
    };

    traverseDescendants(nodeId);
    return descendants;
  }

  public makeIntoTreeLayout() {
    // 1. Run hierarchical layout
    this.chart.chart.setOptions({
      layout: { hierarchical: { enabled: true, direction: "UD" } },
      physics: { enabled: false }
    });

    // 2. Save node positions into the DataSet
    this.chart.chart.once("afterDrawing", () => {
      const positions = this.chart.chart.getPositions();
      for (const id in positions) {
        this.chart.nodes.update({ id, x: positions[id].x, y: positions[id].y, physics: false });
      }

      // 3. Position filename nodes relative to their match nodes
      this.positionFilenameNodesAfterLayout();

      // 4. Turn off hierarchical layout, keep nodes fixed
      this.chart.chart.setOptions({
        layout: { hierarchical: { enabled: false } }
      });
    });
  }

  private positionFilenameNodesAfterLayout() {
    const matchNodes = this.chart.getAllMatchNodes();
    const filenameNodesToUpdate: Node[] = [];

    matchNodes.forEach(matchNode => {
      const filenameNodeId = ChartUtils.getFilenameNode(matchNode);
      const filenameNode = this.chart.getNode(filenameNodeId);
      
      if (filenameNode) {
        const position = ChartUtils.getFilenameNodePosition(matchNode);
        filenameNode.x = position.x;
        filenameNode.y = position.y;
        filenameNodesToUpdate.push(filenameNode);
      }
    });

    if (filenameNodesToUpdate.length > 0) {
      this.chart.nodes.update(filenameNodesToUpdate);
    }
  }
}
