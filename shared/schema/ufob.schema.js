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
        "ev_to_situation": { "type": "string" },
      },
      "required": ["ev_id", "ev_name", "ev_to_situation"]
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
