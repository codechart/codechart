import {AppComponent, MatchInfo} from "../app.component";
import {VlaStyles, Consts, ChartUtils} from "./vla.styles";
import { Network, DataSet, Node, Edge, IdType } from 'vis'

import { ChartWrapper } from "./vla.styles"

export class VlaActions {
  private app: AppComponent;
  private chart: ChartWrapper
  constructor (appComponent: AppComponent) {
    this.app = appComponent
    this.chart = this.app.chart
  }

  public addNodesToChart(nodesAndLinks: Array<Node | Edge>) {
    let newNodesAndLinks = nodesAndLinks.filter(item=>this.chart.getItem(item.id)===null)
    let existingFileNodesNumber = ChartUtils.filterNodes(this.chart.nodes.get()).filter(node=>ChartUtils.isFileNode(node)).length

    let addedFileIndex = existingFileNodesNumber
    newNodesAndLinks.map(item=> {
      if(ChartUtils.isFileNode(item)) {
        let fileNode = this.setFileNodePos(item as Node, addedFileIndex)
        addedFileIndex++
        return fileNode
      } else return item
    })

    console.log('added nodes and links', newNodesAndLinks)
    this.chart.nodes.getDataSet().getIds()

    this.chart.addNodesAndLinks(newNodesAndLinks)

    setTimeout(() => {
      this.dimNodes(nodesAndLinks)
    }, 100)

    this.app.resultIndex++
  }

  private setFileNodePos(node: Node, fileNodeIndex: number) {
    let positions = Consts.filePositions
    let xPos = positions.distance*(fileNodeIndex%positions.maxInRow)
    let yPos = positions.distance*Math.floor((fileNodeIndex/positions.maxInRow))
    let fileNode = Object.assign(node, {
      x: xPos,
      y: yPos
    })
    return fileNode
  }

  private dimNodes(addedNodesAndEdges: Array<Node | Edge>) {
    let dimmedNodesIds = this.chart.getAllItemIds().nodes.filter(nodeId=> {
      return (
        // not a file node
        !ChartUtils.isFileNode(this.chart.getItem(nodeId) as Node) &&
          // not a non path node
        !this.isPathNode(this.chart.getItem(nodeId) as Node) &&
          //not added now
        addedNodesAndEdges.map(node=>{return node.id}).indexOf(nodeId)==-1
      )
    })
    let dimmedNodes: Node[] = dimmedNodesIds.map(nodeId=>{return this.chart.getItem(nodeId) as Node})
    this.chart.updateNodesStyle(dimmedNodes, VlaStyles.dimmedNode)

    let addedNodes = ChartUtils.filterNodes(addedNodesAndEdges).filter(node=>!ChartUtils.isFileNode(node))
    this.chart.updateNodesStyle(addedNodes, VlaStyles.normalNode)
  }

  private dimEdges(addedNodesAndEdges: Array<Node | Edge>) {
    let dimmedEdgesIds = this.chart.getAllItemIds().edges.filter(edgeId=> {
      return (
        // not a file edge
        !ChartUtils.isFileEdge(this.chart.getItem(edgeId) as Edge) &&
        // is an edge connecting
        !this.isPathEdge(this.chart.getItem(edgeId) as Edge) &&
        //not added now
        addedNodesAndEdges.map(edge=>{return edge.id}).indexOf(edgeId)==-1
      )
    })
    let dimmedEdges: Edge[] = dimmedEdgesIds.map(edgeId=>{return this.chart.getItem(edgeId) as Edge})
    this.chart.updateEdgesStyle(dimmedEdges, VlaStyles.dimmedEdge)
  }

  public createAndSelectStartNode() {
        let startNode =  this.chart.createNode('_start', 'START', VlaStyles.startNode)
        this.addNodesToChart([startNode])
        this.chart.setSelectionNodes([startNode.id])
        this.app.selectedNode = startNode
  }

  public clearChart() {
      this.app.chart.setData([], [])
  }

  public createShape(selectedNode, shapeType: string): Node {
    let newNode, newLink = null
    if(selectedNode!==null && selectedNode) {
      let newNode = this.chart.createNode(shapeType + selectedNode.id + new Date().getTime(), 'new remark', VlaStyles.nodesTypes[shapeType])
      let newLink = this.chart.createLink(selectedNode.id, newNode.id, VlaStyles.linkTypes['dashedNonArrowSmall'])
      this.addNodesToChart([newNode, newLink])
    } else {
      let newNode = this.chart.createNode(shapeType + new Date().getTime(), 'new remark', VlaStyles.nodesTypes[shapeType])
      this.addNodesToChart([newNode])
    }
    return newNode
  }

  public createMatchNode(match: MatchInfo, ofFileNodeId): Array<Node | Edge> {
    let results: Array<Node | Edge> = []
    let matchNodeId = ofFileNodeId + ':' + match.lineNumber
    let matchNodeProps = Object.assign({
      d: {line: match.line, value: match.value, lineNumber: match.lineNumber, index: match.index, ofFile: ofFileNodeId},
    }, VlaStyles.resultNode)
    results.push(this.chart.createNode(matchNodeId, match.line, matchNodeProps))
    results.push(this.chart.createLink(ofFileNodeId, matchNodeId, VlaStyles.fileLink))
    if (this.app.selectedNode !== null) {
      results.push(this.chart.createLink(this.app.selectedNode.id, matchNodeId, VlaStyles.matchMatchLink, this.app.searchJson.pattern))
    }
    return results
  }

  public getNodeStyleAndTitle(value: string) {
    let style = {}
    this.app.typesMapping.forEach(item => {
      if (Object.keys(style).length) return
      let match = value.match(item.regexCondition)
      value = value.trim()
      if(value.length > Consts.maxTitleLength && item.type!=='file') {
        value = value.substring(0, Consts.maxTitleLength) + '...'
      }
      if (match != null) {
        let title = value.match(item.titleExtraction)
        let titleObj
        if (title != null) {
          titleObj = {t: title[0]}
        } else {
          titleObj = value
        }
        style = {
          d: {
            value: value,
            type: item.type
          }
        }
        style = Object.assign(style, item.style, titleObj)
      }
    })
    if (!Object.keys(style).length) {
      let titleObj = {t: value}
      style = VlaStyles.normalNode
      style = Object.assign(style, titleObj)
    }
    return style
  }

  public setNodeStyleAndSave(node, newStyle: any) {
    if(!node.d.prevStyle) node.d.prevStyle = {}
    Object.keys(newStyle).forEach(styleField => {
      node.d.prevStyle[styleField] = node[styleField]
      node[styleField] = newStyle[styleField]
    })
  }

  public loadNodePrevStyle(node) {
    if(!node.d.prevStyle) return
    Object.keys(node.d.prevStyle).forEach(styleField => {
      node[styleField] = node.d.prevStyle[styleField]
      delete node.d.prevStyle[styleField]
    })
  }

  public getNeighborNodesIds(nodeId: IdType) {
    return this.app.chart.getNeighbours(nodeId).nodes
  }

  public deleteSelected() {
    let selection = this.chart.getSelection()
    let fileNodes: IdType[] = selection.nodes.filter(item=>this.chart.getNode(item)['d']['fileContent'])
    let fileNodesNeighbours: IdType[] = []
    fileNodes.forEach(node=> {
      fileNodesNeighbours = fileNodesNeighbours.concat(this.getNeighborNodesIds(node))
    })
    this.chart.deleteItems({nodes: fileNodesNeighbours, edges: []})
    this.chart.deleteItems(selection)
  }

  public undo() {
    this.chart.undo()
  }

  setPathNode(node: Node|Edge) {
    this.chart.updateNodesStyle([node as Node], Object.assign(VlaStyles.pathNode, Object.assign(node['d'], VlaStyles.pathNodeAttribute)))
  }

  isPathNode(node: Node) {
    return (ChartUtils.getNodeAttributes(node).pathNodeAttribute)
  }

  isPathEdge(edge: Edge) {
    return (this.isPathNode(this.chart.getItem(edge.to) as Node)
      &&
      this.isPathNode(this.chart.getItem(edge.from) as Node))
  }

  public setSelectedAsPath() {
    if(this.app.selectedNode===null) return
    this.setPathNode(this.app.selectedNode)
  }

}
