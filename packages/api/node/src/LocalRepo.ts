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
    // let include: DiagramMetadataInclude
    // const containsQueryGeneral = { contains: query.general }
    // const contentContainsQueryGeneral = { content: containsQueryGeneral }
    // const useInclude =
    //   query.labels || query.projects || query.projects || query.general
    // if (useInclude)
    //   include = {
    //     labels: {
    //       where: {
    //         OR: [
    //           { content: { contains: query.labels } },
    //           contentContainsQueryGeneral,
    //         ],
    //       },
    //     },
    //     projects: {
    //       where: {
    //         OR: [
    //           { content: { contains: query.projects } },
    //           contentContainsQueryGeneral,
    //         ],
    //       },
    //     },
    //     fileNames: {
    //       where: {
    //         OR: [
    //           { content: { contains: query.fileNames } },
    //           contentContainsQueryGeneral,
    //         ],
    //       },
    //     },
    //   }
    // else include = includeAll
    // const searchResult = await this.prisma.diagramMetadata.findMany({
    //   where: {
    //     AND: [
    //       { description: { contains: query.description } },
    //       { type: { contains: query.type } },
    //       { story: { contains: query.story } },
    //       { user: { contains: query.user } },
    //       {
    //         OR: [
    //           { description: containsQueryGeneral },
    //           { type: containsQueryGeneral },
    //           { story: containsQueryGeneral },
    //           { user: containsQueryGeneral },
    //         ],
    //       },
    //     ],
    //   },
    //   include,
    //   orderBy: { updatedAt: "desc" },
    //   take: query.take,
    // })
    // searchResult.forEach((dm) => this.mutateDbMetadataToDiagramMetadata(dm))
    // // we need to populate results with relevant found values
    // if (useInclude) {
    //   const metadataArray = await Promise.all(
    //     searchResult.map((filteredDiagramMetadata) =>
    //       this.prisma.diagramMetadata.findUnique({
    //         where: { id: filteredDiagramMetadata.id },
    //         include: includeAll,
    //       })
    //     )
    //   )
    //   return metadataArray.map((metadata, index) => {
    //     this.mutateDbMetadataToDiagramMetadata(metadata)
    //     return {
    //       metadata,
    //       results: {
    //         labels: (searchResult[index] as any).labels,
    //         projects: (searchResult[index] as any).projects,
    //         fileNames: (searchResult[index] as any).fileNames,
    //       },
    //     }
    //   }) as any
    // }
    // return searchResult.map((sr) => {
    //   return { metadata: sr, results: {} }
    // }) as any
    return []
  }

  private getFilePath = (id: string) =>
    path.join(this.diagramsDir, `${id}.json`)

  private stringArrayToJsonContentArray = (
    strings: string[]
  ): { content: string }[] => {
    if (_.isEmpty(strings)) return undefined
    return strings.map((s) => {
      return { content: s }
    })
  }

  private mutateCreateDiagramDtoToDataToInsert = (
    createDiagramDto: CreateDiagramDto
  ) => {
    const dataToInsert: any = createDiagramDto
    delete dataToInsert.data
  }
}

export default new LocalRepo()
