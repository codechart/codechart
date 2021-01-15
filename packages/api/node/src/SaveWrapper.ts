export interface DiagramMetadata {
  dirPath?: string
  positioning?: number
  description?: string
  story?: string
  type?: string // task, description, bug, etc.
  labels?: string[]
  user?: string
  projects?: string[]
  fileNames?: string[]
}
export interface CreateDiagramDto extends DiagramMetadata {
  data: any
}

interface QueryDto {
  dirPath?: string
  description?: string
  story?: string
  labels?: string
  user?: string
  task?: string
  projects?: string
  fileNames?: string
  general?: string
}

export default interface SaveWrapper {
  createDiagram: (createDiagramDto: CreateDiagramDto) => Promise<string>
  updateDiagram: (id: string, diagram: string) => Promise<void>
  filterByText: (query: QueryDto) => Promise<any[]>
}
