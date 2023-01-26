import { AppComponent, CCPath, pathStorageKey } from './app.component'
import { EndPoints, SearchObject } from './types.nodejs'
import { StartSearchJson } from './chart/jsons'
import { Env } from './utils/Env'
import { Utils } from "./chart/Utils";
import { HttpClient } from "@angular/common/http";

export class SearchManagement {
  http: HttpClient;
  splitChar: string = null;
  private _projectPaths: CCPath[] = []
  private _searchJson: SearchObject = StartSearchJson

  constructor(private app: AppComponent) {
    this.searchObject = StartSearchJson
    this._searchJson.isRegex = false
    this.http = this.app.http
  }

  public set searchObject(value: SearchObject) {
    this._searchJson = value
  }

  public get searchObject(): SearchObject {
    return this._searchJson
  }

  setPaths(paths: CCPath[], selectedPath: string) {
    let storedPath: string = localStorage.getItem(pathStorageKey)
    paths.sort((i, j) => {
      if (i.folder === storedPath) return -1; else return 0
    })
    this._projectPaths = paths
    this.app.dropdownPaths = paths.map((i)=>{return {label: i.label, value: i.folder}})
    if(!selectedPath) {
      this.setSelectedPath(this._projectPaths[0])
    }
    else {
      this.setSelectedPath(this._projectPaths.find(i=>i.folder===selectedPath))
    }

    if (paths.find(i => !i.gitUrl)) this.app.addMessage('Some project folders are not git repos', 'Some of the project folders are not aligned with git repos. To align your folders use the edit nutton next to the project drow-down', -1)
  }

  setSelectedProject(path: string) {
    this.setSelectedPath(this._projectPaths.find(i=>i.folder === path))
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
      this.app.availableFiles = res.files.map((i) => {
        return { fullPath: i, fromSource: i.substring(this.searchObject.folderPath.folder.length, i.length) }
      })
      this.app.fileTreeNodes = []
      try {
        convertPathArrayToObject(this.app.availableFiles.map(i => i.fromSource), this.app.fileTreeNodes)
        this.app.fileTreeNodes = this.app.fileTreeNodes.sort((i, j) => !i.children ? 1 : -1)
        this.app.fileTreeNodes[0].expanded = true
      } catch (ex) {
        console.error('failed to convert file paths to tree object', ex)
      }
      console.log(this.app.fileTreeNodes)

    })
  }

  public get projectPaths(): CCPath[] {
    return this._projectPaths
  }

  public getPathByGitUrl(gitUrl: string) {
    return this.projectPaths.find(projectPath=>projectPath.gitUrl===gitUrl)
  }

}
