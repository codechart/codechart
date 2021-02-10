import SaveWrapper, {
  CreateDiagramDto,
  QueryDto,
  ResultDiagram,
  DiagramMetadata as DiagramMetadataDto,
  FullDiagramDto,
  UpdateDiagramDto,
} from "./SaveWrapper"
import os = require("os")
import path = require("path")
import fs = require("fs")
import * as _ from "lodash"
import Datastore = require("nedb-promises")

const encoding = "utf8"
const includeAll = {
  labels: true,
  projects: true,
  fileNames: true,
}

export class LocalRepo implements SaveWrapper {
  private diagramMetadataDb: Datastore
  private codechartDir: string
  private diagramsDir: string

  constructor() {
    this.initFileSystem()
    this.diagramMetadataDb = Datastore.create({
      filename: path.join(this.codechartDir, "diagramMetadata.db"),
      autoload: true,
      timestampData: true,
    })
  }

  private initFileSystem() {
    this.codechartDir = path.join(os.homedir(), ".codechart")
    this.diagramsDir = path.join(this.codechartDir, "diagrams")
    ;(fs as any).mkdirSync(this.diagramsDir, { recursive: true })
  }

  public createDiagram = async (
    createDiagramDto: CreateDiagramDto
  ): Promise<number> => {
    const diagramData = JSON.stringify(createDiagramDto.data)
    this.mutateCreateDiagramDtoToDataToInsert(createDiagramDto)
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
    return diagram as any
  }

  public updateDiagram = async (diagram: UpdateDiagramDto) => {
    const diagramData = JSON.stringify(diagram.data)
    this.mutateCreateDiagramDtoToDataToInsert(diagram)
    let _id = diagram._id
    delete diagram._id
    await this.diagramMetadataDb.update({ _id }, diagram)
    fs.writeFileSync(this.getFilePath(diagram._id), diagramData, { encoding })
  }

  public filterByText = async (query: QueryDto): Promise<ResultDiagram[]> => {
    const generalRegExp = new RegExp(query.general)
    const searchResults: any = await this.diagramMetadataDb
      .find({
        $and: [
          { description: new RegExp(query.description) },
          { type: new RegExp(query.type) },
          { story: new RegExp(query.story) },
          { user: new RegExp(query.user) },
          { labels: new RegExp(query.labels) },
          { fileNames: new RegExp(query.fileNames) },
          { projects: new RegExp(query.projects) },
          {
            $or: [
              { description: generalRegExp },
              { type: generalRegExp },
              { story: generalRegExp },
              { user: generalRegExp },
              { labels: generalRegExp },
              { fileNames: generalRegExp },
              { projects: generalRegExp },
            ],
          },
        ],
      })
      .limit(query.take)
      .sort({ updatedAt: -1 })

    return searchResults.map((res) => {
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

  private getFilePath = (id: string) =>
    path.join(this.diagramsDir, `${id}.json`)

  private mutateCreateDiagramDtoToDataToInsert = (
    createDiagramDto: CreateDiagramDto
  ) => {
    const dataToInsert: any = createDiagramDto
    delete dataToInsert.data
  }
}

export default new LocalRepo()
