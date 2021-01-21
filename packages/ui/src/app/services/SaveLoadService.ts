import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs/Observable";
import { catchError, map } from "rxjs/operators";
import { Edge, Node } from "vis";
import { SelectedDiagramInfo } from "../app.component";
import { EndPoints } from "../types.nodejs";

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
  data?: any
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
  type?: string
  projects?: string
  fileNames?: string
  general?: string,
}


export interface ResultDiagramUI extends QueryDto {
  data?: {
    nodes: Node[],
    edges: Edge[]
  },
  id?: number
  createdAt?: string
  updatedAt?: string
}


interface SaveInfo {
  savedDiagramDetails: SelectedDiagramInfo,
  nodes: Node[],
  edges: Edge[],
  filenames: string[],
  projects: string[],
  labels: string[]

}

@Injectable()
export class SaveLoadService {

  getById(id: any): Observable<ResultDiagramUI> {
    return this.http.get('http://localhost:2900' + EndPoints.loadDiagram + id).pipe(
      map((response: FullDiagramDto) => {
        let result: ResultDiagramUI = Object.assign(
          response, {
            fileNames: response.fileNames ? response.fileNames.join(" ; ") : "",
            labels: response.labels ? response.labels.join(" ; ") : "",
            projects: response.projects ? response.projects.join(" ; ") : ""
          }
        )
        return result
      })
    )
  }
  constructor(public http: HttpClient) { }

  update(params: SaveInfo) {

  }

  save(params: SaveInfo, isNew = true) {
    let savedInfo: CreateDiagramDto = Object.assign({
      data: {
        nodes: params.nodes,
        edges: params.edges
      }
    }, params.savedDiagramDetails, { labels: params.labels, fileNames: params.filenames, projects: params.projects })
    if (isNew) return this.http.post('http://localhost:2900' + EndPoints.saveDiargam, savedInfo)
    else return this.http.put('http://localhost:2900' + EndPoints.loadDiagram + params.savedDiagramDetails.id, savedInfo)
  }

  public getResults(searchObject: QueryDto): Promise<ResultDiagramUI[]> {
    return this.http.post('http://localhost:2900' + EndPoints.searchDiagram, searchObject).pipe(
      map((data: ResultDiagram[]) => {
        let results: ResultDiagramUI[] = []
        data.forEach(apiDiagram => {
          let result: ResultDiagramUI = {}
          for (let key in apiDiagram.metadata) {
            let value = apiDiagram.metadata[key]
            if (!value) continue
            result[key] = value
          }
          for (let key in apiDiagram.results) {
            let value = apiDiagram.results[key]
            if (!value) continue
            result[key] = value.join(' ; ')
          }
          results.push(result)
        })
        return results;
      })
    ).toPromise<ResultDiagramUI[]>()
  }

}
