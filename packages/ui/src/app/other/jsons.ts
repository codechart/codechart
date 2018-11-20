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

export const SearchJson = {
      title: "public",
      pattern: "public",
      flags: "gi",
      path: "",
      fileExtensions: "."
    }
