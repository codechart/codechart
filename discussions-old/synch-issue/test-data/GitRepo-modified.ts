import SaveWrapper, {
  CreateDiagramDto,
  QueryDto,
  ResultDiagram,
  FullDiagramDto,
  UpdateDiagramDto,
} from "./SaveWrapper"
import { simpleGit, SimpleGit, CleanOptions } from "simple-git"
import LocalRepo from "./LocalRepo"
import * as path from 'path'

const fs = require('fs')



export default class GitRepo implements SaveWrapper {
  private git: SimpleGit
  private localRepo: LocalRepo
  private readonly defaultBranch = 'master'
  
  constructor(repoUrl: string) {
    this.localRepo = new LocalRepo()
    this.git = simpleGit({
      baseDir: this.localRepo.getCodechartDir(),
    })

    console.log("connecting to git repo " + repoUrl)
    this.startRepo(repoUrl).catch(error => {
      console.error('ERROR: Git repository not found.')
      console.error('')
      console.error('Config is set to repo: "git" but no .git directory exists.')
      console.error('')
      console.error('Fix: Set "repo": "local" in config.json or config.local.json')
      console.error('(Local mode stores diagrams as files instead of git commits)')
      console.error('')
      console.error('Exiting.')
      process.exit(1)
    })
  }

  private async startRepo(repoUrl: string) {
    console.log("startRepo")
    const isGitRepo = await this.git.checkIsRepo()
    
    if (isGitRepo) {
      await this.handleExistingRepo(repoUrl)
    } else {
      // Initialize new git repo when none exists
      await this.initializeRepo(repoUrl)
    }
    
    await this.syncWithRemote()
  }

  private async handleExistingRepo(repoUrl: string) {
    const remotes = await this.git.getRemotes(true)
    const currentRemoteUrl = remotes.find(remote => remote.name === 'origin')?.refs?.fetch
    
    if (currentRemoteUrl !== repoUrl) {
      console.log("Remote URL changed, reinitializing repo")
      await this.clearDirectory()
      this.git = simpleGit({
        baseDir: this.localRepo.getCodechartDir(),
      })
      await this.initializeRepo(repoUrl)
    }
  }

  private async clearDirectory() {
    const codechartDir = this.localRepo.getCodechartDir()
    const files = fs.readdirSync(codechartDir)
    
    for (const file of files) {
      const filePath = path.join(codechartDir, file)
      fs.rmSync(filePath, { recursive: true, force: true })
    }
  }

  private async syncWithRemote() {
    await this.git.fetch()
    await this.gitRead()
    const remotes = await this.git.getRemotes(true)
    console.log('remotes', remotes)
  }

  private async initializeRepo(repoUrl: string) {
    try {
      await this.git.init()
      await this.git.addRemote("origin", repoUrl)
      await this.git.fetch()
      const branches = await this.git.branch(["-r"])

      if (branches.all.includes(`origin/${this.defaultBranch}`)) {
        await this.git.clean(CleanOptions.FORCE)
      } else {
        await this.gitWrite("Initial commit")
      }
    } catch (error) {
      console.error('Failed to initialize repository:', error)
      throw error
    }
  }

  private async gitRead() {
    try {
      await this.git.pull("origin", this.defaultBranch)
    } catch (error) {
      console.error('Failed to pull from remote:', error)
      throw error
    }
  }

  private async gitWrite(message: string | string[]) {
    try {
      await this.git.add(".")
      await this.git.commit(message)
      await this.git.push("origin", this.defaultBranch)
    } catch (error) {
      console.error('Failed to write to repository:', error)
      throw error
    }
  }

  public async createDiagram(createDiagramDto: CreateDiagramDto): Promise<number> {
    await this.gitRead()
    const _id = await this.localRepo.createDiagram(createDiagramDto)
    await this.gitWrite(`Create diagram ${createDiagramDto.story}`)
    return _id
  }

  public async getDiagramById(id: string): Promise<FullDiagramDto> {
    await this.gitRead()
    return this.localRepo.getDiagramById(id)
  }

  public async updateDiagram(diagram: UpdateDiagramDto) {
    await this.gitRead()
    await this.localRepo.updateDiagram(diagram)
    await this.gitWrite(`Update diagram ${diagram.story}`)
  }

  public async filterByText(query: QueryDto): Promise<ResultDiagram[]> {
    await this.gitRead()
    return this.localRepo.filterByText(query)
  }

  public async deleteDiagramById(id: string) {
    await this.gitRead()
    await this.localRepo.deleteDiagramById(id)
    await this.gitWrite(`Delete diagram ${id}`)
  }

  public async deleteAllDiagrams() {
    await this.gitRead()
    await this.localRepo.deleteAllDiagrams()
    await this.gitWrite("Delete all diagrams")
  }
}