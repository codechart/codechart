import SaveWrapper, { CreateDiagramDto } from "./SaveWrapper"
import os = require("os")
import path = require("path")
import fs = require("fs")
import { DiagramMetadata, Label, PrismaClient } from "@prisma/client"

const encoding = "utf8"

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
  ): Promise<string> => {
    const diagramData = JSON.stringify(createDiagramDto.data)
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

    const { id } = await this.prisma.diagramMetadata.create({
      data: dataToInsert,
    })

    fs.writeFileSync(this.getFilePath(id), diagramData, {
      encoding,
    })

    return id.toString()
  }

  public updateDiagram = async (id: string, diagram: any) => {
    // this.db
    //   .prepare("UPDATE diagrams SET description = @description WHERE rowid = ?")
    //   .run(id, diagram)
    // fs.writeFileSync(this.getFilePath(id), JSON.stringify(diagram), {
    //   encoding,
    // })
    return
  }

  public filterByText = async (query: string): Promise<any[]> => {
    return
    // this.db
    //   .prepare(
    //     `SELECT rowid AS id
    //     FROM diagrams
    //     WHERE diagrams MATCH @query
    //     ORDER BY rank`
    //   )
    //   .all({ query })
    //   .map(({ id }) => {
    //     return {
    //       id,
    //       diagram: JSON.parse(fs.readFileSync(this.getFilePath(id), encoding)),
    //     }
    //   })
  }

  private getFilePath = (id: number) =>
    path.join(this.diagramsDir, `${id}.json`)

  private stringArrayToJsonContentArray = (
    strings: string[]
  ): { content: string }[] =>
    strings.map((s) => {
      return { content: s }
    })
}

export default new LocalRepo()
