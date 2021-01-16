export interface Config {
  path: string
  allowedFileExtensions: string[]
  allowedFolders: string[]
  forbiddenFolders: string[]
  remarks: { [fileExtension: string]: string[] }
}
