import {Edge, IdType, Node} from "vis";
import {ChartWrapper} from "./chart.wrapper";
import {TypeMapping} from "./jsons";

export const AttributesKey = 'd'
export const OldStyleKey = 'oldStyle'
export class ChartUtils {
  
  public static getElementSize(element: Node | Edge): number {
    if(ChartUtils.isFileEdge(element)) {
      return (element as Edge).width
    } else {
      let node = (element as Node)
      if(node.font) {
        return (node.font as any).size
      }
      return null
    }
  }
  public static isOfFile(node): boolean {
    return ChartUtils.getAttributes(node).ofFile
  }

  public static isFileNode(item: Node | Edge): boolean {
    if(!ChartUtils.isNode(item)) return false
    return (ChartUtils.getAttributes(item).fileContent)
  }

  public static isFileEdge(item: Node | Edge): boolean {
    if(ChartUtils.isNode(item)) return false
    return (ChartUtils.getAttributes(item).type==='ofFile')
  }

  public static isNode(item): boolean {
    return this.getEdgeFrom(item) ? false : true
  }

  public static getEdgeFrom(edge: Edge): IdType {
    return edge.from
  }

  public static getEdgeTo(edge: Edge): IdType {
    return edge.to
  }

  public static setNewStyleAndGet(element: any, newStyle: any) {
    for(let key in newStyle) {
      element[AttributesKey][OldStyleKey] = {}
      element[AttributesKey][OldStyleKey][key] = element[key]
      element[key] = newStyle[key]
    }
    return element
  }

  public static filterNodes(nodesAndLinks: Array<Node | Edge>): Node[] {
    return nodesAndLinks.filter(i => {if(ChartUtils.isNode(i)) return i}) as Node[]
  }

  public static filterEdges(nodesAndLinks: Array<Node | Edge>): Edge[] {
    return nodesAndLinks.filter(i => {if(!ChartUtils.isNode(i)) return i}) as Edge[]
  }

  public static setElementAttributesAndGet(element, newAttributes: any) {
    let newAttributesObject = Object.assign({}, element[AttributesKey], newAttributes)
    return Object.assign({}, element, {d: newAttributesObject})
  }

  public static getFileNodeContent(node) {
    if(node.d!==undefined)
      return ChartUtils.getAttributes(node).fileContent
    else return null
  }

  public static setFileContent(node: Node, content, chart: ChartWrapper) {
    chart.updateNodeAtts([node], {fileContent: content})
  }

  public static getOfFile(node: Node): string {
    return ChartUtils.getAttributes(node).ofFile
  }

  public static setOfFile(node: Node, newOfFile, chart: ChartWrapper) {
    chart.updateNodeAtts([node], {ofFile: newOfFile})
  }

  public static getAttributes(element: Node | Edge) {
    return element[AttributesKey]
  }

  public static getLineNumber(node:Node) {
    return ChartUtils.getAttributes(node) ? ChartUtils.getAttributes(node).lineNumber : null
  }

  public static setLineNumber(node: Node, newLineNumber, chart: ChartWrapper) {
    chart.updateNodeAtts([node], {lineNumber: newLineNumber})
  }

  public static getIndexInLine(item: Node | Edge) {
    return ChartUtils.getAttributes(item).indexInLine
  }

  public static getLineStartIndex(item: Node | Edge) {
    return ChartUtils.getAttributes(item).lineStartIndex
  }

  public static getStyleForTypesJson(typesJson: TypeMapping[], node: Node) {
    let nodesStyles: TypeMapping[]= typesJson.filter(type=>{return type.item==='node'})
    let types = nodesStyles.filter((type: TypeMapping)=>{
      let regex = new RegExp(type.regexCondition)
      return regex.exec(ChartUtils.getLine(node))!==null
    })
    if(types.length>0) return types[0].style
    else return {}
  }

  public static getLine(node) {
    return this.getAttributes(node).line
  }

  public static getFilePath(fileNode: Node | Edge) {
    return ChartUtils.getAttributes(fileNode).path
  }

  public static getNodeByFileAndLineNumber(filePath: any, line: string, chart: ChartWrapper) {
    let result = chart.nodes.get().filter(node=> {
      if(ChartUtils.isFileNode(node)) return false
      if(ChartUtils.getOfFile(node)!==filePath) return false
      if(ChartUtils.getLine(node)!==line) return false
      return true
    })
    if(result.length===0) return null
    return result[0]
  }
}
