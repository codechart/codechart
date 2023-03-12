interface DiagramMetadataStringArrays {
  projects?: string[]
  fileNames?: string[]
  labels?: string[]
}

export interface DiagramMetadata extends DiagramMetadataStringArrays {
  positioning?: number
  description?: string
  story?: string
  type?: string // task, description, bug, etc.
  user?: string
}
export interface CreateDiagramDto extends DiagramMetadata {
  data: any
}

export interface UpdateDiagramDto extends CreateDiagramDto {
  id: string
}

interface ResultMetadata extends UpdateDiagramDto {
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
  description?: string
  story?: string
  labels?: string
  user?: string
  type?: string
  projects?: string
  fileNames?: string
  general?: string
  take?: number
}

export default interface SaveWrapper {
  createDiagram: (createDiagramDto: CreateDiagramDto) => Promise<number>
  updateDiagram: (diagram: UpdateDiagramDto) => Promise<void>
  filterByText: (query: QueryDto) => Promise<ResultDiagram[]>
  getDiagramById: (id: string) => Promise<FullDiagramDto>
  deleteDiagramById: (id: string) => Promise<void>
  deleteAllDiagrams: () => Promise<void>
}
