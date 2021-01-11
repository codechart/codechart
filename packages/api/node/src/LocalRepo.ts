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
    this.db = dbInitializer(path.join(this.codechartDir, "codechart.db"))
    this.db
      .prepare(
        `CREATE TABLE IF NOT EXISTS diagrams (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      description TEXT
    )`
      )
      .run()
  }

  private initFileSystem() {
    this.codechartDir = path.join(os.homedir(), ".codechart")
    this.diagramsDir = path.join(this.codechartDir, "diagrams")
    ;(fs as any).mkdirSync(this.diagramsDir, { recursive: true })
  }

  public createDiagram = (diagram: any): string => {
    this.db
      .prepare("INSERT INTO diagrams (description) VALUES (@description)")
      .run(diagram)
    const id: string = String(
      this.db.prepare("SELECT last_insert_rowid() AS id").get().id
    )
    fs.writeFileSync(this.getFilePath(id), JSON.stringify(diagram), {
      encoding,
    })
    return id
  }

  public filterByDescription = (description: string): string[] =>
    this.db
      .prepare(
        "SELECT id FROM diagrams WHERE description LIKE '%@description%'"
      )
      .all({ description })
      .map(({ id }) => {
        return fs.readFileSync(this.getFilePath(id), encoding)
      })

  private getFilePath = (id: string) =>
    path.join(this.diagramsDir, `${id}.json`)
}

export default new LocalRepo()
