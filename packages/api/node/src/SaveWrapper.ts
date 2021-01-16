interface DiagramMetadataStringArrays {
  projects?: string[]
  fileNames?: string[]
  labels?: string[]
}

export interface DiagramMetadata extends DiagramMetadataStringArrays {
  dirPath?: string
  positioning?: number
  description?: string
  story?: string
  type?: string // task, description, bug, etc.
  user?: string
}
export interface CreateDiagramDto extends DiagramMetadata {
  data: any
}

interface ResultMetadata extends DiagramMetadata {
  id: number
  createdAt: string
  updatedAt: string
}

export interface FullDiagramDto extends ResultMetadata {
  data: any
}

export interface ResultDiagram {
  metadata: ResultMetadata
  results: DiagramMetadataStringArrays
}

export interface QueryDto {
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
  createDiagram: (createDiagramDto: CreateDiagramDto) => Promise<number>
  updateDiagram: (id: number, diagram: CreateDiagramDto) => Promise<void>
  filterByText: (query: QueryDto) => Promise<ResultDiagram[]>
  getDiagramById: (id: number) => Promise<FullDiagramDto>
}
