///aaaa///
import * as ShapePoints from 'shape-points'
import { ContextMenuComponent, ContextMenuService } from 'ngx-contextmenu'
import { AutoComplete, TreeNode } from 'primeng/primeng'
import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { SearchActions } from './search/search.actions'
import { CcItemStyles, ChartConsts, NodeTypes } from './chart/chart.consts'
import { StartSearchJson, TypeMapping, typesMapping } from './chart/jsons'
import { JsonPipe } from '@angular/common'
import { Color, Edge, IdType, Node } from 'vis'
import { ChartUtils } from './chart/chart.utils'
import { ChartActions, PositioningOptions } from './chart/chart.actions'
import 'ace-builds/webpack-resolver'
import * as $ from 'jquery'
import { CreateUtils } from './chart/create.utils'
import { SaveLoad } from './chart/save.load'
import {
  EndPoints,
  FileNode,
  FindInFilesResponse, GroupNode,
  MatchInfo,
  MatchNode,
  SearchObject, VisiNode,
} from './types.nodejs'
import { Languages, PreSeacrhJsonsUtils, SearchOptions } from './search/search.jsons'
import { AreaSelect } from './chart/area.select'
import { Utils } from './chart/Utils'
import { ChangeTextEvent, CodeViewerComponent } from './code-viewer/code-viewer.component'
import { ChartStylingUtils } from './chart/chart.styling'
import { AppInterceptorsService } from './services/AppInterceptorService'
import { QueryDto, ResultDiagramUI, SaveLoadService } from './services/SaveLoadService'
import { ChartWrapper, EventItem } from './chart/chart.wrapper'
import { Env } from './utils/Env'
import { PrettifyPipe } from './pipes/prettify'
import { Ace } from 'ace-builds'

export interface CcShape {
  name: string,
  details: { tooltip, node, class }
}

const pathStorageKey = 'selectedPath'

export interface CurrentFile {
  content: string,
  name: string,
  lines: string[],
  node: Node,
  isCustom: boolean
}

export interface MessageBoxItem {
  title: string,
  message: string,
  displayTime: number
}

export interface FileLegendItem {
  color,
  fileNodeId,
  fileLabel
}

export interface CCPath {
  label: string,
  folder: string,
  gitUrl: string
}

export const Options = {
  printFileNames: false,
  fillFileRect: false,
  drawFileRect: true,
  positioning: PositioningOptions.DOWN,
  showFileLegend: false,
  showCodeLabels: false,
  replaceClickedWithSelection: false,
  keepChartOnLoadFromJson: false,
  showInContentLines: true,
  minResultsCountToShowResults: 7,
}

export interface SelectedDiagramInfo extends QueryDto {
  id: number
  projectList: string[]
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  providers: [JsonPipe, PrettifyPipe],
})
export class AppComponent implements OnInit, AfterViewInit {
  @ViewChild('textMenu') public textMenu: ContextMenuComponent
  @ViewChild('chartMenu') public chartMenu: ContextMenuComponent
  @ViewChild('openfileInput') private openfileInput: AutoComplete
  @ViewChild('aceEditor') public codeEditor: CodeViewerComponent
  @ViewChild('searchResultsCodeEditor') public searchResultsCodeEditor: CodeViewerComponent
  public ChartConsts = ChartConsts
  public PositioningOptions = PositioningOptions

  public filerFullscreen = false
  public chartFullscreen = false
  public chart: ChartWrapper = new ChartWrapper(this)
  public chartActions = new ChartActions(this)
  public chartStyling = new ChartStylingUtils(this)
  public searchActions = new SearchActions(this)
  public saveLoad = new SaveLoad(this, this.http)
  public areaSelect = new AreaSelect(this)
  public paths: CCPath[] = []
  public dropdownPaths: {label, value}[] = []
  public openFileVisible = false
  public saveJsonVisible = false
  public showDiagramsLoadTable = false
  public currentDiagramDetails: SelectedDiagramInfo = { id: -1, projectList: [] }
  public saveFullVisible = false
  public showFindResults = false
  public isShowSyncDialog = false
  public findResults: {
    findResults: FindInFilesResponse[], totalMatchCount: number
  } = { findResults: [], totalMatchCount: 0 }
  public diagramsList: ResultDiagramUI[] = []
  public isShowHelpDialog = false

  private _searchJson: SearchObject = StartSearchJson
  public selectedNodeSize = ''

  public ccShapes: CcShape[] = CcItemStyles.nodesTypes
  public linkTypes = Object.keys(CcItemStyles.linkTypes)
  public filesInLegend: FileLegendItem[] = []
  public groupsInLegend: FileLegendItem[] = []

  public typesMapping: TypeMapping[] = null
  public showNodeEditBox = false
  public currentFile: CurrentFile = null
  public messageBoxElement: HTMLElement

  public titleElement: HTMLElement = null

  public previousSelectedNode: Node | Edge = null
  public previousDblClickedNode: Node | Edge = null
  public lastDblClickedNode: Node | Edge = null

  public allMatchesSelected = false

  public isAllFilesToSyncSelected = false
  public syncFilesList: { node: FileNode, path: string, isSelected: boolean, isExists: boolean }[] = []

  public selectedSearchPatternIndex = 0

  public messageBoxQueue: MessageBoxItem[] = []


  public _markedText: string = null


  public availableFiles: { fullPath, fromSource }[] = []
  public fileTreeNodes: TreeNode[] = []
  public selectedFileTreeFullPath: string
  public selectedFileTreeNodeLabel: string

  public openFileSuggestions: string[] = []
  private loadResultsCallback: any
  // for debugging
  public ChartUtils = ChartUtils
  public Utils = Utils
  public CreateUtils = CreateUtils
  public Options = Options

  public _patternList: SearchOptions[]
  public dropdownLanguageSelection: { label, value }[] = []
  public seletedLanguage: { label, value } = null
  public dropdownRegexes: { label, value: SearchOptions }[] = []
  private languageRegexes: Languages[] = []
  public loadedDiagrams: string[] = []


  public lastDiagramLoaded: string = ''
  public splitChar: string = null
  private lastRightClickedNode: IdType

  public recalulateRectangles = true
  public selectionPreDrag: { nodes: IdType[], edges: IdType[] } = { nodes: [], edges: [] }
  syncPath: CCPath
  private isDragging = false
  public chartUtils = ChartUtils
  public isRightClickGroup = false
  public isRightClickFile = false

  constructor(public http: HttpClient, private jsonPipe: JsonPipe, private prettifyPipe: PrettifyPipe, public httpInterceptService: AppInterceptorsService, public saveLoadService: SaveLoadService, private contextMenuService: ContextMenuService) {
    this.searchObject = StartSearchJson
    this.typesMapping = typesMapping
    this._searchJson.isRegex = false
    console.log('version 1.2.1')


    window['Global_app'] = this
  }

  contactLicenseServer = async () => {
    const res = await fetch(Env.getApiEndpoint() + '/approveLicense', { method: 'POST' })
    if (!res.ok) {
      this.iAmNotLicensed('Make sure you have an internet connection.')
      return
    }
    const bodyJson = await res.json()
    const status = bodyJson.status
    if (status) {
      if (status === 'UPDATE_AVAILABLE') {
        this.addMessage('Update Available', 'Go to Code-Chart.com to get latest version', 7000)
      }
    }
  }

  iAmNotLicensed(reason: string) {
    document.getElementsByTagName('body')[0].innerHTML = `
      <h1>Couldn't verify a legitimate license.</h1>
      <h2>${reason}</h2>
      <h3>Try refreshing or contact us</h3>
      `
  }

  ngAfterViewInit() {
    this.contactLicenseServer()
    this.chartActions.initialize()
    this.chartStyling.initialize()
    this.chart.initialize()
    this.searchActions.initialize()
    this.saveLoad.initialize()
    this.areaSelect.intialize()


    let resizeWindow = () => {
      document.getElementById('filer').style.height = ($(window).height() - document.getElementById('topbox').clientHeight) + 'px'
      // document.getElementById('filer').style.height = $(window).height() + 'px';
    }
    resizeWindow()
    window.addEventListener('resize', () => {
      resizeWindow()
    })

    let inputCollection = document.getElementsByTagName('input')
    for (let i = 0; i < inputCollection.length; i++) {
      inputCollection[i].addEventListener('keyup', (e) => {
        e.stopPropagation()
      })
    }

    this.initializeData()
    let diagramId = new URL(document.location.href).searchParams.get('loadDiagramId')
    if (diagramId) {
      console.log('loading ' + diagramId)
      this.loadDiagramById(diagramId)

    }
  }

  async initializeData() {
    this.http.get(Env.getApiEndpoint() + EndPoints.getPaths).subscribe((res: { paths: CCPath[] }) => {
      let paths = res.paths
      let storedPath: string = localStorage.getItem(pathStorageKey)
      paths.sort((i, j) => {
        if (i.folder === storedPath) return -1; else return 0
      })
      this.paths = paths
      this.dropdownPaths = paths.map((i)=>{return {label: i.label, value: i.folder}})
      this.searchObject.folderPath = this.paths[0]
      if (paths.find(i => !i.gitUrl)) this.addMessage('some project folders are not git repos', 'some of the project folders are not aligned with git repos. to align your folders use the menu->synch', -1)
    })

    this.http.get(Env.getApiEndpoint() + EndPoints.getLanguages).subscribe((res: Languages[]) => {
      this.languageRegexes = res.map((i: Languages) => {
        if (i.searchOptions.filter(j => j.regex === null).length === 0) {
          i.searchOptions.unshift({ regex: '\\b__TEXT__\\b', name: 'Exact', findClosure: true })
          i.searchOptions.unshift({ regex: null, name: 'Simple', findClosure: true })
        }
        return i
      })
      this.patternList = this.languageRegexes[0].searchOptions
      this.dropdownLanguageSelection = this.languageRegexes.map(i => {
        return { value: i.language, label: this.prettifyPipe.transform(i.language) }
      })
      this.seletedLanguage = this.dropdownLanguageSelection[0]
      this.dropdownRegexes = this.patternList.map(i => {
        return { label: i.name, value: i }
      })
    })

  }


  public loadDiagramsTable() {
    this.saveLoadService.getResults({}).then(res => {
      this.diagramsList = res
      this.showDiagramsLoadTable = true
    })
  }

  public setSelectedLanguage(language: string) {
    this.patternList = this.languageRegexes.find(i => i.language === language).searchOptions
    this.seletedLanguage = { value: language, label: language }
  }


  public toggleMatchNodesLabel() {
    this.Options.showCodeLabels = !this.Options.showCodeLabels
    this.chart.refresh()
  }

  public toggleInContentLines() {
    this.Options.showInContentLines = !this.Options.showInContentLines
    this.chart.refresh()
  }


  public toggleReplaceChartWhenLoading() {
    this.Options.keepChartOnLoadFromJson = !this.Options.keepChartOnLoadFromJson
  }

  public toggleFileLegend() {
    this.Options.showFileLegend = !this.Options.showFileLegend
  }

  public set searchObject(value: SearchObject) {
    this._searchJson = value
  }

  public get searchObject(): SearchObject {
    return this._searchJson
  }

  set selectedNode(element: Node | Edge) {
    this.previousSelectedNode = this.selectedNode
    if (element == null || element === undefined) {
      this.currentFile = null
      return
    }

    let selectedSize = ChartUtils.getElementSize(element)
    this.selectedNodeSize = selectedSize ? (selectedSize.toString()) : ''

    let selectTextInFile = () => {
      if (ChartUtils.isNode(element)) {
        if (ChartUtils.isOfFile(element)) {
          let attributes = ChartUtils.getMatchAttributes(element as Node) as MatchInfo
          if (attributes.lineNumber) this.setFileSelection(attributes.lineNumber, attributes.endLineNumber ? attributes.endLineNumber : null)
        } else {
          this.codeEditor.scrollToLine(0)
        }
      }
    }

    // set file element
    let elementAtts = this.chart.getAttributes(element)
    if (!ChartUtils.isNode(element)) {
      return
    }
    if (ChartUtils.isFileNode(element)) {
      let fileNode = element as FileNode
      this.setCurrentFile({
        content: elementAtts.fileContent,
        name: ChartUtils.isCustomNode(fileNode) ? fileNode.label : ChartUtils.getFilePath(fileNode),
        node: element as Node,
        lines: elementAtts.fileContent.split('\n'),
        isCustom: ChartUtils.isCustomNode(fileNode),
      }, selectTextInFile)
    }
    if (ChartUtils.isMatchNode(element)) {
      let connectedToFileNode = this.chartActions.getFileNodeByPath((element as MatchNode).d.ofFile)
      if (connectedToFileNode) {
        let fileContent = this.chart.getAttributes(connectedToFileNode).fileContent
        this.setCurrentFile({
          content: fileContent,
          name: ChartUtils.isCustomNode(connectedToFileNode) ? connectedToFileNode.label : ChartUtils.getFilePath(connectedToFileNode),
          node: connectedToFileNode as Node,
          lines: fileContent.split('\n'),
          isCustom: ChartUtils.isCustomNode(connectedToFileNode),
        }, selectTextInFile)
      }
    }
  }

  zoomOnSelected() {
    this.chart.fitToNodes(this.chart.getSelection().nodes, true)
  }

  public getFilerWidth() {
    if (!this.filerFullscreen && !this.chartFullscreen) return '50%'
    if (this.filerFullscreen) return '100%'
    if (this.chartFullscreen) return '50%'
  }

  public getChartWidth() {
    if (!this.filerFullscreen && !this.chartFullscreen) return '50%'
    if (this.chartFullscreen) return '100%'
    if (this.filerFullscreen) return '50%'
  }

  public getChartHeight() {
    if (!this.filerFullscreen && !this.chartFullscreen) return '100%'
    if (this.chartFullscreen) return '100%'
    if (this.filerFullscreen) return '50%'
  }

  public getFilerHeight() {
    if (!this.filerFullscreen && !this.chartFullscreen) return '100%'
    if (this.chartFullscreen) return '50%'
    if (this.filerFullscreen) return '100%'
  }

  public addFilesToLegend(fileNodes: Node[]) {
    let addToLegend = (fileNode: Node, labelArray) => {
      if (!labelArray.find(i => i.fileNodeId === fileNode.id)) {
        labelArray.push({
          fileNodeId: fileNode.id,
          color: (fileNode.color as Color).border !== '#000000' ? (fileNode.color as Color).border : '#E93B81',
          fileLabel: fileNode.label,
        })
      }
    }
    let finalizeArray = (array: FileLegendItem[]) => {
      array.sort((i, j) => {
          return this.chart.getNode(i.fileNodeId).x - this.chart.getNode(j.fileNodeId).x
        },
      ).concat([])
    }
    // should be done with .flatMap
    fileNodes.forEach((fileNode: FileNode) => {
      if (this.isNodeInBottomLegend(fileNode)) addToLegend(fileNode, this.groupsInLegend)
      else addToLegend(fileNode, this.filesInLegend)
    })
    finalizeArray(this.filesInLegend)
    finalizeArray(this.groupsInLegend)
  }

  public removeFilesFromLegend(fileNodes: FileNode[]) {
    let removeFromLabelArray = (node: Node, labelArray: FileLegendItem[]) => {
      let index = labelArray.findIndex(i => i.fileNodeId === node.id)
      if (index !== -1) labelArray.splice(index, 1)
    }
    fileNodes.forEach(fileNode => {
      if (this.isNodeInBottomLegend(fileNode)) removeFromLabelArray(fileNode, this.groupsInLegend)
      else removeFromLabelArray(fileNode, this.filesInLegend)
    })
  }

  public isNodeInBottomLegend(fileNode: FileNode) {
    return ChartUtils.isCustomNode(fileNode) || (ChartUtils.isGroupNode(fileNode) || fileNode.d.type === NodeTypes.toDoNode || fileNode.d.markForBottomLabel)
  }

  public updateLabelInFileLegend(fileNode: FileNode, newTitle) {
    let renameTitleInLabel = (node: Node, labelArray: FileLegendItem[]) => {
      let index = labelArray.findIndex(i => i.fileNodeId === node.id)
      if (index !== -1) labelArray[index].fileLabel = newTitle
      labelArray.concat([])
    }
    if (this.isNodeInBottomLegend(fileNode)) renameTitleInLabel(fileNode, this.groupsInLegend)
    else renameTitleInLabel(fileNode, this.filesInLegend)

  }

  public clearLegend() {
    this.filesInLegend = []
    this.groupsInLegend = []
  }

  public getLegendColors(): string[] {
    return this.filesInLegend.map(i => i.color)
  }

  public setFileSelection(startLineNumber, endLineNumber) {
    this.codeEditor.scrollToLine(startLineNumber)
    this.codeEditor.markLinesSelected(startLineNumber, endLineNumber)
  }

  public performSearch(inputKeyEvent: any) {
    if (inputKeyEvent.code === 'Enter') {
      if (inputKeyEvent.ctrlKey) this.searchActions.searchSelectedFile()
      else if (inputKeyEvent.shiftKey) this.searchActions.contentSearch()
      else {
        this.searchActions.totalSearch()
      }
    }
  }

  public getLinesNumbersText(file: CurrentFile): string {
    if (!file) return ''
    return file.lines.map((line, index) => index).join('\r\n')
  }


  public setCurrentFile(fileObject: CurrentFile, callback: () => void) {
    if (this.currentFile !== null && this.currentFile.name === fileObject.name) {
      callback()
      return
    }

    this.currentFile = {
      content: fileObject.content,
      name: fileObject.name,
      node: fileObject.node,
      lines: fileObject.lines,
      isCustom: fileObject.isCustom,
    }
    setTimeout(() => {
      this.codeEditor.markMatchesInFile(this.chartActions.getSeletedFileMatchesRows())
      callback()
    }, 0)

  }

  public clickedChart(event) {
    event.target.parentElement.focus()
  }

  public noSelectedNode() {
    console.log('no node selected')
    this.messageBoxQueue.push({ title: 'no selected node', message: 'no selected node', displayTime: 10000 })
  }

  public createMatchFromSelection(replace = false) {
    let createdNode = this.searchActions.createMatchFromSelection(true, replace)
    if (!createdNode) return
    setTimeout(() => {
      this.chart.setSelectionNodes([createdNode.id])
    }, 100)
  }


  public createToDoNode(isInfo?) {
    this.setSelectionFromRightNode()
    let addedItems: (Node | Edge)[] = []
    let toDoNode = CreateUtils.createFileNode({
      file: 'ToDo_' + new Date().getTime(),
      matches: [],
      content: 'TODO:',
      gitUrl: null
    }, this.chart, this.getLegendColors(), this.chart.getViewPos().x)
    ChartUtils.setDontDrawRectangle(toDoNode, true)

    if (isInfo) {
      toDoNode = Utils.deepMerge(toDoNode, CcItemStyles.infoNode)
      toDoNode.label = 'info'
    } else {
      toDoNode = Utils.deepMerge(toDoNode, CcItemStyles.toDoNode)
      toDoNode.label = 'to do'
    }

    ChartUtils.setIsCustom(toDoNode)
    toDoNode.d.type = NodeTypes.toDoNode

    this.chartActions.positionAndLinkToSelected(toDoNode, addedItems, Utils.deepMerge(CcItemStyles.baseLink, CcItemStyles.shapeLink))
    this.chart.addNodesAndLinks(addedItems)
    this.addFilesToLegend([toDoNode])
  }

  public createGroupNode() {
    let groupNode = CreateUtils.createFileNode({
      file: 'User Created File_' + new Date().getTime(),
      matches: [],
      content: 'my text',
      gitUrl: null
    }, this.chart, this.getLegendColors(), this.chart.getViewPos().x) as GroupNode

    let fileNodePos = this.chart.getViewPos()
    groupNode.d.isCustom = true
    groupNode.d.isCollpased = false
    groupNode = Utils.deepMerge(groupNode, { color: { border: '#BEBEBE' }, borderWidth: 0 })
    this.chart.setLabel(groupNode, 'My Group')
    this.chart.setNodePosition(groupNode, fileNodePos, false)
    groupNode.d.type = NodeTypes.groupNode


    let boundaryNode = this.chart.createNode(groupNode.id + '_boundary', '', CcItemStyles.boundaryNode)
    this.chart.setNodePosition(boundaryNode, { x: groupNode.x, y: groupNode.y }, false)
    boundaryNode.d.type = NodeTypes.boundaryNode
    boundaryNode.d.belongsToGroup = groupNode.id

    this.addFilesToLegend([groupNode])
    this.chart.addNodesAndLinks([groupNode, boundaryNode])

    this.selectedNode = groupNode
  }

  set markedText(text) {
    text = text.trim()
    this.searchObject.pattern = text
    this.searchObject.originalText = text
    this._markedText = text
  }

  get markedText() {
    return this._markedText
  }

  private doubleClickOnNode(node: IdType, event) {
    // this.chartActions.setPathNode(this.chart.getItem(node));
    this.previousDblClickedNode = this.lastDblClickedNode
    this.lastDblClickedNode = this.chart.getItem(node) as Node
    this.showStylingElement(event.event.center.x, event.event.center.y)
  }

  public showStylingElement(x, y, show = true) {
    if (!show) return
    this.showNodeEditBox = true
    setTimeout(() => {
      let stylePopup = document.getElementById('nodeStylePopup') as HTMLInputElement

      stylePopup.style.left = x - stylePopup.clientWidth + 'px'
      stylePopup.style.top = y + 'px'
    }, 50)
  }

  get selectedNode(): Node | Edge {
    if (!this.chart) return null
    let selectedIds = this.chart.getSelection()
    let selectedNodes = selectedIds.nodes
    let selectedEdges = selectedIds.edges
    if (selectedNodes.length === 1) return this.chart.nodes.get(selectedNodes[0]) as Node
    else {
      if (selectedEdges.length === 1) return this.chart.edges.get(selectedEdges[0]) as Edge
      else return null
    }
  }

  public setChartEvents() {
    this.chart.setClickEvent((eventItem: EventItem) => {
      this.lastRightClickedNode = null
      this.selectedNode = eventItem.item

      if (!this.selectedNode) {
        this.showNodeEditBox = false
        this.setReplaceClickedWithSelection(false)
      }
      if (Options.replaceClickedWithSelection) {
        this.createMatchFromSelection(true)
        document.body.style.cursor = 'auto'
        this.setReplaceClickedWithSelection(false)
      }
    })
    this.chart.setContextEvent((eventItem: EventItem) => {
      console.log('right click', eventItem)
      let myPosition = { x: eventItem.event.offsetX, y: eventItem.event.offsetY }
      let myNodeId = this.chart.chart.getNodeAt(myPosition)
      this.lastRightClickedNode = myNodeId
      this.isRightClickGroup = ChartUtils.isGroupNode(this.chart.getItem(this.lastRightClickedNode) as VisiNode)
      this.isRightClickFile = this.isRightClickGroup ? false : ChartUtils.isFileNode(this.chart.getItem(this.lastRightClickedNode) as VisiNode)
      if (!this.areaSelect.isSelectingArea) setTimeout(() => {
        this.onContextMenu(eventItem.event, null, this.chartMenu)
      }, 0)
    })
    this.chart.setDoubleClickEvent((clickedItem, event) => {
      this.lastRightClickedNode = null
      if (event.nodes.length === 0 && event.edges.length === 0) return
      this.doubleClickOnNode(event.nodes[0], event)
      console.log('dblclick on vla. clicked Id:', event)
      return true
    })
    this.chart.setKeyboardDeleteEvent((e) => {
      if (e.keyCode === 46 || e.keyCode === 8) { // delete button pressed
        this.chartActions.deleteSelected()
      }
    })
    this.chart.setDragStartEvent((eventItem: EventItem) => {
      if (eventItem.item === null) return
      this.isDragging = true
      this.selectionPreDrag = Utils.deepCopy(this.chart.getSelection())
      let extenedSelection = this.chartActions.extendSelection(this.chart.getSelection())
      this.chart.setSelectionNodes(extenedSelection.nodes)
    })
    this.chart.setDragEndEvent((eventItem: EventItem) => {
      this.isDragging = false
      if (eventItem.item === null) return
      if (ChartUtils.isFileNode(eventItem.item)) {
        this.chart.setSelectionNodes([eventItem.id])
      }
      // we need to save the positions on to the nodes, the pos property doesnt get updated. maybe since we`re using 'fixed' option?
      let draggedIds = this.chart.getSelection().nodes
      let newPositions = this.chart.chart.getPositions(draggedIds)
      let items = this.chart.getItems(draggedIds).nodes
      let itemsWithNewPosition = items.map((i, index) => {
        return { node: i, pos: newPositions[i.id] }
      })
      this.chart.setNodesPosition(itemsWithNewPosition, true)

      this.recalulateRectangles = true
      this.chart.setSelection(this.selectionPreDrag)
    })
    this.chart.setOnBeforeDrawEvent((ctx) => {
      /*
            const image = document.getElementById('source');

            image.addEventListener('load', e => {
              ctx.drawImage(image, 33, 71, 104, 124, 21, 20, 87, 104);
            });
      */
      let zoom
      try {
        zoom = this.chart.chart.getScale()
      } catch (e) {
        console.log(e)
      }

      try {
        let selectedNodes = this.chart.getSelection().nodes
        if (!Options.drawFileRect && selectedNodes.length === 0) return
        let nodes: { fileNodes: FileNode[], selectedNodes: Node[] } = { fileNodes: [], selectedNodes: [] }
        this.chart.nodes.get().forEach(node => {
          if (ChartUtils.isFileNode(node) && (!node.hidden) && !ChartUtils.getDontDrawRectangle(node)) nodes.fileNodes.push(node as FileNode)
          if (selectedNodes.indexOf(node.id) !== -1) nodes.selectedNodes.push(node as MatchNode)
        })

        ctx.save()
        let scaleFunc = () => zoom > 1 ? 1 : (5 / (Math.max(5 / (Math.pow(zoom * 3, 2)))))
        if (Options.drawFileRect) nodes.fileNodes.forEach((node: FileNode) => {
          let filePosition = this.chart.getPosition(node.id)

          // assuming a canvas context was set up

          let rect: { rectColor, rectX, rectY, rectW, rectH, boundingRect }
          // box
          try {
            rect = this.chartStyling.getFileRectangle(node, this.chart)
          } catch (ex) {
            console.log(ex)
            return
          }
          const fileRectMinWidth = 3
          const fileRectMaxWidth = 20
          ctx.lineWidth = zoom ? Math.max(scaleFunc(), fileRectMinWidth) : fileRectMinWidth
          ctx.lineWidth = Math.min(ctx.lineWidth, fileRectMaxWidth)
          // ctx.setLineDash([5]);
          const points = ShapePoints.roundedRect(rect.rectX + rect.rectW / 2, rect.rectY + rect.rectH / 2, rect.rectW, rect.rectH, 30)
          ctx.moveTo(points[0], points[1])
          ctx.beginPath()
          for (let i = 2; i < points.length; i += 2) {
            ctx.lineTo(points[i], points[i + 1])
          }
          ctx.closePath()
          ctx.strokeStyle = rect.rectColor + ''
          ctx.stroke()

          // ctx.strokeRect(rect.rectX, rect.rectY, rect.rectW, rect.rectH);
          if (Options.fillFileRect || node.d.isHoverLabel) {
            const gradient = ctx.createLinearGradient(rect.rectX, rect.rectY, rect.rectX + rect.rectW, rect.rectY + rect.rectH)

            gradient.addColorStop(0, 'white')
            gradient.addColorStop(1, (node.color as Color).border)

            ctx.fillStyle = gradient
            ctx.fillRect(rect.rectX, rect.rectY, rect.rectW, rect.rectH)
          }

          if (Options.printFileNames) {
            let fontSize = 70
            ctx.font = `${70}px Arial`
            ctx.fillStyle = 'grey'
            let labelLength = node.label.length * fontSize
            for (let i = 0; i < rect.boundingRect.right - labelLength - 50; i += ChartConsts.FileNameDistance) {
              ctx.fillText(node.label, filePosition.x + i, filePosition.y)
            }
          }
        })

        if (nodes.selectedNodes.length === 1 && !this.isDragging) {
          const selectedNodeToMark = nodes.selectedNodes[0]
          ctx.lineWidth = 10
          ctx.strokeStyle = '#125d98'
          ctx.beginPath()
          ctx.arc(selectedNodeToMark.x, selectedNodeToMark.y, 100 * 1 / zoom, 0, 2 * Math.PI)
          ctx.stroke()
        }

        ctx.restore()
      } catch (ex) {

      }
    })

    this.chart.setBlurNodeEvent((event: any) => {
      let node = this.chart.getItem(event.node) as Node
      if (!node) return
      if (ChartUtils.isMatchNode(node as Node) && !ChartUtils.isWasEdited(node) && !this.Options.showCodeLabels) {
        node.label = ''
        this.chart.nodes.simpleUpdate(node as Node)
      }
    })

    this.chart.setHoverNodeEvent((event: any) => {
      let node = this.chart.getItem(event.node) as Node
      if (!node) return
      if (ChartUtils.isMatchNode(node as Node) && !ChartUtils.isWasEdited(node) && !this.chart.getTitle(node)) {
        node.label = ChartUtils.getMatchCodeLineLabel(node)
        this.chart.nodes.simpleUpdate(node as Node)
      }
    })

    // this.chart.setBlurEdgeEvent((event: any) => {
    //   let edge = this.chart.getItem(event.edge) as Edge
    //   let nodes = this.chart.getItems([edge.to, edge.from]).nodes
    //   let shouldUpdate = false
    //   nodes.forEach(((node: Node) => {
    //     if (ChartStylingUtils.isShowLabelOnHover(node)) {
    //       shouldUpdate = true
    //       node = ChartUtils.setForceShowLabel(node as Node, false)
    //     }
    //   }))
    //   if (shouldUpdate) this.chart.nodes.update(nodes as Node)
    // });

    // this.chart.setHoverEdgeEvent((event: any) => {
    //   let edge = this.chart.getItem(event.edge) as Edge
    //   let nodes = this.chart.getItems([edge.to, edge.from]).nodes
    //   let shouldUpdate = false
    //   nodes.forEach(((node: Node) => {
    //     if (ChartStylingUtils.isShowLabelOnHover(node)) {
    //       shouldUpdate = true
    //       node = ChartUtils.setForceShowLabel(node as Node, true)
    //     }
    //   }))
    //   if (shouldUpdate) this.chart.nodes.update(nodes as Node)
    // });

  }

  public setReplaceClickedWithSelection(value?: boolean) {
    value !== undefined && value !== null ? Options.replaceClickedWithSelection = value : Options.replaceClickedWithSelection = !Options.replaceClickedWithSelection
    if (Options.replaceClickedWithSelection) {
      document.body.style.cursor = 'crosshair'
      this.addMessage('Replacing Node', 'Click on a node to replace with selected text', 3000)
    } else {
      document.body.style.cursor = 'auto'
    }
  }

  ngOnInit(): void {
    this.titleElement = document.getElementById('nodeTitle') as HTMLElement
    this.messageBoxElement = document.getElementById('message_box') as HTMLElement
    let chartElement = document.getElementById('vis_element')

    this.chart.setUp(chartElement)
    this.setChartEvents()
  }

  public onContextMenu($event: MouseEvent, item: any, menuComponent: ContextMenuComponent): void {
    $event.preventDefault()
    $event.stopPropagation()
    setTimeout(() => {
      this.contextMenuService.show.next({
        // Optional - if unspecified, all context menu components will open
        contextMenu: menuComponent,
        event: $event,
        item: item,
      })
    }, 0)
  }


  public codeSelectionChange($event: MouseEvent) {

    if (!this.currentFile) {
      console.log('no file selecetd - for clicking on code')
      return
    }
    let text = this.codeEditor.aceEditor.getSelectedText()
    let anchor = this.codeEditor.aceEditor.selection.getAnchor()
    let cursor = this.codeEditor.aceEditor.selection.getCursor()

    if ($event.ctrlKey) {
      let myRangeHack2 = this.codeEditor.aceEditor.getSelection().getWordRange()
      let selectedWordRange = this.codeEditor.aceEditor.session.getWordRange(0, 0)
      selectedWordRange.start = myRangeHack2['start']
      selectedWordRange.end = myRangeHack2['end']
      let selectedWord = this.codeEditor.aceEditor.getSession().getTextRange(selectedWordRange)
      this.searchObject.pattern = PreSeacrhJsonsUtils.getSearchStringFromText(selectedWord, '\\b__TEXT__\\b')
      this.searchObject.originalText = selectedWord
      this.searchObject.isRegex = true
      this.searchActions.totalSearch()
      this.searchObject.isRegex = false
    }


    if (text === undefined || text === null || text.length === 0) {
      this.searchObject.isRegex = false
      this.chartActions.selectMatchOfLine(anchor.row, this.currentFile.node as Node)
      return
    }


    // console.log(this.codeEditor.aceEditor.getSelectedText())
    if (anchor.row === cursor.row) this.markedText = text
    else this.markedText = ''

    this.onContextMenu($event, null, this.textMenu)
  }

  public addMessage(title: string, message, displayTime) {
    this.messageBoxQueue.push({ title: title, message: message, displayTime: displayTime })
    if(this.messageBoxQueue.length) this.displayNextMessage()
  }

  public displayNextMessage() {
    if (this.messageBoxQueue.length === 0) {
      this.messageBoxElement.style.visibility = 'hidden'
    } else {
      this.messageBoxElement.style.visibility = 'visible'
      if(this.messageBoxQueue[0].displayTime !== -1)
        setTimeout(() => {
          this.messageBoxQueue.shift()
          this.displayNextMessage()
        }, this.messageBoxQueue[0].displayTime)
    }
  }

  public clearChart() {
    this.currentFile = null
    this.chartActions.clearChart()
  }

  public createShape(shape: any) {
    this.setSelectionFromRightNode()
    this.chartActions.createShape(this.chart.getSelection().nodes, shape.name)
  }

  public setSelectionFromRightNode() {
    if (this.lastRightClickedNode) this.chart.setSelection({ nodes: [this.lastRightClickedNode], edges: [] })
    this.lastRightClickedNode = null
  }

  public undo() {
    this.chartActions.undo()
  }

  public linkNodes(linkStyle) {
    let linkedNodesIds = this.chart.getSelection().nodes
    // linkedNodesIds.map(id => this.chart.getItem(id)).forEach(node => this.chartActions.setPathNode(node));
    let linkedToNode = linkedNodesIds.pop()
    let newLinks = []
    linkedNodesIds.forEach(nodeId => {
      newLinks.push(this.chart.createLink(nodeId, linkedToNode, Object.assign(linkStyle, { arrows: { to: true } }), { idPrefix: 'userLink' }))
    })
    this.chartActions.addToChartAndPosition(newLinks)
  }

  public clearVisiIds() {
    this.http.post(Env.getApiEndpoint() + EndPoints.clearVisiIds, { path: this.searchObject.folderPath }).subscribe((response) => {
      console.log('clear visi ids response', response)
    })
  }

  public rewriteVisiIds() {
    this.http.post(Env.getApiEndpoint() + EndPoints.rewriteVisiIds, {}).subscribe((response) => {
      console.log('rewrite visi ids response', response)
    })
  }

  public fullSaveToFile() {
    this.saveLoad.fullSaveToFile(this.currentDiagramDetails)
  }

  public jsonSave() {
    this.saveLoad.saveChartToJson(this.currentDiagramDetails)
  }

  public async dbSave(isNew: boolean = true) {
    let items = this.saveLoad.prepareNodesAndEdgesForSave()
    let nodeLabels = items.nodes.map(i => i.label).filter(i => i)
    let edgeLabels = items.edges.map(i => i.label).filter(i => i)


    let saveInfo = {
      savedDiagramDetails: Utils.deepCopy(this.currentDiagramDetails),
      nodes: items.nodes,
      edges: items.edges,
      filenames: this.filesInLegend.map(i => i.fileLabel),
      labels: nodeLabels.concat(edgeLabels),
    }

    if (!isNew) {
      this.saveLoadService.save(saveInfo, false).subscribe(res => {
        this.addMessage('updated diagram', this.currentDiagramDetails.story, 1000)
        console.log(res)
      }, err => {
        console.log(err)
      })
    } else {
      this.saveLoadService.save(saveInfo).subscribe(res => {
        this.addMessage('saved diagram', this.currentDiagramDetails.story, 1000)
        this.currentDiagramDetails.id = res['id']
      })
    }
  }

  public clear() {
    this.chartActions.clearChart()
    this.resetDiagramDetails()
  }

  public resetDiagramDetails() {
    let dirPath = this.currentDiagramDetails.projects
    this.currentDiagramDetails = { id: -1, projectList: [] }
  }

  clickOnDiagramResult(event) {
    this.loadDiagramById(event.data.id)
  }

  loadDiagramById(id) {
    this.saveLoadService.getById(id).subscribe((diagram: ResultDiagramUI) => {
      if (diagram.data.edges) console.log('load start', diagram.data.edges.length)
      this.saveLoad.loadFromDb(diagram, id)
      this.showDiagramsLoadTable = false
      setTimeout(() => {
        this.fitAllNodesOnScreen()
      }, 2000)
    })
  }

  onLoadTableFilter(event) {
    console.log(event)
  }

  public setPatternRegex() {
    let selectedPattern: SearchOptions = this.patternList[this.selectedSearchPatternIndex]
    if (selectedPattern.regex !== null) {
      this.searchObject.pattern = PreSeacrhJsonsUtils.getSearchStringFromText(this.searchObject.pattern, selectedPattern.regex)
      this.searchObject.isRegex = true
    }
    console.log(selectedPattern)
  }

  pathDropdownClick(event: Event) {
    event.stopPropagation()
  }

  selectPathInDropdown(path: string) {
    this.setSelectedPath(this.paths.find(i=>i.folder === path))
  }

  setSelectedPath(path: CCPath) {
    this.searchObject.folderPath = Utils.deepCopy(path)
    localStorage.setItem(pathStorageKey, path.folder)

    let convertPathToObject = (items: string[], index, currentLeaf: { id, label, data, children }[], id) => {
      let myName = items[index]
      let childIndex = currentLeaf.findIndex(i => i.label === myName)
      const finalItem = index === items.length - 1
      let myChildren
      if (childIndex === -1) {
        if (finalItem) {
          myChildren = Object.assign({ id: id, label: myName, data: myName }, { icon: 'fa-file-code-o' })
          currentLeaf.push(myChildren)
          return id
        } else {
          myChildren = Object.assign({
            id: id,
            label: myName,
            data: myName,
            children: [],
          }, { 'expandedIcon': 'fa-folder-open-o', 'collapsedIcon': 'fa-folder-o' })
          currentLeaf.push(myChildren)
        }
      } else {
        if (finalItem) {
          return id
        } else {
          myChildren = currentLeaf[childIndex]
        }
      }
      convertPathToObject(items, index + 1, myChildren.children, id + 1)
      myChildren.children.sort((i, j) => !i.children ? 1 : -1)
    }

    let convertPathArrayToObject = (paths: string[], object) => {
      this.splitChar = this.searchObject.folderPath.folder.indexOf('/') == -1 ? '\\' : '/'
      for (const path of paths) {
        let lastId = 0
        lastId = convertPathToObject(path.split(this.splitChar), 0, object, lastId)
      }
    }

    this.http.post(Env.getApiEndpoint() + EndPoints.getAllFilesInPath, path).subscribe((res: { files: string[] }) => {
      this.availableFiles = res.files.map((i) => {
        return { fullPath: i, fromSource: i.substring(this.searchObject.folderPath.folder.length, i.length) }
      })
      this.fileTreeNodes = []
      try {
        convertPathArrayToObject(this.availableFiles.map(i => i.fromSource), this.fileTreeNodes)
        this.fileTreeNodes = this.fileTreeNodes.sort((i, j) => !i.children ? 1 : -1)
        this.fileTreeNodes[0].expanded = true
      } catch (ex) {
        console.error('failed to convert file paths to tree object', ex)
      }
      console.log(this.fileTreeNodes)

    })
  }

  public set codeFontSize(fontSize) {
    localStorage.setItem('codeFontSize', fontSize)
  };

  public get fontSize() {
    return localStorage.getItem('codeFontSize')
  }

  public filterAvailableFiles(value) {
    this.openFileSuggestions = this.availableFiles.map(i => i.fromSource)
      .filter(i => i.toLowerCase().indexOf(value.toLowerCase()) !== -1)
      .sort((a, b) => {
        const split = value.split('.')
        if (split.length > 1) {
          const filename = split[split.length - 1]
          if (filename.startsWith(value)) return 1
          else return -1
        } else return 0
      })
  }

  openFile(pathFromSource: any) {
    let selection = Utils.deepCopy(this.chart.getSelection())
    this.chart.chart.setSelection({ nodes: [], edges: [] })
    this.searchActions.doSearch({
      folderPath: this.searchObject.folderPath,
      searchPath: pathFromSource,
      filenamePattern: null,
      isFileNameRegex: false,
      isRegex: false,
      flags: 'gi',
      originalText: '',
      pattern: '',
      title: null,
    }, () => {
      this.chart.setSelection(selection)
    })

  }

  focusOnFileOpenInput() {
    setTimeout(() => {
      this.openfileInput.focusInput()
    }, 0)
  }

  setCustomPath(event: KeyboardEvent) {
    if (event.keyCode == 13) {
      const path = (event.srcElement as HTMLInputElement).value
      this.http.post(Env.getApiEndpoint() + EndPoints.addPath, { path: path }).toPromise().then((res: CCPath) => {
        this.addMessage('Added Path', `added path ${path}`, 3000)
        this.initializeData()
        this.setSelectedPath(res)
      }).catch(ex => {
      })
    }
  }

  selectfileMatches(value, fileResults: FindInFilesResponse) {
    fileResults.selectedByUser = value
    fileResults.matches = fileResults.matches.map(i => {
      i.selectedByUser = value
      return i
    })
  }

  selectMatch(value, match: MatchInfo, fileResults: FindInFilesResponse) {
    match.selectedByUser = value
    if (fileResults.matches.filter(i => i.selectedByUser).length === 0) fileResults.selectedByUser = false
    else fileResults.selectedByUser = true
  }

  loadFindResults() {
    this.findResults.findResults = this.findResults.findResults.map((file) => {
      if (!file.selectedByUser) return null
      file.matches = file.matches.filter(j => j.selectedByUser)
      return file
    }).filter(file => file)

    this.searchActions.loadResults(this.findResults.findResults, this.loadResultsCallback)
  }

  public loadFromFile(event) {
    let file = event.srcElement.files[0]
    let filename = file.name.replace(/\.[^/.]+$/, '')
    this.loadedDiagrams.push(filename)
    this.lastDiagramLoaded = filename
    if (file) {
      let reader = new FileReader()
      reader.readAsText(file, 'UTF-8')
      reader.onload = (evt) => {
        this.saveLoad.loadFromJson(evt)
      }
      reader.onerror = (evt) => {
        console.log('error reading file')
      };
      (document.getElementById('fileLoadInput') as HTMLInputElement).value = ''
    }
  }

  showFindResultsDialog(response: FindInFilesResponse[], callback) {
    this.loadResultsCallback = callback
    this.findResults.findResults = response
    this.setAllMatchesSelected(true)
    this.findResults.totalMatchCount = response.reduce((i, j) => {
      return i + j.matches.length
    }, 0)
    this.allMatchesSelected = true
    this.showFindResults = true
  }

  public showSyncDialog(show) {
    if (!show) {
      this.isShowSyncDialog = false
      return
    }
    this.syncPath = this.searchObject.folderPath
    this.isShowSyncDialog = true
    this.isAllFilesToSyncSelected = true
    let allFiles = this.chart.getAllFileNodes().filter((i: FileNode) => !i.d.isCustom)
    this.syncFilesList = allFiles.map((i) => {
      return {
        node: i as FileNode,
        path: ChartUtils.getFilePath(i),
        isSelected: this.isAllFilesToSyncSelected,
        isExists: false,
      }
    })
    this.checkSyncFilesExist()
  }

  checkSyncFilesExist() {
    let filesExistReq = { dirPath: this.syncPath, filePaths: this.syncFilesList.map(i => i.path) }
    this.http.post(Env.getApiEndpoint() + EndPoints.checkFilesExist, filesExistReq)
      .subscribe((response) => {
        console.log('check files exist', response)
        this.syncFilesList = this.syncFilesList.map((i, index) => {
          i.isExists = response[index].isExists
          if (!i.isExists) i.isSelected = false
          return i
        })
      })
  }

  toggleSelectAllFilesToSync() {
    this.isAllFilesToSyncSelected = !this.isAllFilesToSyncSelected
    this.syncFilesList = this.syncFilesList.map((i) => {
      return { node: i.node, path: i.path, isSelected: this.isAllFilesToSyncSelected, isExists: i.isExists }
    })
  }

  setAllMatchesSelected(isSelected) {
    this.findResults.findResults = this.findResults.findResults.map(i => {
      i.selectedByUser = isSelected
      i.matches = i.matches.map(j => {
        j.selectedByUser = isSelected
        return j
      })
      return i
    })
    this.allMatchesSelected = isSelected

  }

  toggleSelectAllMatches() {
    let newValue = !this.allMatchesSelected
    this.allMatchesSelected = newValue
    this.setAllMatchesSelected(newValue)
  }

  selectSearchResultForDisplay(fileResult: FindInFilesResponse, match: MatchInfo) {
    this.searchResultsCodeEditor.fileData = {
      name: '',
      content: fileResult.content,
      lines: [],
      node: null,
      isCustom: false,
    }
    setTimeout(() => {
      this.searchResultsCodeEditor.scrollToLine(match.lineNumber)
      this.searchResultsCodeEditor.markLinesSelected(match.lineNumber, null)
    }, 100)
  }

  fitAllNodesOnScreen() {
    this.chart.fitToNodes(this.chart.getAllItemIds().nodes, false)
  }

  syncCode() {
    let filesToSync = this.syncFilesList.map((i) => {
      if (i.isSelected) return i.node
    }).filter(i => i)
    this.saveLoad.syncFiles(this.syncPath, filesToSync)
  }

  clearFailedReloaded() {
    this.chartActions.clearFailedReloadNodesIndicators()
  }

  openFileSelectDialog() {
    (document.getElementById('fileLoadInput') as HTMLInputElement).click()
  }

  selectFile($event: any) {
    let pathFromSource = $event.label
    this.selectedFileTreeNodeLabel = pathFromSource
    let parent = $event.parent
    while (parent) {
      pathFromSource = parent.label + this.splitChar + pathFromSource
      parent = parent.parent
    }
    this.selectedFileTreeFullPath = this.searchObject.folderPath + this.splitChar + pathFromSource
  }

  setSelectedSearchPattern(index: number) {
    this.selectedSearchPatternIndex = index
  }

  public set patternList(patternList: SearchOptions[]) {
    this._patternList = patternList
    this.selectedSearchPatternIndex = 0
  }

  public get patternList(): SearchOptions[] {
    return this._patternList
  }

  codeViewerChangedText($event: ChangeTextEvent) {
    if (!this.currentFile || !this.currentFile.node) {
      console.log('no file selectd')
      return
    }
    let curFile = (this.currentFile ? this.currentFile.node : this.chart.getItem((this.selectedNode as MatchNode).d.ofFile).id) as FileNode
    if ($event.text.length === 0 || $event.text === curFile.d.fileContent || !ChartUtils.isCustomNode(curFile)) return

    let action = $event.delta.action
    let updatedNodes: Array<Node> = []
    if ((action === 'insert' || action === 'remove')) {
      // if a single line was added in such a way that the added line would exist after a match node, the refresh algorithm would update the changed match
      // as such we manually increase the end line number by 1 before refreshing
      if ($event.delta.end.row - $event.delta.start.row === 1) {
        let changedAtTipOfMatch
        if (action === 'insert') {
          changedAtTipOfMatch = this.chartActions.getFileNodeMatcheNodes(curFile, false).filter((i: MatchNode) => {
            if ((i.d.lineNumber === $event.delta.start.row && !i.d.endLineNumber) || i.d.endLineNumber === $event.delta.start.row) {
              return true
            } else return false
          }) as MatchNode[]
          if (changedAtTipOfMatch.length > 0) {
            if (changedAtTipOfMatch[0].d.endLineNumber) changedAtTipOfMatch[0].d.endLineNumber += 1
            else changedAtTipOfMatch[0].d.endLineNumber = changedAtTipOfMatch[0].d.lineNumber + 1
          }
        } else {
          changedAtTipOfMatch = this.chartActions.getFileNodeMatcheNodes(curFile, false).filter((i: MatchNode) => {
            if (i.d.endLineNumber === $event.delta.end.row) {
              return true
            } else return false
          }) as MatchNode[]
          if (changedAtTipOfMatch.length > 0) {
            changedAtTipOfMatch[0].d.endLineNumber -= 1
            if (changedAtTipOfMatch[0].d.endLineNumber === changedAtTipOfMatch[0].d.lineNumber) changedAtTipOfMatch[0].d.endLineNumber = null
          }
        }
        this.chart.nodes.update(changedAtTipOfMatch[0])
      }
      updatedNodes = this.chartActions.reloadSingleFileNode(curFile, {
        file: curFile.d.path,
        content: $event.text,
      }, { addFailedReloadToDiagram: false })
      this.chart.addNodesAndLinks(updatedNodes, true)
      this.codeEditor.markMatchesInFile(this.chartActions.getSeletedFileMatchesRows())
      let currNode = this.selectedNode as MatchNode
      if (currNode) {
        this.codeEditor.markLinesSelected(currNode.d.lineNumber, currNode.d.endLineNumber)
      }
    }

    ChartUtils.setFileContent(curFile, $event.text, this.chart)

  }

  copyDiagramLoadLink() {
    let loadURL = new URL(document.location.href) + '?loadDiagramId=' + this.currentDiagramDetails.id
    Utils.copyToClipboard(loadURL)
    window.alert(`copied url ${loadURL} to clipboard`)
  }

  changePathSelectedFiles(prepend: boolean) {
    let changedPath = (document.getElementById('pathUpdateInput') as HTMLInputElement).value
    this.syncFilesList.map((i) => {
      if (!i.isSelected) return i
      let newPath = prepend ? changedPath + i.path : i.path.substring(changedPath.length, i.path.length)
      i.path = newPath
      i.node.d.path = newPath
      this.chart.nodes.update([i.node])
      return i
    })
    this.checkSyncFilesExist()
  }

  deleteDiagram(id) {
    this.saveLoadService.deleteDiagram(id).toPromise().then(res => this.loadDiagramsTable())

  }

  toggleFileHide(fileItem: FileLegendItem) {
    let fileNode = this.chart.getItem(fileItem.fileNodeId)
    this.chartActions.groupUngroupFile(fileNode)
  }

  highlightFileNode(fileItem: FileLegendItem) {
    (this.chart.getItem(fileItem.fileNodeId) as FileNode).d.isHoverLabel = true
    this.chart.redraw()
  }

  unHighlightFileNode(fileItem: FileLegendItem) {
    console.log('out');
    (this.chart.getItem(fileItem.fileNodeId) as FileNode).d.isHoverLabel = false
    this.chart.redraw()
  }

  public getFilerStyle() {
    return { width: this.getFilerWidth(), height: this.getFilerHeight(), 'z-index': this.filerFullscreen ? 1 : 2 }
  }

  public getChartStyle() {
    return { width: this.getChartWidth(), height: this.getChartHeight(), 'z-index': this.chartFullscreen ? 1 : 2 }
  }

  public setFilerFullScreen() {
    this.filerFullscreen = !this.filerFullscreen
    this.chartFullscreen = false
  }

  public setChartFullScreen() {
    this.chartFullscreen = !this.chartFullscreen
    this.filerFullscreen = false
  }

  public collapseExpandGroup() {
    this.setSelectionFromRightNode()
    if ((this.selectedNode as GroupNode).d.isCollpased) this.chartActions.expandGroup(this.selectedNode.id)
    else this.chartActions.collapseGroup(this.selectedNode.id)
  }

  selectAllInGroup() {
    this.setSelectionFromRightNode()
    let containedNodes = this.chartActions.getNodesInGroupBoundaries(this.selectedNode.id, false)
    this.chart.setSelection({
        nodes: containedNodes.map(i => i.id),
        edges: [],
      },
    )
  }

  markNodeForLegend() {
    this.setSelectionFromRightNode()
    let selectedNodeAsVisiNode = (this.selectedNode as VisiNode)
    selectedNodeAsVisiNode.d.markForBottomLabel = !selectedNodeAsVisiNode.d.markForBottomLabel
    this.chart.nodes.update([selectedNodeAsVisiNode])
    this.clearLegend()
    console.log(this.chart.getAllFileNodes())
    this.addFilesToLegend(this.chart.getAllFileNodes())

  }
}

