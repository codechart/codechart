import Link = KeyLines.Link;
import Shape = KeyLines.Shape;
import Node = KeyLines.Node;
import {AppComponent, MatchInfo} from "../app.component";
import { VlaStyles } from "./vla.styles";

export class VlaActions {
  private app: AppComponent;
  constructor (appComponent: AppComponent) {
    this.app = appComponent
  }

  public addNodesToChart(nodesAndLinks: Array<KeyLines.Node | KeyLines.Link>, optionalProps?: {setColor?: boolean}) {
    let color = this.app.getRandomColor()
    if(optionalProps && optionalProps.setColor) {
      nodesAndLinks = nodesAndLinks.map(item => {
        if (item.type === 'link') {
          if(item.d.type==='ofFile') return item
          else return Object.assign(item, {c: color})
        } else {
          return Object.assign(item, {b: color})
        }
      })
    }
    console.log(nodesAndLinks)
    nodesAndLinks.map((node) => {
      if (node.d.level) return node
      node.d.level = this.app.level
      return node
    })
    this.app.resultsHistory.unshift({searchJson: Object.assign({}, this.app.searchJson), results: [...this.app.allData], color: color})
    let resizeItems = []
    if(this.app.reduceSizeOfOldNodes) {
      this.app.chart.each({type: "all"}, (item) => {
        if (item.d.locked) return
        if (item.type === 'node' && item.e > 0.4 && item.d.type !== 'file' && item.d.type !== 'remark' ) {
          resizeItems.push(Object.assign(item, {e: item.e - 0.2}))
        }
        else if (item.type === 'link' && item.w > 0.2) {
          resizeItems.push(Object.assign(item, {w: item.w - 1}))
        }
      })
      this.app.chart.setProperties(resizeItems)
    }


    this.app.allData = this.app.allData.concat(nodesAndLinks)
    this.app.chart.expand(nodesAndLinks, {
      layout: {
        name: 'standard',
        fix: 'all',
        tidy: true,
        fit: false,
        orientation: 'down',
        tightness: 9,
        level: 'level',
        consistent: true
      }
    }).then(() => {
    })
    this.app.level++
  }

  public createAndSelectStartNode() {
        let startNode =  this.createNode('_start', 'START', VlaStyles.startNode)
        this.addNodesToChart([startNode])
        this.app.chart.selection([startNode.id])
        this.app.selectedNode = startNode
  }

  public clearChart() {
      this.app.resultsHistory.push({searchJson: null, results: [...this.app.allData], color: 'green'})
      this.app.chart.load({type: 'LinkChart', items: []})
      this.createAndSelectStartNode()
  }

  public createRemark(selectedNode): KeyLines.Node {
    let newNode, newLink = null
    if(selectedNode!==null && selectedNode) {
      let newNode = this.createNode('_remark' + selectedNode.id + new Date().getTime(), 'new remark', VlaStyles.remarkNode)
      let newLink = this.createLink(selectedNode.id, newNode.id, {w:0.2, a1: false, a2: false})
      this.addNodesToChart([newNode, newLink])
    } else {
      let newNode = this.createNode('_remark' + new Date().getTime(), 'new remark', VlaStyles.remarkNode)
      this.addNodesToChart([newNode])
    }
    return newNode
  }

  public createMatchNode(match: MatchInfo, ofFileNodeId): Array<KeyLines.Node | KeyLines.Link> {
    let results: Array<KeyLines.Node | KeyLines.Link> = []
    let matchNodeId = ofFileNodeId + ':' + match.lineNumber
    results.push(this.createNode(matchNodeId, match.line, {
      d: {line: match.line, value: match.value, lineNumber: match.lineNumber, index: match.index, ofFile: ofFileNodeId},
      "ha0": {
        "c": 'rgb(0,0,0)',
        "r": 35,
        "w": 1
      }
    }))
    results.push(this.createLink(ofFileNodeId, matchNodeId, {
      ls: 'dashed',
      a1: false,
      w: 0.2,
      d: {type: 'ofFile'},
      c: "rgb(120, 120, 120)"
    }))
    if (this.app.selectedNode !== null) {
      results.push(this.createLink(matchNodeId, this.app.selectedNode.id, {}))
    }
    return results
  }

  public createLink(from, to, attributes: any) {
    return Object.assign({
      "id": from + '_' + to,
      "type": "link",
      "id1": from,
      "id2": to,
      "d": {},
      "a1": true,
      "c": 'rgb(155,155,155)',
      "w": 5,
      "ls": "solid",
      "u": "",
    }, attributes) as KeyLines.Link

  }

  public createNode(id, value, otherAttributes?: any): KeyLines.Node {
    let node = Object.assign(
      {type: "node", id: id, ci: true, u: '', d: {}},
      this.getNodeStyleAndTitle(value)
    )
    let nodeProperties = Object.assign(node.d, otherAttributes.d)
    if (otherAttributes)
      node = Object.assign(node, otherAttributes, {d: nodeProperties})
    else
      node = Object.assign(node, {d: nodeProperties})
    return node as KeyLines.Node
  }

  public getNodeStyleAndTitle(value: string) {
    let style = {}
    this.app.typesMapping.forEach(item => {
      if (Object.keys(style).length)return
      let match = value.match(item.regexCondition)
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
      style = {
        e: 1, bw: '4',
        ha0: {
          c: 'rgb(0, 0, 0)', //the halo fill colour
          r: 35, //the halo radius
          w: 1 //the halo width
        }
      }
      style = Object.assign(style, titleObj)
    }
    return style as KeyLines.NodeStyle
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

  public getNeighborNodesIds(node: Node | Link | Shape) {
    return this.app.chart.graph().neighbours(node.id).nodes
  }


}
