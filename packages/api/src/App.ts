/* this needs to be identical in nodeJS and Angular */
enum SearchEnum { searchInFolder, searchInFile, getLinesFromFile, openFile }
export interface SaveJson {
  nodes: SaveNode[]
}
export interface SaveNode {
  lineNumber: number
  filePath: string
  id: string
}
export interface MatchInfo {
  line: string
  value: string
  lineNumber: number
  endContentLine: number
  indexInLine: number
  id: string
  isRegex: boolean
  flags: string
  ofFile: string
}
export interface FindInFilesResponse {
  file: string
  content: string
  matches: MatchInfo[]
}
export interface SaveNodesResponse {
  savedId: string
  exisitingId: string
}
export interface SearchJson {
  title: string
  pattern: string
  flags: string
  folderPath: CCPath
  searchPath: string
  filenamePattern: string
  isRegex: boolean
  isFileNameRegex: boolean,
  lineNumbers: number[],
  searchType: SearchEnum
}
export interface ReloadRequest {
  matches: MatchInfo[]
  dirPath: string
  filePaths: string[]
  gitUrl: string
}
export interface SaveToCodeRequest {
  dirPath: string
  files: { file: string; content: string }[]
}
export interface ReloadFilesResponse {
  file: string
  content: string
  error: string
}
interface CCPath {
  label: string, folder: string, gitUrl: string
}


export const VISI_PREFIX = "Visi->"
export const VISI_SUFFIX = "<-Visi"
export const VISI_SEPARATOR = "<->"
export const RepoType = {
  local: 'local',
  remote: 'remote',
  git: 'git'
}

export const EndPoints = {
  loadFolderToDb: "/loadFolderToDb",
  find: "/find",
  saveToCode_VisiIds:
    "/saveToCode_VisiIds" /*Visi->0bd86d689212220c4c3e6df05e37b658<-Visi*/,
  saveToCode: "/saveToCode",
  loadFromCode: "/loadFromCode",
  clearVisiIds: "/clearVisiIds",
  rewriteVisiIds: "/rewriteVisiIds",
  getPaths: "/getPaths",
  getLanguageRexges: "/getLanguages",
  getAllFilesInDirectory: "/getAllFilesInDirectory",
  reloadFiles: "/reloadFiles",
  checkFilesExist: "/checkFileExist",
  isUp: '/isUp',
  createDiagram: '/diagrams/create',
  updateDiagram: '/diagrams/update',
  diagramById: "/diagrams/:id",
  diagramSearch: "/diagrams/search/",
  deleteDiagramById: "/diagrams/delete/:id",
  deleteAllDiagrams: "/diagrams/deleteAll",
  approveLicense: "/approveLicense",
  addPath: "/addPath",
  setPaths: "/setPaths"
}
import * as Path from "path"
// import { ChartUtils } from "../../../codechart-ui/src/app/chart/chart.utils"

const ConfigPaths = {
  folder: Path.normalize("./config"),
  paths: Path.normalize("./config/paths.json"),
  languages: Path.normalize("./config/languages.json"),
  config: Path.normalize("./config/config.json"),
}

/******** */
export interface SavedVisiId {
  visiId: string
  line: number
} //{'filepath': SavedVisiIds[]}

import * as express from "express"
import { Config } from "./config"
import { isUndefined } from "util"
import LocalRepo from "./LocalRepo"
import SaveWrapper, { CreateDiagramDto } from "./SaveWrapper"
import axios from "axios"
import macaddress = require("macaddress")
import { config } from "npm"
import { Utils } from "./Utils"
import e = require("express")
var cors = require('cors')
import open = require("open")
import GitRepo from "./GitRepo"

let md5 = require("md5")

const os = require("os")

class App {
  public Path = require("path")
  public fs = require("fs")

  public saveWrapperInstance: SaveWrapper

  public express

  public allowedFileExtensions: string[]
  public configFile: Config

  public macAddress

  private archiveRepo

  constructor() {
    this.express = express()
    this.express.use(cors())

    macaddress.one().then((i) => {
      this.macAddress = require('md5')(i)
      this.auditActions('initiated_api')
    })

    for (let key in ConfigPaths) {
      let path = this.Path.normalize(ConfigPaths[key])
      if (!this.fs.existsSync(path)) {
        console.error(
          `Config ${key === "folder" ? "folder" : "file"} '${this.Path.join(
            process.cwd(),
            path
          )}' not found.`
        )
        console.error(
          `The config folder should reside in same folder where runnable file is`
        )
        process.exit()
      }
    }

    this.configFile = Object.assign({
      path: '',
      allowedFileExtensions: [],
      forbiddenFiles: [],
      allowedFolders: [],
      forbiddenFolders: [],
      remarks: {}
    }, JSON.parse(Utils.readFileSync(ConfigPaths.config)))

    console.log("config file", this.configFile)
    this.archiveRepo = this.configFile.repo

    if (this.archiveRepo === RepoType.local || !this.configFile.repo) {
      this.saveWrapperInstance = new LocalRepo()
    } else if (this.archiveRepo === RepoType.git) {
      if (!this.configFile.gitRemoteUrl) {
        throw new Error('gitRemoteUrl must be set if "repo" is "git"!')
      }
      this.saveWrapperInstance = new GitRepo(this.configFile.gitRemoteUrl)
    }


    this.allowedFileExtensions = this.configFile.allowedFileExtensions
    this.express.use((req, res, next) => {
      res.setHeader("Access-Control-Allow-Origin", "*")
      res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
      res.header("Access-Control-Allow-Headers", "*")
      res.header("Access-Control-Allow-Credentials", true)

      if (req.method === "OPTIONS") {
        res.end()
        return
      }

      next()
    })

    this.mountRoutes()
    // console.log(this.getContentOfFunction(this.debugText, 0))
  }

  private auditActions(action: string) {
    if (this.configFile.auditNotEnabled) {
      console.log('skipping audit')
      return
    }
    axios.post(
      "https://license.code-chart.com/api/v1/audit",
      { macAddress: this.macAddress, action: action }
    ).then((res) => {
    }).catch(e => console.error(e))
  }

  private mountRoutes(): void {


    let bodyParser = require("body-parser")
    //noinspection TypeScriptUnresolvedFunction
    const router = express.Router()

    let folderKeys = ["folder", "dirPath"]

    router.use(express.static(Path.join(__dirname, "../public")))
    const asyncHandler = require("express-async-handler")

    const proxy = require('express-http-proxy');
    if (this.archiveRepo === RepoType.remote) {
      router.all('/diagrams/*', (req, res, next) => {
        console.log(`fetch diagrams from ${this.configFile.archiveUrl}`)
        req.url = "/diagramsProxy" + req.url
        next()
        return
      })
      router.all('/diagramsProxy/*', proxy(this.configFile.archiveUrl, {
        proxyReqPathResolver: (req, res) => {
          return req.originalUrl
        },
        https: this.configFile.archiveUrl.startsWith('https') ? true : false,
        timeout: 2000
      }))
    } else {
      router.all('/diagrams/*', (req, res, next) => {
        next()
      })

    }


    router.use(bodyParser.urlencoded({ limit: "3000kb", extended: true }))
    router.use(bodyParser.json({ limit: "3000kb" }))
    router.use((req, res, next) => {
      console.log(req.originalUrl, req.body)
      folderKeys.forEach((i) => {
        if (req.body[i]) {
          let originalPath = req.body[i]
          try {
            req.body[i] = this.Path.normalize(req.body[i])
          } catch (ex) {
            console.log(`failed normalizing path ${req.body[i]}`)
            req.body[i] = originalPath
          }
        }
      })
      next()
    })
    router.post(EndPoints.loadFolderToDb, (req, res, next) => {
      this.loadFolderToDb(req.body.folderPath)
      this.sendSuccessResponse(res, { loaded: true })
    })

    router.post(EndPoints.find, (req, res) => {
      this.auditActions('find')
      let body: SearchJson = req.body
      this.findInFiles(
        res,
        body.pattern,
        body.flags,
        body.folderPath.folder,
        body.searchPath,
        body.filenamePattern,
        body.isRegex,
        body.isFileNameRegex,
        body.lineNumbers,
        body.searchType
      )
    })
    router.post(EndPoints.saveToCode_VisiIds, (req, res) => {
      /*Visi->8d012c76a6b3ea1eae598fbf1851435f<-Visi*/
      console.log(EndPoints.saveToCode_VisiIds, req.body)
      this.saveToCode(
        res,
        req.body.nodes,
        req.body.dirPath
      ) /*Visi->ba3b07bea3f84987a6916251daccb65f<-Visi*/
    })
    router.post(EndPoints.loadFromCode, (req, res) => {
      console.log(EndPoints.loadFromCode, req.body)
      this.loadFromCode(req, res)
    })
    router.post(EndPoints.clearVisiIds, (req, res) => {
      console.log(EndPoints.clearVisiIds, req.body)
      this.clearVisiIds(res, req.body)
    })
    router.post(EndPoints.rewriteVisiIds, (req, res) => {
      console.log(EndPoints.rewriteVisiIds, req.body)
      this.rewriteVisiIds(res)
    })
    router.post(EndPoints.createDiagram, asyncHandler(async (req, res, next) => {
      console.log(EndPoints.createDiagram, req.body)
      await this.createDiagram(req, res)
    })
    )
    router.post(EndPoints.updateDiagram, asyncHandler(async (req, res, next) => {
      console.log(EndPoints.updateDiagram, req.body)
      await this.updateDiagram(req, res)
    })
    )
    router.post(EndPoints.approveLicense, asyncHandler(async (req, res, next) => {
      console.log(EndPoints.approveLicense, req.body)
      await this.approveLicense(req, res)
    })
    )
    router.get(EndPoints.diagramById, asyncHandler(async (req, res, next) => {
      console.log(EndPoints.diagramById)
      await this.getDiagram(req, res)
    })
    )
    router.post(EndPoints.diagramSearch, asyncHandler(async (req, res, next) => {
      console.log(EndPoints.diagramSearch, req.body)
      await this.getDiagramsByText(req, res)
    })
    )
    router.post(EndPoints.deleteDiagramById, asyncHandler(async (req, res, next) => {
      console.log(EndPoints.deleteDiagramById, req.body)
      await this.deleteDiagram(req, res)
    })
    )
    router.post(EndPoints.deleteAllDiagrams, asyncHandler(async (req, res, next) => {
      console.log(EndPoints.deleteAllDiagrams, req.body)
      await this.deleteAllDiagrams(req, res)
    })
    )
    router.get(EndPoints.getPaths, (req, res, next) => {
      this.auditActions('get_paths')
      this.sendSuccessResponse(res, { paths: this.getPathsFromConfig() })
    })
    router.get(EndPoints.getLanguageRexges, (req, res) => {
      let languages = JSON.parse(Utils.readFileSync(ConfigPaths.languages))
      let common = languages.filter(i => i.language === "common")
      if (common.length > 0) languages = languages.map((i) => {
        i.searchOptions = i.searchOptions.concat(common[0].searchOptions)
        return i
      })
      this.sendSuccessResponse(res, languages)
    })
    router.get(EndPoints.isUp, (req, res) => {
      console.log('testing agent is up')
      this.sendSuccessResponse(res, true)
    })
    router.post(EndPoints.getAllFilesInDirectory, (req, res) => {
      // List all files in a directory in Node.js recursively in a synchronous fashion
      let allFiles = []
      this.processDir(req.body.folder, (fullPath) => {
        allFiles.push(fullPath)
      })
      this.sendSuccessResponse(res, { files: allFiles })
    })
    router.post(EndPoints.checkFilesExist, (req: { body: { dirPath: CCPath, filePaths: string[] } }, res) => {
      req.body.filePaths.forEach((i) => {
        console.log('check exists', Path.join(req.body.dirPath.folder, i))
      })

      let response: { path, isExists }[] = req.body.filePaths.map((i) => {
        return {
          path: i,
          isExists: this.fs.existsSync(Path.join(req.body.dirPath.folder, i))
        }
      })
      this.sendSuccessResponse(res, response)
    })
    router.post(EndPoints.reloadFiles, (req: { body: ReloadRequest }, res) => {
      let response: { files: ReloadFilesResponse[] } = { files: [] }
      if (!this.fs.existsSync(req.body.dirPath)) {
        this.sendSuccessResponse(res, response)
        return
      }

      req.body.filePaths.forEach((i) => {
        try {
          let fileText = this.readFile(this.Path.join(req.body.dirPath, i))
          response.files.push({ file: i, content: fileText, error: null })
        } catch (ex) {
          response.files.push({ file: "" + i, content: "", error: null })
        }
      })
      this.sendSuccessResponse(res, response)
    })
    router.post(EndPoints.saveToCode, (req: { body: SaveToCodeRequest }, res) => {
      let response: { files: ReloadFilesResponse[] } = { files: [] }
      req.body.files.forEach((i) => {
        try {
          let filePath = this.Path.join(req.body.dirPath, i.file)
          let normalizedFileContent = i.content
            .replace("/\n/", "\r\n")
            .replace("\r\n", os.EOL)
          if (!this.fs.existsSync(filePath)) throw new Error("File " + filePath + " does not exist")
          this.fs.writeFileSync(filePath, normalizedFileContent)
          response.files.push({
            file: i.file,
            content: normalizedFileContent,
            error: null
          })
        } catch (ex) {
          console.error(ex)
          response.files.push({ file: "" + i.file, content: "", error: ex.message })
        }
      })
      this.sendSuccessResponse(res, response)
    }
    )
    router.post(EndPoints.addPath, (req: { body: { path: string } }, res) => {
      const addedPath = req.body.path
      if (!this.fs.existsSync(addedPath)) {
        throw new Error(`${addedPath} does not exist`)
      }
      let paths = this.getPathsFromConfig()
      let samePath = paths.find((i) => this.Path.normalize(i.folder).toLowerCase() === this.Path.normalize(addedPath).toLowerCase())
      if (samePath) {
        this.sendSuccessResponse(res, samePath)
        return
      }
      let pathObject = this.getPathObject(addedPath)
      paths.push(pathObject)
      this.fs.writeFileSync(ConfigPaths.paths, JSON.stringify(paths, null, '\t'), { flag: 'w' })
      this.sendSuccessResponse(res, pathObject)
    })
    router.post(EndPoints.setPaths, (req: { body: { paths: CCPath[] } }, res) => {
      const paths = req.body.paths
      const updatedPaths = paths.map(i => {
        if (!this.fs.existsSync(i.folder)) {
          throw new Error(`${i.folder} doesn't exist on disk`)
        }
        return this.getPathObject(i) // updates git url
      })
      this.fs.writeFileSync(ConfigPaths.paths, JSON.stringify(updatedPaths, null, '\t'), { flag: 'w' })
      this.sendSuccessResponse(res, updatedPaths)
    })

    router.use(function (err, req, res, next) {
      console.log("err", err)
      if (res.headersSent) {
        return next(err)
      }
      res.status(500)
      res.json({ err: err, message: err.message })
      // do something about the err
    })

    this.express.use("/", router)
  }

  private clearVisiIds(res: express.Response, req: { path }) {
    let savedIds = {}
    let clearedFileContents = {}
    this.processDir(req.path, (filePath) => {
      let fileText = this.readFile(filePath)
      let remarks = this.getRemarksFromPath(filePath)
      if (!this.containsVisiId(fileText)) return
      let splitFile = this.splitTextToLines(fileText)
      let fileLines = splitFile.lines
      let newFileLines = []
      fileLines.forEach((line, lineIndex) => {
        if (this.containsVisiId(line)) {
          if (savedIds[filePath] === undefined) {
            savedIds[filePath] = []
          }
          let savedVisId: SavedVisiId = {
            visiId: this.getIdFromLine(line),
            line: lineIndex,
          }
          savedIds[filePath].push(savedVisId)
          let visiIdFirstIndex = line.indexOf(remarks[0] + VISI_PREFIX)
          let visiIdlastIndex =
            line.indexOf(VISI_SUFFIX + remarks[1]) +
            (VISI_SUFFIX + remarks[1]).length
          newFileLines.push(
            line.replace(line.substring(visiIdFirstIndex, visiIdlastIndex), "")
          )
        } else {
          newFileLines.push(line)
        }
      })
      clearedFileContents[filePath] = newFileLines.join(splitFile.splitChar)
    })
    for (let filePath in clearedFileContents) {
      this.fs.writeFileSync(filePath, clearedFileContents[filePath])
    }
    console.log("clear visiId", savedIds)
    this.fs.writeFileSync(
      this.configFile["savedVisiIdsPath"],
      JSON.stringify(savedIds)
    )
    this.sendSuccessResponse(res, savedIds)
  }

  private rewriteVisiIds(res: express.Response) {
    let skippedIds = { skippedIds: [] }
    let visiIdsLocations = JSON.parse(
      Utils.readFileSync(this.configFile["savedVisiIdsPath"])
    )
    for (let filePath in visiIdsLocations) {
      let visiIds: SavedVisiId[] = visiIdsLocations[filePath]
      let fileText = this.readFile(filePath)
      let splitText = this.splitTextToLines(fileText)
      visiIds.forEach((visiId) => {
        let line = splitText.lines[visiId.line]
        if (this.containsVisiId(line)) {
          skippedIds.skippedIds.push({
            line: line,
            lineIndex: visiId.line,
            visiId: visiId,
            existingVisiId: this.getIdFromLine(line),
          })
          return
        }
        splitText.lines[visiId.line] =
          splitText.lines[visiId.line] +
          VISI_PREFIX +
          visiId.visiId +
          VISI_SUFFIX
      })
      let textWithAddedVisiIds = splitText.lines.join(splitText.splitChar)
      this.fs.writeFileSync(filePath, textWithAddedVisiIds)
    }
    console.log("rewrite visiId", visiIdsLocations)
    this.sendSuccessResponse(res, skippedIds)
  }

  private async createDiagram(req: express.Request, res: express.Response) {
    const id = await this.saveWrapperInstance.createDiagram(req.body)
    this.sendSuccessResponse(res, { id })
  }

  private async getDiagramsByText(req: express.Request, res: express.Response) {
    const diagrams = await this.saveWrapperInstance.filterByText(req.body)
    this.sendSuccessResponse(res, diagrams)
  }

  private async updateDiagram(req: express.Request, res: express.Response) {
    await this.saveWrapperInstance.updateDiagram(req.body)
    this.sendSuccessResponse(res, {})
  }

  private async getDiagram(req: express.Request, res: express.Response) {
    const diagram = await this.saveWrapperInstance.getDiagramById(req.params.id)
    this.sendSuccessResponse(res, diagram)
  }

  private async deleteDiagram(req: express.Request, res: express.Response) {
    await this.saveWrapperInstance.deleteDiagramById(req.params.id)
    this.sendSuccessResponse(res, {})
  }

  private async deleteAllDiagrams(req: express.Request, res: express.Response) {
    await this.saveWrapperInstance.deleteAllDiagrams()
    this.sendSuccessResponse(res, {})
  }

  private async approveLicense(req: express.Request, res: express.Response) {
    try {
      // const response = { data: "OK" }
      const response = await axios.post(
        "https://license.code-chart.com/api/v1/license/approve",
        { macAddress: this.macAddress }
      )
      res.header("Access-Control-Allow-Origin", "*");
      res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
      this.sendSuccessResponse(res, response.data)
    } catch (e) {
      console.error(e)
      this.sendSuccessResponse(res, { message: 'something went wrong' })
    }

  }

  private loadFromCode(req: express.Request, res: express.Response) {
    let reloadRequest: ReloadRequest = req.body
    let nodesMatch: MatchInfo[] = reloadRequest.matches
    let chartFilePaths: string[] = reloadRequest.filePaths
    if (!nodesMatch || !Array.isArray(nodesMatch) || nodesMatch.length === 0) {
      this.sendSuccessResponse(res, {})
      return
    }
    let results: FindInFilesResponse[] = []
    let loadMatchesFromFile = (filePath) => {
      let fileResults = this.getResultsFromFile(
        filePath,
        reloadRequest.dirPath,
        null,
        (line) => {
          if (!this.containsVisiId(line)) return null
          let id = this.getIdFromLine(line)
          let idMatch = nodesMatch.find((match) => {
            return match.id === id
          })
          if (!idMatch) return null
          return line
        },
        (line) => {
          let id = this.getIdFromLine(line)
          let match = nodesMatch.find((match) => {
            return match.id === id
          })
          return { isRegex: match.isRegex, flags: match.flags }
        }
      )
      if (fileResults != null) {
        results.push(fileResults)
      } else {
        let partialFilePath = filePath.substring(
          this.Path.dirname(reloadRequest.dirPath).length,
          filePath.length
        )
        let indexOfPartialInChartFiles = chartFilePaths.indexOf(partialFilePath)
        if (indexOfPartialInChartFiles !== -1) {
          results.push({
            file: chartFilePaths[indexOfPartialInChartFiles],
            content: this.readFile(filePath),
            matches: [],
          })
        }
      }
    }
    this.processDir(reloadRequest.dirPath, loadMatchesFromFile)
    this.sendSuccessResponse(res, results)
  }

  private splitTextToLines(
    text: string
  ): { lines: string[]; splitChar: string } {
    let splitChar
    if (text.indexOf("\r\n") !== -1) splitChar = "\r\n"
    else splitChar = "\n"
    return { lines: text.split(splitChar), splitChar: splitChar }
  }

  private getRemarksFromPath(path: string): string[] {
    let remarks = this.configFile.remarks[this.Path.extname(path)]
    if (!remarks) return this.configFile.remarks["default"]
    else return remarks
  }

  private saveToCode(
    res: express.Response,
    nodes: SaveNode[],
    dirPath: string
  ) {
    /*Visi->a25bcda36a72227aca76b0599da332b3<-Visi*/
    let nodesInFiles = {}
    let existingIds: SaveNodesResponse[] = []
    try {
      nodes.forEach((node) => {
        if (isUndefined(node.filePath)) return
        if (!nodesInFiles[node.filePath]) nodesInFiles[node.filePath] = []
        nodesInFiles[node.filePath].push(node)
      })
      for (let path in nodesInFiles) {
        if (this.Path.extname(path) === ".json") continue
        let fileText = this.fs.readFileSync(this.Path.join(dirPath, path), {
          encoding: "UTF8",
        })
        let splitLines: { lines: string[]; splitChar: string }
        splitLines = this.splitTextToLines(fileText)
        let remarks = this.getRemarksFromPath(path)
        nodesInFiles[path].forEach((node: SaveNode) => {
          if (splitLines.lines[node.lineNumber].indexOf(node.id) === -1) {
            let lineText = splitLines.lines[node.lineNumber]
            if (this.containsVisiId(lineText)) {
              existingIds.push({
                exisitingId: this.getIdFromLine(lineText),
                savedId: node.id,
              })
              console.log(
                "id exists in line. exstsitinf id:",
                path,
                node.lineNumber,
                this.getIdFromLine(lineText),
                node.id
              )
            } else {
              splitLines.lines[node.lineNumber] = this.addVisiIdToLine(
                lineText,
                node.id,
                remarks
              )
              console.log("added id to:", path, node.lineNumber, node.id)
            }
          } else {
            console.log("id already saved:", path, node.lineNumber, node.id)
          }
        })
        let savedFileText = splitLines.lines.join(splitLines.splitChar)
        this.fs.writeFileSync(this.Path.join(dirPath, path), savedFileText, {
          flags: "r+",
        })
        console.log("saved file", path)
      }
    } catch (ex) {
      console.log(ex)
        ; (res as any).error(ex)
    }
    this.sendSuccessResponse(res, existingIds)
  }

  private isFileAllowed(fileFullPath: string) {
    let filename = fileFullPath.substring(this.Path.dirname(fileFullPath).length + 1, fileFullPath.length)
    return ((this.allowedFileExtensions.indexOf(this.Path.extname(fileFullPath)) != -1) &&
      this.configFile.forbiddenFiles.indexOf(filename) == -1)
  }

  private isDirectoryAllowed(dir: string): boolean {
    let isAllowed = true
    this.configFile.forbiddenFolders.forEach((forbidden) => {
      if (!isAllowed) return
      if (dir.indexOf(forbidden) !== -1) {
        isAllowed = false
      }
    })
    return isAllowed
  }

  private loadFolderToDb(dir) {
    this.processDir(dir, async (fullFilePath: string) => {
      let fileName = this.Path.basename(fullFilePath, this.Path.extname(fullFilePath))
      let rawdata = this.fs.readFileSync(fullFilePath, { encoding: "UTF8" });
      let badDirpath = rawdata.match(/"dirPath".+,/gi)[0]

      let description = ""//this.Path.dirname(fullFilePath).replace(this.Path.delimiter,  ", ")

      // i remove dirpath, since sometimes it`s saved with one '\'
      let dirPath = badDirpath.substring('"dirpath": "'.length, badDirpath.length - 2)
      rawdata = rawdata.replace(/"dirPath".+,/gi, "")
      let readData: { nodes: [], edges: [], dirPath?: string, positioning?: number } = JSON.parse(rawdata);
      let savedData: CreateDiagramDto = {
        data: {
          nodes: readData.nodes,
          edges: readData.edges
        },
        description: description,
        projects: [dirPath],
        story: fileName.replace(/\s*\(.+\)\s*/gi, "").replace(/_/g, " ")
      }
      let success
      try {
        success = await this.saveWrapperInstance.createDiagram(savedData)
      } catch (ex) {
        console.log('excpetion', ex)
      }
      console.log(fullFilePath + ": " + success)
    })
  }

  private processDir(dir: string, processFileFunc: (fullFolderPath) => void) {
    if (!this.isDirectoryAllowed(dir)) return
    if (!this.fs.statSync(dir).isDirectory()) {
      processFileFunc(this.Path.join(dir))
      return
    }

    let files = this.fs.readdirSync(dir)
    files.forEach((file) => {
      let fileFullPath = this.Path.join(dir, file)
      if (this.fs.statSync(fileFullPath).isDirectory()) {
        this.processDir(fileFullPath, processFileFunc)
      } else {
        if (!this.isFileAllowed(fileFullPath)) {
          return
        }
        processFileFunc(this.Path.join(fileFullPath))
      }
    })

    return
  }

  private readFile = (filePath) => {
    let fileText
    try {
      fileText = this.fs.readFileSync(filePath, { encoding: "UTF8" })
    } catch (ex) {
      // due to folder inconsistency, we remove duplicated folder names
      let pathParts = filePath.split(this.Path.sep)
      let nonDuplicatePartPath = []
      pathParts.forEach((i) => {
        if (nonDuplicatePartPath.indexOf(i) == -1) nonDuplicatePartPath.push(i)
      })
      try {
        fileText = this.fs.readFileSync(
          nonDuplicatePartPath.join(this.Path.sep),
          { encoding: "UTF8" }
        )
      } catch (ex) {
        throw ex
      }
    }
    if (fileText.indexOf("\r\n") === -1) fileText.replace("\n", "\r\n")
    return fileText
  }


  private getRegex(pattern, isRegex, flags) {
    if (!isRegex) {
      pattern = pattern.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    }
    return this.convertPatternToRexp(pattern, flags)
  }

  private getPathsFromConfig(): CCPath[] {
    let paths: CCPath[] = JSON.parse(Utils.readFileSync(ConfigPaths.paths))
    return paths.map(i => this.getPathObject(i))
  }

  private getPathObject(i: string | CCPath): CCPath {
    let folderName = (i: String): String => {
      let folders = i.split(os.sep)
      if (folders.length === 0) return i
      if ((i as String).endsWith(os.sep)) return folders[folders.length - 2]
      else return folders[folders.length - 1]
    }
    const ccPath: CCPath = {
      folder: (i as CCPath).folder ? (i as CCPath).folder : (i as string),
      label: null,
      gitUrl: null
    }


    let getGitFileFromParent = (folder) => {
      if (Path.dirname(folder) === folder) return null

      const gitPath = this.Path.join(folder, ".git")
      if (!this.fs.existsSync(gitPath)) return getGitFileFromParent(Path.dirname(folder))
      else return gitPath

    }

    let gitPath = getGitFileFromParent((ccPath).folder)
    if (!gitPath) ccPath.gitUrl = undefined
    else {
      let gitFile = Utils.readFileSync(this.Path.join(gitPath, "config"))
      ccPath.gitUrl = gitFile.match(/url.*=.*/gm)[0].replace(/url\s+=\s+/gm, "")
    }

    ccPath.label = folderName(ccPath.folder) as string

    return ccPath
  }

  private getGitUrlOfFolder(folder: string) {

  }

  private getIdForFile(searchPath) {
    return searchPath
  }

  private findInFiles(
    res: express.Response,
    pattern,
    flags,
    folderPath,
    searchPath,
    filenamePattern,
    isRegex,
    isFileNamePatternRegex,
    lineNumbers: number[],
    searchType: SearchEnum
  ) {
    let results = []
    try {
      let regex = this.getRegex(pattern, isRegex, flags)
      console.log("regex", regex)
      const normalizedDirPath = this.Path.normalize(folderPath)
      const normalizedSearchPath = this.Path.normalize(searchPath)
      const fullPath = this.Path.join(normalizedDirPath, normalizedSearchPath)
      // open file or folder
      if (searchType === SearchEnum.openFile) {
        if (this.fs.statSync(fullPath).isDirectory()) {
          let fileList = this.fs.readdirSync(fullPath)
          fileList = fileList.map((i) => {
            return this.fs.statSync(Path.join(normalizedSearchPath, i)).isDirectory() ? i + ' (folder)' : i
          })
          results = [
            {
              file: normalizedDirPath,
              content: fileList.join('\n'),
              matches: [],
            }
          ]
        }
        else {
          results = [
            {
              file: fullPath,
              content: this.readFile(fullPath),
              matches: [],
            },
          ]
        }
      }
      // get lines in file
      else if (searchType === SearchEnum.getLinesFromFile) {
        const fileResult = this.getResultsFromFile(fullPath, normalizedDirPath, lineNumbers, null, null)
        if (fileResult) results = [fileResult]
      }
      // search in file
      else if (searchType === SearchEnum.searchInFile) {
        const fileResult = this.getResultsFromFile(fullPath, normalizedDirPath, null,
          (line) => {
            return line.match(regex)
          },
          (line) => {
            return { isRegex: isRegex, flags: flags }
          }
        )
        if (fileResult) results = [fileResult]

      }
      // search in folder
      else {
        this.processDir(normalizedDirPath, (filePath) => {
          if (isFileNamePatternRegex) {
            filenamePattern = this.convertPatternToRexp(filenamePattern, "gi")
          }
          if (filenamePattern && filePath.match(filenamePattern) === null)
            return

          let fileResults: FindInFilesResponse
          fileResults = this.getResultsFromFile(filePath, normalizedDirPath, null,
            (line) => {
              return line.match(regex)
            },
            (line) => {
              return { isRegex: isRegex, flags: flags }
            }
          )
          if (fileResults !== null) {
            console.log("found in", filePath)
            results.push(fileResults)
          }
        })
      }
      //noinspection TypeScriptUnresolvedFunction
      this.sendSuccessResponse(res, results)
    } catch (ex) {
      console.log(ex.message)
      //noinspection TypeScriptUnresolvedFunction
      res.status(500).json({ message: ex.message })
    }
  }

  private getEndLineOfBlock(lines: string[], lineIndex: number) {
    let currentLine = lines[lineIndex]
    let status: 'counting ()' | 'counting {}' = null
    if (currentLine.indexOf('(') !== -1) {
      status = "counting ()";
    } else if (currentLine.indexOf('{') !== -1) {
      status = 'counting {}';
    }

    if (!status) return undefined

    let countBrackets = (open, close, count, line) => {
      if (line === null || line === undefined) {
        console.error("error in counting brackets")
        return 0
      }
      let openRegex = line.match(new RegExp(`\\${open}`, 'g'))
      let openCount = !openRegex ? 0 : openRegex.length
      let closeRegex = line.match(new RegExp(`\\${close}`, 'g'))
      let closeCount = !closeRegex ? 0 : closeRegex.length
      return count + openCount - closeCount
    }
    let checkLine = (lines: string[], lineIndex, status: 'counting ()' | 'counting {}' | 'after ()' | 'finished', bracketCount, lineCount) => {
      if (status === 'finished') return undefined
      let currentLine = lines[lineIndex]
      if (currentLine === undefined || currentLine === null) {
        console.warn(`error fetching end of block after ${lines[lineIndex - 1] ? lines[lineIndex - 1] : ''}`)
        return lineCount
      }
      let count
      if (status === 'after ()') {
        if (currentLine.match(/{\s*$/) === null) {
          checkLine(null, null, 'finished', null, lineCount)
        }
        else
          status = 'counting {}'
      }
      if (status === 'counting ()') {
        count = countBrackets('(', ')', bracketCount, currentLine)
        if (count <= 0) {
          if (currentLine.match(/{/g))
            lineCount = checkLine(lines, lineIndex, 'counting {}', 0, lineCount)
          else
            lineCount = checkLine(lines, lineIndex + 1, 'after ()', 0, lineCount + 1)
        }
        else
          lineCount = checkLine(lines, lineIndex + 1, 'counting ()', 0, lineCount + 1)
      } else if (status === 'counting {}') {
        count = countBrackets('{', '}', bracketCount, currentLine)
        if (count <= 0) {
          return lineCount
        }
        else {
          lineCount = checkLine(lines, lineIndex + 1, 'counting {}', count, lineCount + 1)
        }
      }
      return lineCount
    }

    return checkLine(lines, lineIndex, status, 0, 0)
  }


  // reload: for each line, check line id is in matches ids; if yes create match using regex of match
  // find in files: for each line, check if line has regex; if yes create match using regex
  private getResultsFromFile(fullPath: string, dirPath: string, lineNumbers: number[],
    regexMatchFromLine: (line) => RegExpExecArray | null,
    matchRegexInfo: (line) => { isRegex: boolean; flags: string }
  ): FindInFilesResponse {
    let fileText = this.readFile(fullPath)
    let fileLines = this.splitTextToLines(fileText).lines
    let tempResults: MatchInfo[] = []
    let lineStartIndex = 0
    let lineMatch: RegExpExecArray = null
    const matchFromLine = (line, lineIndex) => {
      let id
      if (this.containsVisiId(line)) {
        id = this.getIdFromLine(line)
      } else {
        id = this.createId(fullPath, lineIndex)
      }
      let endContentLine
      if (line.indexOf("(") !== -1) {
        endContentLine = this.getEndLineOfBlock(fileLines, lineIndex)
      } else if (line.indexOf("{") !== -1) {
        endContentLine = this.getEndLineOfBlock(fileLines, lineIndex)
      }
      let resultMatch = {
        value: matchRegexInfo ? lineMatch[0] : line,
        indexInLine: matchRegexInfo ? lineMatch.index : 0,
        line: line,
        lineNumber: lineIndex,
        id: id,
        isRegex: matchRegexInfo ? matchRegexInfo(line).isRegex : false,
        flags: matchRegexInfo ? matchRegexInfo(line).flags : '',
        endContentLine: lineIndex + endContentLine,
        ofFile: this.getIdForFile(fullPath),
      }
      return resultMatch
    }
    // get specific line
    if (lineNumbers) {
      tempResults = lineNumbers.map((i) => matchFromLine(fileLines[i], i))
    }
    // perform search
    else {
      fileLines.forEach((line, lineIndex) => {
        lineMatch = regexMatchFromLine(line)
        /* condition of creating match from line*/
        if (lineMatch !== null) {
          let resultMatch = matchFromLine(line, lineIndex)
          tempResults.push(resultMatch)
        }
        lineMatch = null
      })
    }
    if (tempResults.length) {
      return {
        file: this.getIdForFile(fullPath),
        content: fileText,
        matches: tempResults,
      }
    } else return null
  }

  private convertPatternToRexp(pattern, flags): RegExp {
    return new RegExp(pattern, flags)
  }

  private getMatches(data, regex: RegExp) {
    return data.match(regex)
  }

  private createId(filePath, lineNumber): string {
    return md5(filePath + lineNumber + new Date().getMilliseconds())
  }

  private getIdFromLine(line: string) {
    let visiData = line.match("Visi->(.+)<-Visi")
    if (!visiData || this.addVisiIdToLine.length === 1) return null
    let visiIdWtf = visiData[1].split(VISI_SEPARATOR)
    return visiData[0]
  }

  private containsVisiId(line): boolean {
    return line.indexOf(VISI_PREFIX) !== -1 && line.indexOf(VISI_SUFFIX) !== -1
  }

  private addVisiIdToLine(line, id, remarks: string[]): string {
    return line + remarks[0] + VISI_PREFIX + id + VISI_SUFFIX + remarks[1]
  }

  private sendSuccessResponse(res: express.Response, data: any) {
    res.json(data)
  }

  private sendErrorResponse(res: express.Response, error: any) {
    ; (res as any).error(res, error)
  }
}

const port = process.env.PORT || 2900

function runApp() {
  new App().express.listen(port, (err) => {
    if (err) {
      return console.log(err)
    }
    // open("http://localhost:2900")
    return console.log(`server is listening on ${port}`)
  })
}

export default runApp
