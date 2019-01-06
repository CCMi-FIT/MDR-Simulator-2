// @flow

export const schema = {
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "scenario-meta#",
  "title": "Scenarios metamodel",
  
  "definitions": {
    "scenario": {
      "type": "object",
      "properties": {
        "sc_id": { "type": "string" },
        "sc_name": { "type": "string" },
        "sc_desc": { "type": "string" },
        "sc_ev_insts": { 
          "type": "array",
          "items": { "$ref": "#/definitions/eventInstance" },
          "uniqueItems": true
        }
      },
      "required": ["sc_id", "sc_name", "sc_desc", "sc_ev_insts"]
    },
    "eventInstance": {
      "type": "object",
      "properties": {
        "evi_id": { "type": "string" },
        "evi_ev_id": { "type": "string" },
        "evi_ops": {
          "type": "array",
          "items": { "$ref": "#/definitions/operation" },
          "uniqueItems": true
        },
        "evi_is_excluded": { "type": "boolean" }
      },
      "required": ["evi_id", "evi_ev_id", "evi_ops", "evi_is_excluded"]
    },
  },
  "model": {
    "type": "array",
    "items": { "$ref": "#/definitions/scenario" },
    "uniqueItems": true
  }
};
