import {SearchJson} from "../search/search.actions";

export interface TypeMapping {type: string, regexCondition: string, titleExtraction: string, item: 'edge' | 'node', style: any}

export const typesMapping: TypeMapping[] = [
      {
        "type": "public_declarance",
        "regexCondition": "public\\s*",
        "titleExtraction": ".+\\(",
        item: 'node',
        "style": {
          color: {
            border: "#ff0000"
          }
        }
      },
      {
        "type": "function local usage",
        item: 'node',
        "regexCondition": "this\\..*\\(",
        "titleExtraction": ".*",
        "style": {
          color: {
            border: "#00ff00"
          }
        }
      }
    ]

export const StartSearchJson: SearchJson = {
      title: "public createShape",
      pattern: "FindInFilesResponse",
      flags: "gi",
      path: "",
      fileExtensions: ".",
      isRegex: false
    }
