import {AppComponent, MatchInfo} from "../app.component";
import {VlaStyles, maxTitleLength, ChartUtils} from "./vla.styles";
import { Network, DataSet, Node, Edge, IdType } from 'vis'

import { ChartWrapper } from "./vla.styles"

export class VlaActions {
  private app: AppComponent;
  private chart: ChartWrapper
  constructor (appComponent: AppComponent) {
    this.app = appComponent
    this.chart = this.app.chart
  }

  public addNodesToChart(nodesAndLinks: Array<Node | Edge>, optionalProps?: {setColor?: boolean}) {
    nodesAndLinks = nodesAndLinks.filter(item => {
      if(this.chart.getItem(item.id)===null) return item
    })

    let color = this.app.getRandomColor()
    if((optionalProps && optionalProps.setColor) || !optionalProps) {
      nodesAndLinks = nodesAndLinks.map(item => {
        if (!ChartUtils.isNode(item)) {
          if(this.chart.getProperty(item, 'type')==='ofFile') return item
          else return Object.assign(item, this.chart.nodeColorJson(color))
        } else {
          return Object.assign(item, this.chart.linkColorJson(color))
        }
      })
    }
    console.log('added nodes and links', nodesAndLinks)
    this.chart.nodes.getDataSet().getIds()
    this.app.resultsHistory.unshift(
      {
        searchJson: Object.assign({}, this.app.searchJson),
        results: Object.assign({},
        nodesAndLinks)
      })

    this.chart.addNodesAndLinks(nodesAndLinks, {})
    this.app.level++
  }

  public createAndSelectStartNode() {
        let startNode =  this.chart.createNode('_start', 'START', VlaStyles.startNode)
        this.addNodesToChart([startNode])
        this.chart.setSelectionNodes([startNode.id])
        this.app.selectedNode = startNode
  }

  public clearChart() {
      this.app.resultsHistory.push({searchJson: null, results: []})
      this.app.chart.setData([], [])
  }

  public createShape(selectedNode, shapeType: string): Node {
    let newNode, newLink = null
    if(selectedNode!==null && selectedNode) {
      let newNode = this.chart.createNode(shapeType + selectedNode.id + new Date().getTime(), 'new remark', VlaStyles.nodesTypes[shapeType])
      let newLink = this.chart.createLink(selectedNode.id, newNode.id, VlaStyles.linkTypes['dashedNonArrowSmall'])
      this.addNodesToChart([newNode, newLink], {setColor: false})
    } else {
      let newNode = this.chart.createNode(shapeType + new Date().getTime(), 'new remark', VlaStyles.nodesTypes[shapeType])
      this.addNodesToChart([newNode], {setColor: false})
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
      results.push(this.chart.createLink(matchNodeId, this.app.selectedNode.id, {}, this.app.searchJson.pattern))
    }
    return results
  }

  public getNodeStyleAndTitle(value: string) {
    let style = {}
    this.app.typesMapping.forEach(item => {
      if (Object.keys(style).length) return
      let match = value.match(item.regexCondition)
      value = value.trim()
      if(value.length > maxTitleLength && item.type!=='file') {
        value = value.substring(0, maxTitleLength) + '...'
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
}
