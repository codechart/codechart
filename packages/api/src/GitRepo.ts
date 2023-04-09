import SaveWrapper, {
  CreateDiagramDto,
  QueryDto,
  ResultDiagram,
  FullDiagramDto,
  UpdateDiagramDto,
} from "./SaveWrapper"
import { simpleGit, SimpleGit, CleanOptions } from "simple-git"
import LocalRepo from "./LocalRepo"

export default class GitRepo implements SaveWrapper {
  private git: SimpleGit
  private localRepo: LocalRepo

  constructor(repoUrl: string) {
    this.localRepo = new LocalRepo()
    this.git = simpleGit({
      baseDir: this.localRepo.getCodechartDir(),
    })

    console.log("connecting to git repo " + repoUrl)
    this.git
      .checkIsRepo()
      .then((isRepo) => !isRepo && this.initializeRepo(repoUrl))
      .then(() => this.git.fetch())
      .then(this.gitRead)
  }

  private initializeRepo = async (repoUrl: string) => {
    const branches = await this.git
      .init()
      .addRemote("origin", repoUrl)
      .fetch()
      .branch(["-r"])

    if (branches.all.includes("origin/master")) {
      // remote exists
      await this.git.clean(CleanOptions.FORCE)
    } else {
      // remote is brand new
      await this.gitWrite("Initial commit")
    }
  }

  private gitRead = () => this.git.pull("origin", "master")

  private gitWrite = (message: string | string[]) =>
    this.git.add(".").commit(message).push("origin", "master")

  public createDiagram = async (
    createDiagramDto: CreateDiagramDto
  ): Promise<number> => {
    await this.gitRead()
    const _id = await this.localRepo.createDiagram(createDiagramDto)
    this.gitWrite(`Create diagram ${createDiagramDto.story}`)
    return _id
  }

  public getDiagramById = async (id: string): Promise<FullDiagramDto> => {
    await this.gitRead()
    const diagram = await this.localRepo.getDiagramById(id)
    return diagram
  }

  public updateDiagram = async (diagram: UpdateDiagramDto) => {
    await this.gitRead()
    await this.localRepo.updateDiagram(diagram)
    await this.gitWrite(`Update diagram ${diagram.story}`)
  }

  public filterByText = async (query: QueryDto): Promise<ResultDiagram[]> => {
    await this.gitRead()
    return this.localRepo.filterByText(query)
  }

  public deleteDiagramById = async (id: string) => {
    await this.gitRead()
    await this.localRepo.deleteDiagramById(id)
    this.gitWrite(`Delete diagram ${id}`)
  }

  public deleteAllDiagrams = async () => {
    await this.gitRead()
    await this.localRepo.deleteAllDiagrams()
    this.gitWrite("Delete all diagrams")
  }
}
