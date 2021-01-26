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
import {
  DiagramMetadata,
  DiagramMetadataInclude,
  DiagramMetadataWhereInput,
  PrismaClient,
} from "@prisma/client"
import * as _ from "lodash"
import * as npm from "npm"

const encoding = "utf8"
const includeAll = {
  labels: true,
  projects: true,
  fileNames: true,
}

export class LocalRepo implements SaveWrapper {
  private prisma: PrismaClient
  private codechartDir: string
  private diagramsDir: string

  constructor() {
    this.initFileSystem()
    this.initDb()
    this.prisma = new PrismaClient()
  }

  private initFileSystem() {
    this.codechartDir = path.join(os.homedir(), ".codechart")
    this.diagramsDir = path.join(this.codechartDir, "diagrams")
    ;(fs as any).mkdirSync(this.diagramsDir, { recursive: true })
  }

  private initDb() {
    npm.load(() => {
      npm.commands["run-script"](["deploydb"], () => {})
    })
  }

  public createDiagram = async (
    createDiagramDto: CreateDiagramDto
  ): Promise<number> => {
    const diagramData = JSON.stringify(createDiagramDto.data)
    this.mutateCreateDiagramDtoToDataToInsert(createDiagramDto)
    const dataToInsert: any = createDiagramDto

    const { id } = await this.prisma.diagramMetadata.create({
      data: dataToInsert,
    })

    fs.writeFileSync(this.getFilePath(id), diagramData, { encoding })

    return id
  }

  public getDiagramById = async (id: number): Promise<FullDiagramDto> => {
    const diagram = await this.prisma.diagramMetadata.findUnique({
      where: { id },
      include: includeAll,
    })
    this.mutateDbMetadataToDiagramMetadata(diagram)
    ;(diagram as any).data = JSON.parse(
      fs.readFileSync(this.getFilePath(id), encoding)
    )
    return diagram as any
  }

  // couldnt get 'put' to work on ui side
  public updateDiagram = async (diagram: UpdateDiagramDto) => {
    const deleteWhereQuery = { where: { diagramMetadataId: diagram.id } }

    await Promise.all([
      this.prisma.label.deleteMany(deleteWhereQuery),
      this.prisma.project.deleteMany(deleteWhereQuery),
      this.prisma.fileName.deleteMany(deleteWhereQuery),
    ])
    const diagramData = JSON.stringify(diagram.data)

    this.mutateCreateDiagramDtoToDataToInsert(diagram)
    let id = diagram.id
    delete diagram['id']
    await this.prisma.diagramMetadata.update({
      where: {  id: id},
      data: diagram as any,
    })

    fs.writeFileSync(this.getFilePath(diagram.id), diagramData, { encoding })
  }

  public filterByText = async (query: QueryDto): Promise<ResultDiagram[]> => {
    let include: DiagramMetadataInclude
    const containsQueryGeneral = { contains: query.general }
    const contentContainsQueryGeneral = { content: containsQueryGeneral }

    const useInclude =
      query.labels || query.projects || query.projects || query.general
    if (useInclude)
      include = {
        labels: {
          where: {
            OR: [
              { content: { contains: query.labels } },
              contentContainsQueryGeneral,
            ],
          },
        },
        projects: {
          where: {
            OR: [
              { content: { contains: query.projects } },
              contentContainsQueryGeneral,
            ],
          },
        },
        fileNames: {
          where: {
            OR: [
              { content: { contains: query.fileNames } },
              contentContainsQueryGeneral,
            ],
          },
        },
      }
    else include = includeAll

    const searchResult = await this.prisma.diagramMetadata.findMany({
      where: {
        AND: [
          { description: { contains: query.description } },
          { type: { contains: query.type } },
          { story: { contains: query.story } },
          { user: { contains: query.user } },
          {
            OR: [
              { description: containsQueryGeneral },
              { type: containsQueryGeneral },
              { story: containsQueryGeneral },
              { user: containsQueryGeneral },
            ],
          },
        ],
      },
      include,
      orderBy: { updatedAt: "desc" },
      take: query.take,
    })
    searchResult.forEach((dm) => this.mutateDbMetadataToDiagramMetadata(dm))

    // we need to populate results with relevant found values
    if (useInclude) {
      const metadataArray = await Promise.all(
        searchResult.map((filteredDiagramMetadata) =>
          this.prisma.diagramMetadata.findUnique({
            where: { id: filteredDiagramMetadata.id },
            include: includeAll,
          })
        )
      )

      return metadataArray.map((metadata, index) => {
        this.mutateDbMetadataToDiagramMetadata(metadata)
        return {
          metadata,
          results: {
            labels: (searchResult[index] as any).labels,
            projects: (searchResult[index] as any).projects,
            fileNames: (searchResult[index] as any).fileNames,
          },
        }
      }) as any
    }

    return searchResult.map((sr) => {
      return { metadata: sr, results: {} }
    }) as any
  }

  private getFilePath = (id: number) =>
    path.join(this.diagramsDir, `${id}.json`)

  private stringArrayToJsonContentArray = (
    strings: string[]
  ): { content: string }[] => {
    if (_.isEmpty(strings)) return undefined
    return strings.map((s) => {
      return { content: s }
    })
  }

  private getContentObjectsAsStringArray = (objects: { content: string }[]) => {
    if (!objects || _.isEmpty(objects)) return undefined
    return objects.map((o) => o.content)
  }

  private mutateDbMetadataToDiagramMetadata = (fromDb: DiagramMetadata) => {
    ;(fromDb as DiagramMetadataDto).labels = this.getContentObjectsAsStringArray(
      (fromDb as any).labels
    )
    ;(fromDb as DiagramMetadataDto).projects = this.getContentObjectsAsStringArray(
      (fromDb as any).projects
    )
    ;(fromDb as DiagramMetadataDto).fileNames = this.getContentObjectsAsStringArray(
      (fromDb as any).fileNames
    )
  }

  private mutateCreateDiagramDtoToDataToInsert = (
    createDiagramDto: CreateDiagramDto
  ) => {
    const dataToInsert: any = createDiagramDto
    delete dataToInsert.data

    const labelsToInsert = this.stringArrayToJsonContentArray(
      dataToInsert.labels
    )
    const projectsToInsert = this.stringArrayToJsonContentArray(
      dataToInsert.projects
    )
    const fileNamesToInsert = this.stringArrayToJsonContentArray(
      dataToInsert.fileNames
    )

    dataToInsert.labels = { create: labelsToInsert }
    dataToInsert.projects = { create: projectsToInsert }
    dataToInsert.fileNames = { create: fileNamesToInsert }
  }
}

export default new LocalRepo()
