import { ChartActions, PositioningOptions } from './chart.actions';
import { AttributesKey, ChartUtils } from './chart.utils';
import { ChartWrapper } from './chart.wrapper';
import { CreateUtils } from './create.utils';
import { AppComponent, ProjectPath } from '../app.component'
import { Color, Edge, Node } from 'vis';
import {
  CreateTypes,
  EndPoints,
  FindInFilesResponse,
  MatchInfo,
  ReloadRequest,
  SaveJson,
  SaveNode,
  SaveNodesResponse,
  FileNode, ReloadFilesResponse, SaveToCodeRequest, FindInFilesResponseUI,
} from '../types.nodejs'
import { HttpClient } from '@angular/common/http';
import { ChartConsts, CcItemStyles } from './chart.consts';
import { RelativeTimeFuturePastVal } from 'moment';
import { Utils } from './Utils';
import { CreateDiagramDto, QueryDto, ResultDiagramUI } from '../services/SaveLoadService';
import { RouteConfigLoadEnd } from '@angular/router';
import { Env } from '../utils/Env';
import { Observable } from 'rxjs/Observable'
import { forkJoin } from "rxjs/observable/forkJoin";
import { SearchManagement } from '../SearchManagement'
import { IdeConnect } from '../IDE/IdeConnect'
import { catchError } from 'rxjs/operators'
import { of } from "rxjs/observable/of";

interface DownloadInterface { info: QueryDto, dirPath, positioning, nodes, edges }

export class SaveLoad {
  ideConnect: IdeConnect;
  searchManagment: SearchManagement;
  private chart: ChartWrapper;
  private chartActions: ChartActions;

  constructor(private app: AppComponent, public http: HttpClient) {
  }

  initialize() {
    this.chart = this.app.chart;
    this.chartActions = this.app.chartActions;
    this.searchManagment = this.app.searchManagement
    this.ideConnect = this.app.ideConnect
  }

  public loadDataFromFindInFiles(response: FindInFilesResponseUI[]) {
    let matchCount = response.reduce((soFar, item) => soFar + item.matches.length ? /*matches in file*/ item.matches.length : /*file*/ 1, 0)
    if(!this.ideConnect.getIsInIde() && !response.length) this.app.addMessage('No Results', 'found no results', 2000)
    console.log('find in files response', response)
    let addedNodesAndLinks = []
    this.chart.addToHistory(true)
    let fileColors = this.app.getLegendColors()
    response.forEach((file: FindInFilesResponseUI) => {
      // checkForFileNode
      let fileNode = this.chartActions.getFileNodeByPath(file.fileId)
      if(!fileNode) {
        fileNode = CreateUtils.createFileNode(file, this.chart, fileColors,
          this.app.selectedNode ? ((this.app.selectedNode as Node).x - 300) : this.chart.getViewPos().x,
          this.searchManagment.searchObject.projectPath);
        fileColors.push((fileNode.color as Color).border)
      }
      addedNodesAndLinks.push(fileNode);

      file.matches.forEach((match: MatchInfo) => {
        let matchNodes = CreateUtils.createOrUpdateMatchNode(match, fileNode.d.fileId, this.chart, this.app.selectedNode as Node, this.searchManagment.getSelectedProject());
        addedNodesAndLinks = addedNodesAndLinks.concat(matchNodes);
      });
    });

    this.chartActions.addToChartAndPosition(addedNodesAndLinks);
    this.app.clearFindResults();
    // setTimeout(()=>{
    //   let matchNodes = addedNodesAndLinks.filter(i=>ChartUtils.isMatchNode(i)).map(i=>i.id)
    //   this.chart.fitToNodes(matchNodes)
    // }, 1000)

  }

  // convert
  public syncFiles(fileNodes: FileNode[], showMessage = true): Promise<any> {
    console.log('syncing files', fileNodes)
    return new Promise((resolve, reject) => {
      interface PathsToFiles { [gitUrls: string]: { dirPath: string, filePaths: string[] } }

      // map available gitUrls to folder and filepaths array
      const pathsToFiles: PathsToFiles = fileNodes.reduce((map:PathsToFiles, fileNode:FileNode) => {
        if(!map[fileNode.d.fileId.gitUrl]) {
          const projectPath = this.searchManagment.getPathByGitUrl(fileNode.d.fileId.gitUrl)
          map[fileNode.d.fileId.gitUrl] = {
            filePaths: [ChartUtils.getFilePath(fileNode)],
            dirPath:  projectPath ? projectPath.localPath : null
          }
        } else {
          map[fileNode.d.fileId.gitUrl].filePaths.push(ChartUtils.getFilePath(fileNode))
        }
        return map
      }, {})

      // create reload requests array
      const reloadRequests: Observable<ReloadRequest>[] = []
      for(let property of Object.keys(pathsToFiles)) {
        const reloadBody: ReloadRequest = {
          matches: [],
          filePaths: pathsToFiles[property].filePaths,
          dirPath: pathsToFiles[property].dirPath,
          gitUrl: property,
        }
        reloadRequests.push(this.http.post(Env.getApiEndpoint() + EndPoints.reloadFiles, reloadBody))
      }

      if(reloadRequests.length===0) resolve()

      forkJoin(reloadRequests).pipe(catchError((error) => {reject(error); return of(error)})).subscribe((responseList: any[]) => {
        this.app.selectedNode = null;
        const reloadedFiles: ReloadFilesResponse[] = responseList.reduce((i: ReloadFilesResponse[], j:{ files: ReloadFilesResponse[] }) => {
          return i.concat(j.files)
        }, [])
        this.chartActions.reloadAllFileNodes(reloadedFiles, { markNullFiles: false })
        if(showMessage) this.app.addMessage(`Finished synching`, '', 3000)
        resolve()
      })
    })
  }

  public saveChartToJson(diagramData: QueryDto) {
    let savedData = this.prepareNodesAndEdgesForSave()
    let jsonContent: DownloadInterface = { info: diagramData, nodes: savedData.nodes, edges: savedData.edges, dirPath: this.searchManagment.searchObject.searchPath, positioning: this.app.Options.positioning };
    this.saveJsonToFile(jsonContent, diagramData.story)
  }

  public prepareNodesAndEdgesForSave(): { nodes, edges } {
    let setNodesForSave = (item: Node) => {
      if (item.icon && item.icon.code) {
        item.icon.code = "//" + item.icon.code
      }
      let itemPos = this.chart.getPosition(item.id);
      if (!itemPos) return item as Node
      item.x = itemPos.x
      item.y = itemPos.y
      return item
    }

    let jsonSavedEdges = ChartUtils.removeOrphanEdges(this.chart.edges.get(), this.chart);

    let jsonSavedNodes = this.chart.nodes.get().map((node: Node) => {
      this.chart.setNodePosition(node, this.chart.getPosition(node.id))
      return setNodesForSave(node);
    });
    return {
      nodes: jsonSavedNodes,
      edges: jsonSavedEdges
    }
  }

  public loadFromJson(jsonEvt) {
    // remove illegal chars from json. these can appear in content of saved files
    let parsed = null
    let result = jsonEvt.target['result'].trim()
    let lastException = null
    let reparseTries = 0
    let retry = true
    let badPos = 0

    while (retry && reparseTries < 1000) {
      try {
        console.log(result.substring(badPos - 15, badPos + 15))
        parsed = JSON.parse(result)
        retry = false
      } catch (ex) {
        if (ex.message.match(/at position \d+/) && ex.message.match(/\d+/)) {
          badPos = parseInt(ex.message.match(/\d+/)[0])
          result = result.slice(0, badPos) + result.slice(badPos + 1)
          retry = true
          reparseTries++
        } else {
          retry = false
        }
        lastException = ex
      }
    }
    if (parsed === null) {
      console.error('failed loading json', lastException)
      return
    }

    // new format
    let loaded: { nodes, edges, dirPath, positioning } = { nodes: [], edges: [], dirPath: '', positioning: '' }

    if (parsed.info) {
      this.app.currentDiagramDetails.story = parsed.info.story
    }
    loaded.dirPath = parsed.dirPath
    Utils.addIfNotExist(this.app.currentDiagramDetails.projectList, parsed.dirPath)
    // old format
    loaded.nodes = parsed.nodes
    loaded.edges = parsed.edges
    if (loaded.positioning) {
      this.app.Options.positioning = loaded.positioning
    } else {
      this.app.Options.positioning = PositioningOptions.DOWN
    }
    this.searchManagment.searchObject.projectPath = loaded.dirPath
    this.load({ nodes: loaded.nodes, edges: loaded.edges });
  }


  public loadFromDb(diagram: ResultDiagramUI, id: number) {
    if (diagram.data.edges) console.log('load 2', diagram.data.edges.length)
    else console.log('wtf')
    this.load({ nodes: diagram.data.nodes, edges: diagram.data.edges });
    delete diagram['data']
    this.app.currentDiagramDetails = Object.assign({ projectList: [] }, diagram)
  }

  public saveToCode(files: { name, content }[]) {
    const ccPath = this.searchManagment.searchObject.projectPath
    let filesReq: SaveToCodeRequest = {
      dirPath: ccPath.localPath,
      gitUrl: this.searchManagment.getSelectedProject().gitUrl,
      files: files.map(i => {
        let filePath = i.name
        if(Utils.comparePaths(filePath, ccPath.localPath) !== -1) filePath = filePath.substring(ccPath.localPath.length)
        return { file: filePath, content: i.content }
      })
    }
    this.http.post(Env.getApiEndpoint() + EndPoints.saveToCode, filesReq).subscribe((response: { files: ReloadFilesResponse[] }) => {
      if(response.files.length===0) {
        this.app.addMessage('No files received', 'No files received', 5000)
      }
      let errorFiles = response.files.filter(i => i.error)
      let reloadFiles = response.files.filter(i => !i.error)
      let title, message
      if(errorFiles.length === response.files.length) {
        title= "Failed saving to file"
        message = errorFiles[0].error
      } else {
        title = "Finished saving"
        if(reloadFiles.length > 0) message = `Succeded saving ${reloadFiles.length} files`
        if(errorFiles.length > 0) message += `; Failed saving ${errorFiles.length} files. ${errorFiles[0].error}`
      }
      this.app.addMessage(title, message, 5000)
      this.chartActions.reloadAllFileNodes(response.files, { markNullFiles: false })
    });
  }


  public testAgentIsUp(): Promise<boolean> {
    return this.http.get(Env.getApiEndpoint() + EndPoints.isUp).toPromise()
  }


  public load(loaded: { nodes: Node[], edges: Edge[] }) {
    if (!this.app.Options.keepChartOnLoadFromJson) this.chartActions.clearChart();
    if (loaded.edges) console.log('load start3', loaded.edges.length)
    else console.log('wtf')

    loaded.nodes = loaded.nodes.map((node: Node) => {
      try {
        if (ChartUtils.isMatchNode(node)) {
          let sameNode = ChartUtils.getSameMatch(this.chart, ChartUtils.getMatchAttributes(node), ChartUtils.getOfFileId(node))
          if (sameNode) {
            loaded.edges.push(this.chart.createLink(node.id, sameNode.id, CcItemStyles.suspectedSameMatchLink, { idPrefix: "sameMatch" }))
          }
        }
      } catch (err) {
        console.log('error in node', node)
      }
      return node
    })

    console.log('loading nodes', loaded.nodes);
    this.chart.simpleLoadFromJson(loaded, {
      fitToAll: true,
      selectLoaded: this.chart.nodes.length > 0 && this.app.Options.keepChartOnLoadFromJson,
      styleOnLoad: ChartConsts.styleAfterLoad
    });
    // setTimeout(()=>{this.chart.fitToNodes(loaded.nodes.map(i=>i.id))}, 0)
  }

  public saveJsonToFile(jsonObject, filename: string) {
    let encode = (s) => {
      const out = [];
      for (let i = 0; i < s.length; i++) {
        out[i] = s.charCodeAt(i);
      }
      return new Uint8Array(out);
    }

    let data = encode(JSON.stringify(jsonObject, null, 4));

    let blob = new Blob([data], {
      type: 'application/octet-stream'
    });

    let url = URL.createObjectURL(blob);
    let link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.json`);

    let event = document.createEvent('MouseEvents');
    event.initMouseEvent('click', true, true, window, 1, 0, 0, 0, 0, false, false, false, false, 0, null);
    link.dispatchEvent(event);
  }
}
