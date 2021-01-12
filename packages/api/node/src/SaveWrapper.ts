export default interface SaveWrapper {
  createDiagram: (diagram: any) => string
  filterByText: (query: string) => any[] // our custom nodes
}
