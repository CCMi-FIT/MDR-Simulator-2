export const ufoaSchema = {
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "ufoa-meta#",
  "title": "UFO-A metamodel",
  
  "definitions": {
    "entity": {
      "type": "object",
      "properties": {
        "e_id":     { "type": "string" },
        "e_type": { 
          "type": "string",
          "pattern": "kind|subkind|role|phase|mode|relator|quantity|quality|collective" },
        "e_name":   { "type": "string" }
      },
      "required": ["e_id", "e_type", "e_name"]
    },
    "gset": {
      "type": "object",
      "properties": {
        "g_set_id":   { "type": "string" },
        "g_meta":     { "type": "string", "pattern": "^$|disjoint|complete|disjoint-complete" }
      },
      "required": ["g_set_id", "g_meta"]
    },
    "generalisation": {
      "type": "object",
      "properties": {
        "g_id":       { "type": "string" },
        "g_set":      { "$ref": "#/definitions/gset" },
        "g_sup_e_id": { "type": "string" },
        "g_sub_e_id": { "type": "string" },
      },
      "required": ["g_id", "g_set", "g_sup_e_id", "g_sub_e_id"]
    },
    "multiplicity": {
      "type": "object",
      "properties": {
        "lower": { "type": "number" },
        "upper": { "type": "number" }
      },
      "required": ["lower"]
    },
    "connection": {
      "type": "object",
      "properties": {
        "e_id": { "type": "string" },
        "mult": { "$ref": "#/definitions/multiplicity" } 
      },
      "required": ["e_id", "mult"]
    },
    "association": {
      "type": "object",
      "properties": {
        "a_id":          { "type": "string" },
        "a_type":        { "type": "string", "pattern": "^$|Mediation|Characterization|ComponentOf|SubCollectionOf|MemberOf|Containment|SubQuantityOf" },
        "a_meta":        { "type": "string", "pattern": "^$|essential|inseparable|essential-inseparable"},
        "a_connection1": { "$ref": "#/definitions/connection" },
        "a_connection2": { "$ref": "#/definitions/connection" },
        "a_label":       { "type": "string" }
      },
      "required": ["a_id", "a_type", "a_connection1", "a_connection2", "a_label"]
    }
  },

  "model": {
    "type": "object",
    "properties": {
      "entities": {
        "type": "array",
        "items": { "$ref": "#/definitions/entity" },
        "uniqueItems": true
      },
      "generalisations": {
        "type": "array",
        "items": { "$ref": "#/definitions/generalisation" },
        "uniqueItems": true
      },
      "associations": {
        "type": "array",
        "items": { "$ref": "#/definitions/association" },
        "uniqueItems": true
      }
    },
    "required": ["entities", "generalisations", "associations"]
  }
};
