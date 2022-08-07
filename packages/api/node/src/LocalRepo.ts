import SaveWrapper, {
  CreateDiagramDto,
  QueryDto,
  ResultDiagram,
  FullDiagramDto,
  UpdateDiagramDto,
} from "./SaveWrapper"
import os = require("os")
import path = require("path")
import fs = require("fs")
import * as _ from "lodash"
import Datastore = require("nedb-promises")

const encoding = "utf8"

export default class LocalRepo implements SaveWrapper {
  private diagramMetadataDb: Datastore
  private codechartDir: string
  private diagramsDir: string
  private baseDir: string | null

  constructor(baseDir: string | null) {
    this.baseDir = baseDir
    this.initFileSystem()
    this.diagramMetadataDb = Datastore.create({
      filename: path.join(this.codechartDir, "diagramMetadata.db"),
      autoload: true,
      timestampData: true,
    })
  }

  private initFileSystem() {
    if (this.baseDir) {
      this.codechartDir = this.baseDir
    } else {
      this.codechartDir = path.join(os.homedir(), ".codechart")
    }
    this.diagramsDir = path.join(this.codechartDir, "diagrams")
    ;(fs as any).mkdirSync(this.diagramsDir, { recursive: true })
  }

  public createDiagram = async (
    createDiagramDto: CreateDiagramDto
  ): Promise<number> => {
    const diagramData = JSON.stringify(createDiagramDto.data)
    delete createDiagramDto.data
    const dataToInsert: any = createDiagramDto

    const { _id } = await this.diagramMetadataDb.insert(dataToInsert)

    fs.writeFileSync(this.getFilePath(_id), diagramData, { encoding })

    return _id
  }

  public getDiagramById = async (id: string): Promise<FullDiagramDto> => {
    const diagram = await this.diagramMetadataDb.findOne({ _id: id })
    ;(diagram as any).data = JSON.parse(
      fs.readFileSync(this.getFilePath(id), encoding)
    )
    ;(diagram as any).id = diagram._id
    delete diagram._id
    return diagram as any
  }

  public updateDiagram = async (diagram: UpdateDiagramDto) => {
    const diagramData = JSON.stringify(diagram.data)
    delete diagram.data
    let _id = diagram.id
    delete diagram.id
    await this.diagramMetadataDb.update({ _id }, diagram)
    fs.writeFileSync(this.getFilePath(_id), diagramData, { encoding })
  }

  public filterByText = async (query: QueryDto): Promise<ResultDiagram[]> => {
    const searchResults: any = await this.diagramMetadataDb
      .find(this.getFilterQuery(query))
      .limit(query.take)
      .sort({ updatedAt: -1 })

    return searchResults.map((res) => {
      res.id = res._id
      delete res._id
      return {
        metadata: res,
        results: {
          labels: this.getFoundFiltered(query, "labels", res),
          fileNames: this.getFoundFiltered(query, "fileNames", res),
          projects: this.getFoundFiltered(query, "projects", res),
        },
      }
    })
  }

  public deleteDiagramById = async (id: string) => {
    await this.diagramMetadataDb.remove({ _id: id }, {})
    fs.unlinkSync(this.getFilePath(id))
  }

  public deleteAllDiagrams = async () => {
    await this.diagramMetadataDb.remove({}, { multi: true })
    ;(fs as any).rmdirSync(this.diagramsDir, { recursive: true })
    this.initFileSystem()
  }

  private getFoundFiltered = (
    query: QueryDto,
    key: string,
    searchResult: object
  ) => {
    if (query[key] && query.general)
      return searchResult[key].filter(
        (x) =>
          new RegExp(query[key]).test(x) || new RegExp(query.general).test(x)
      )
    else if (query[key])
      return searchResult[key].filter((x) => new RegExp(query[key]).test(x))
    else if (query.general)
      return searchResult[key].filter((x) => new RegExp(query.general).test(x))
    else return []
  }

  private getFilterQuery = (query: QueryDto) => {
    const dbQuery = { $and: [] }
    const $and = []
    this.pushRegexIfExists($and, "description", query)
    this.pushRegexIfExists($and, "type", query)
    this.pushRegexIfExists($and, "story", query)
    this.pushRegexIfExists($and, "user", query)
    this.pushRegexIfExists($and, "labels", query)
    this.pushRegexIfExists($and, "fileNames", query)
    this.pushRegexIfExists($and, "projects", query)
    dbQuery.$and = $and
    if (query.general) {
      const generalRegExp = new RegExp(query.general)
      dbQuery.$and.push({
        $or: [
          { description: generalRegExp },
          { type: generalRegExp },
          { story: generalRegExp },
          { user: generalRegExp },
          { labels: generalRegExp },
          { fileNames: generalRegExp },
          { projects: generalRegExp },
        ],
      })
    }
    return dbQuery
  }

  private pushRegexIfExists = ($and: {}[], key: string, query: QueryDto) => {
    if (query[key]) $and.push({ [key]: new RegExp(query[key]) })
  }

  private getFilePath = (id: string) =>
    path.join(this.diagramsDir, `${id}.json`)
}
