import {SearchJson} from "../app.component";
export const TypesMapping = [
      {
        "type": "file",
        "regexCondition": "\\\\[^\\\\]+\\..+",
        "titleExtraction": "\\\\[^\\\\]+\\..+",
        "style": {
          color: {
            background: "rgb(120, 120, 120)"
          },
          size: 50,
        }
      },
      {
        "type": "public_declarance",
        "regexCondition": "public\\s*",
        "titleExtraction": ".+\\(",
        "style": {
          color: {
            background: "#ff0000"
          }
        }
      },
      {
        "type": "function local usage",
        "regexCondition": "this\\..*\\(",
        "titleExtraction": ".*",
        "style": {
          color: {
            background: "#00ff00"
          }
        }
      }
    ]

export const StartSearchJson: SearchJson = {
      title: "public createShape",
      pattern: "public createShape",
      flags: "gi",
      path: "",
      fileExtensions: ".",
      isRegex: true
    }
