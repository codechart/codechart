export const TypesMapping = [
      {
        "type": "file",
        "regexCondition": "\\\\[^\\\\]+\\..+",
        "titleExtraction": "\\\\[^\\\\]+\\..+",
        "style": {
          "e": 2,
          // "bg": true,
          "c": "rgb(120, 120, 120)",
          "b": "rgb(0, 0, 0)",
          "bw": "4",
          "fb": true,
          "ha0": {
            "c": "rgb(0, 0, 0)",
            "r": 35,
            "w": 1
          }
        }
      },
      {
        "type": "public_declarance",
        "regexCondition": "public\\s*",
        "titleExtraction": ".+\\(",
        "style": {
          "e": 1,
          "c": "rgb(255, 0, 0)",
          "b": "rgb(0, 0, 0)",
          "bw": "4",
          "ha0": {
            "c": "rgb(0, 0, 0)",
            "r": 35,
            "w": 1
          }
        }
      },
      {
        "type": "function local usage",
        "regexCondition": "this\\..*\\(",
        "titleExtraction": ".*",
        "style": {
          "e": 1,
          "c": "rgb(0, 255, 0)",
          "b": "rgb(0, 0, 0)",
          "bw": "4",
          "ha0": {
            "c": "rgb(0, 0, 0)",
            "r": 35,
            "w": 1
          }
        }
      }
    ]

export const SearchJson = {
      title: "find usages of class VlaComponent",
      pattern: "loadIds",
      flags: "gi",
      path: "",
      fileExtensions: ".ts"
    }