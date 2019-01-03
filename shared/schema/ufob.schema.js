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
        "ev_add_ops": { 
          "type": "array",
          "items": {"$ref": "#/definitions/operationAdd" },
          "uniqueItems": true
        },
        "ev_remove_ops": { 
          "type": "array",
          "items": {"$ref": "#/definitions/operationRemove" },
          "uniqueItems": true
        },
        "ev_to_situation_id": { "type": "string" },
      },
      "required": ["ev_id", "ev_name", "ev_add_ops", "ev_remove_ops", "ev_to_situation_id"]
    },
    "operationAdd": {
      "type": "object",
      "properties": {
        "opa_e_id": { "type": "string" },
        "opa_ei_is_default": { "type": "boolean" }
      },
      "required": ["opa_e_id", "opa_ei_is_default"]
    }, 
    "operationRemove": {
      "type": "object",
      "properties": {
        "opr_e_id": { "type": "string" },
      },
      "required": ["opr_e_id"]
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
