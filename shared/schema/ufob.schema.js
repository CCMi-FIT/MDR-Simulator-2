// @flow

export const ufobSchema = {
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "ufob-meta#",
  "title": "UFO-B metamodel",
  
  "definitions": {
    "event": {
      "type": "object",
      "properties": {
        "ev_id":           { "type": "string" },
        "ev_name":         { "type": "string" },
        "ev_ops": { 
          "type": "array",
          "items": {"$ref": "#/definitions/operation" },
          "uniqueItems": true
        },
        "ev_to_situation_id": { "type": "string" },
      },
      "required": ["ev_id", "ev_name", "ev_ops", "ev_to_situation_id"]
    },
    "operation": {
      "anyOf": [
        {
          "type": "object",
          "properties": {
            "opa_id": { "type": "string" },
            "opa_e_id": { "type": "string" },
            "opa_ei_name": { "type": "string" }
          },
          "required": ["opa_id", "opa_e_id", "opa_ei_name"]
        }, 
        {
          "type": "object",
          "properties": {
            "opr_id": { "type": "string" },
            "opr_ei_name": { "type": "string" },
          },
          "required": ["opr_id", "opr_ei_name"]
        } 
      ]
    },
    "disposition": {
      "type": "object",
      "properties": {
        "d_text":       { "type": "string" },
        "d_events_ids": { 
          "type":        "array",
          "items":       { "type": "string" },
          "uniqueItems": true
        },
      },
      "required": ["d_text", "d_events_ids"]
    },
    "situation": {
      "type": "object",
      "properties": {
        "s_id":           { "type": "string" }, 
        "s_name":         { "type": "string" },
        "s_dispositions": { 
          "type":        "array",
          "items":       {"$ref": "#/definitions/disposition" },
          "uniqueItems": true
        },
      },
      "required": ["s_id", "s_name", "s_dispositions"]
    }
  },

  "model": {
    "type": "object",
    "properties": {
      "events": {
        "type": "array",
        "items": { "$ref": "#/definitions/event" },
        "uniqueItems": true
      },
      "situations": {
        "type": "array",
        "items": { "$ref": "#/definitions/situation" },
        "uniqueItems": true
      }
    },
    "required": ["events", "situations"]
  }
};
