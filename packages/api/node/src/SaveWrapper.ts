export default interface SaveWrapper {
  createDiagram: (diagram: any) => string
  filterByDescription: (description: string) => string[] // our custom nodes as strings
}
