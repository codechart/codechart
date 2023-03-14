export interface Config {
  path: string
  allowedFileExtensions: string[]
  forbiddenFiles: string[]
  allowedFolders: string[]
  forbiddenFolders?: string[]
  remarks: { [fileExtension: string]: string[] }
  archiveUrl?: string
  auditNotEnabled?: boolean
  repo: 'local' | 'git' | undefined
  gitRemoteUrl: string | null
}
