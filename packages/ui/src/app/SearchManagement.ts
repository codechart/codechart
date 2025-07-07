import { AppComponent, ProjectPath, pathStorageKey } from './app.component'
import { EndPoints, SearchObject } from './types.nodejs'
import { StartSearchJson } from './chart/jsons'
import { Env } from './utils/Env'
import { Utils } from "./chart/Utils";
import { HttpClient } from "@angular/common/http";
import { IdeConnect } from './IDE/IdeConnect'

export class SearchManagement {
  ideConnect: IdeConnect;
  http: HttpClient;
  splitChar: string = null;
  private _projectPaths: ProjectPath[] = []
  private _searchJson: SearchObject = StartSearchJson

  constructor(private app: AppComponent) {
    this.searchObject = StartSearchJson
    this._searchJson.isRegex = false
  }

  public initialize() {
    this.http = this.app.http
    this.ideConnect = this.app.ideConnect
  }

  public set searchObject(value: SearchObject) {
    this._searchJson = value
  }

  public get searchObject(): SearchObject {
    return this._searchJson
  }

  /*
    some lines I'm adding here
  */
  setPaths(paths: ProjectPath[], selectedPath: string) {
    if (paths.length === 0) return
    let storedPath: string = localStorage.getItem(pathStorageKey)
    paths.sort((i, j) => {
      if (i.localPath === storedPath) return -1; else return 0
    })
    this._projectPaths = paths
    this.app.dropdownPaths = paths.map((i) => { return { label: i.label, value: i.localPath } })
    if (!selectedPath) {
      this.setSelectedPath(this._projectPaths[0])
    } else {
      this.setSelectedPath(this._projectPaths.find(i => i.localPath === selectedPath))
    }
  }

  setSelectedProject(pathOrGitUrl: string) {
    this.setSelectedPath(this._projectPaths.find(i => i.localPath === pathOrGitUrl || i.gitUrl === pathOrGitUrl))
  }

  getSelectedProject(): ProjectPath {
    return this.searchObject.projectPath
  }

  setSelectedPath(path: ProjectPath) {
    if (!path || !path.localPath) {
      console.error('set sleected path, path was undefined', path)
      return
    }

    this.searchObject.projectPath = Utils.deepCopy(path)
    localStorage.setItem(pathStorageKey, path.localPath)

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
      this.splitChar = paths[0].indexOf('/') == -1 ? '\\' : '/'
      for (const path of paths) {
        let lastId = 0
        lastId = convertPathToObject(path.split(this.splitChar), 0, object, lastId)
      }
    }

    this.http.post(Env.getApiEndpoint() + EndPoints.getAllFilesInPath, path).subscribe((res: { files: string[] }) => {
      const removePath = (filePath, basePath) => {
        // Normalize paths by removing ./ or / prefix and trailing slashes
        const normalizedBase = basePath.replace(/^\.\/|^\//, '').replace(/\/$/, '');
        const normalizedFile = filePath.replace(/^\.\/|^\//, '');

        // Remove base path if file starts with it
        return normalizedFile.startsWith(normalizedBase) ? normalizedFile.substring(normalizedBase.length) : normalizedFile
      }
      this.app.availableFiles = res.files.map((i) => {
        return {
          fullPath: i,
          fromSource: removePath(i, this.searchObject.projectPath.localPath)
        }
      })
      this.app.fileTreeNodes = []
      try {
        convertPathArrayToObject(this.app.availableFiles.map(i => i.fromSource), this.app.fileTreeNodes)
        this.app.fileTreeNodes = this.app.fileTreeNodes.sort((i, j) => !i.children ? 1 : -1)
        this.app.fileTreeNodes[0].expanded = true
      } catch (ex) {
        console.error('failed to convert file paths to tree object', ex)

      }
      console.log('tree objects', this.app.fileTreeNodes)

    })
  }

  public get projectPaths(): ProjectPath[] {
    return this._projectPaths
  }

  public getPathByGitUrl(gitUrl: string) {
    return this.projectPaths.find(projectPath => projectPath.gitUrl === gitUrl)
  }

  setProjectPath(path, index): Promise<ProjectPath> {
    return new Promise((resolve, reject) => {
      let onFail = (ex) => {
        const errorMessage = ex.error.message
        this.app.addMessage("Failed adding path, is the path valid?", ` path: ${path}; error: ${errorMessage}`, -1)
        console.error(errorMessage)
        reject()
      }
      if (index === -1) {
        this.http.post(Env.getApiEndpoint() + EndPoints.addPath, { path: path }).toPromise()
          .then((res: ProjectPath) => {
            this.app.initializeData()
            this.setSelectedPath(res)
            if (this.app.addFileInput) this.app.addFileInput.nativeElement.value = ''
            console.log('setProjectPath', path)
            resolve(res)
          }).catch(ex => { onFail(ex) })
      } else {
        if (path === "") this.projectPaths.splice(index, 1)
        else this.projectPaths[index].localPath = path
        this.http.post(Env.getApiEndpoint() + EndPoints.setPaths, { paths: this.projectPaths }).toPromise().then((res: ProjectPath[]) => {
          this.setPaths(res, path)
          this.app.addFileInput.value = ''
          console.log('setProjectPath', path)
          resolve(res)
        }).catch(ex => { onFail(ex) })
      }
    })
  }


}
