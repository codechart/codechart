import SaveWrapper from "./SaveWrapper"
import dbInitializer = require("better-sqlite3")
import os = require("os")
import path = require("path")
import fs = require("fs")

const encoding = "utf8"

export class LocalRepo implements SaveWrapper {
  private db: dbInitializer.Database
  private codechartDir: string
  private diagramsDir: string

  constructor() {
    this.initFileSystem()
    this.db = dbInitializer(path.join(this.codechartDir, "codechart.db"), {
      verbose: console.log,
    })
    this.db
      .prepare(
        "CREATE VIRTUAL TABLE IF NOT EXISTS diagrams USING FTS5(description)"
      )
      .run()
  }

  private initFileSystem() {
    this.codechartDir = path.join(os.homedir(), ".codechart")
    this.diagramsDir = path.join(this.codechartDir, "diagrams")
    ;(fs as any).mkdirSync(this.diagramsDir, { recursive: true })
  }

  public createDiagram = (diagram: any): string => {
    const id: string = String(
      this.db
        .prepare("INSERT INTO diagrams (description) VALUES (@description)")
        .run(diagram).lastInsertRowid
    )
    fs.writeFileSync(this.getFilePath(id), JSON.stringify(diagram), {
      encoding,
    })
    return id
  }

  public updateDiagram = (id: string, diagram: any) => {
    this.db
      .prepare("UPDATE diagrams SET description = @description WHERE rowid = ?")
      .run(id, diagram)
    fs.writeFileSync(this.getFilePath(id), JSON.stringify(diagram), {
      encoding,
    })
  }

  public filterByText = (query: string): any[] =>
    this.db
      .prepare(
        `SELECT rowid AS id
        FROM diagrams
        WHERE diagrams MATCH @query
        ORDER BY rank`
      )
      .all({ query })
      .map(({ id }) => {
        return {
          id,
          diagram: JSON.parse(fs.readFileSync(this.getFilePath(id), encoding)),
        }
      })

  private getFilePath = (id: string) =>
    path.join(this.diagramsDir, `${id}.json`)
}

export default new LocalRepo()
