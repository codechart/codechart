export default interface SaveWrapper {
  createDiagram: (diagram: any) => string
  updateDiagram: (id: string, diagram: string) => void
  filterByText: (query: string) => any[] // our custom nodes
}
