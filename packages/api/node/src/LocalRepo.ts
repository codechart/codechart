import SaveWrapper, {
  CreateDiagramDto,
  QueryDto,
  ResultDiagram,
  DiagramMetadata as DiagramMetadataDto,
  FullDiagramDto,
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
    this.prisma = new PrismaClient()
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

  public updateDiagram = async (id: number, diagram: CreateDiagramDto) => {
    const deleteWhereQuery = { where: { diagramMetadataId: id } }

    await Promise.all([
      this.prisma.label.deleteMany(deleteWhereQuery),
      this.prisma.project.deleteMany(deleteWhereQuery),
      this.prisma.fileName.deleteMany(deleteWhereQuery),
    ])
    const diagramData = JSON.stringify(diagram.data)

    this.mutateCreateDiagramDtoToDataToInsert(diagram)
    await this.prisma.diagramMetadata.update({
      where: { id },
      data: diagram as any,
    })

    fs.writeFileSync(this.getFilePath(id), diagramData, { encoding })
  }

  public filterByText = async (query: QueryDto): Promise<ResultDiagram[]> => {
    const where = this.whereQuery(query)
    const include = this.includeQuery(query)

    const prismaQuery = { orderBy: { updatedAt: "desc" } } as any

    if (!_.isEmpty(where)) prismaQuery.where = where

    const useInclude = !_.isEmpty(include)
    if (useInclude) prismaQuery.include = include
    else prismaQuery.include = includeAll

    const searchResult = await this.prisma.diagramMetadata.findMany(prismaQuery)
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

  private whereQuery = (query: QueryDto) => {
    const where: DiagramMetadataWhereInput = {}
    this.setContainsQueryIfPropertyExists(where, query, "dirPath")
    this.setContainsQueryIfPropertyExists(where, query, "description")
    this.setContainsQueryIfPropertyExists(where, query, "story")
    this.setContainsQueryIfPropertyExists(where, query, "user")
    this.setContainsQueryIfPropertyExists(where, query, "task")
    return where
  }
  private includeQuery = (query: QueryDto) => {
    const include: DiagramMetadataInclude = {}
    this.setWhereContentContainsIfPropertyExists(include, query, "labels")
    this.setWhereContentContainsIfPropertyExists(include, query, "projects")
    this.setWhereContentContainsIfPropertyExists(include, query, "fileNames")
    return include
  }

  private setContainsQueryIfPropertyExists = (
    where: DiagramMetadataWhereInput,
    query: QueryDto,
    property: string
  ) => {
    if (query[property])
      where[property] = {
        contains: query[property],
      }
  }

  private setWhereContentContainsIfPropertyExists = (
    include: DiagramMetadataInclude,
    query: QueryDto,
    property: string
  ) => {
    if (query[property])
      include[property] = {
        where: {
          content: { contains: query[property] },
        },
      }
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
