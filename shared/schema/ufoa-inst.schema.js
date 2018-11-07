// @flow

export const ufoaInstSchema = {
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "ufoa-inst-meta#",
  "title": "UFO-A instance metamodel",
  
  "definitions": {
    "entityInst": {
      "type": "object",
      "properties": {
        "i_e_id":  { "type": "string" },
        "i_label": { "type": "string" },
      },
      "required": ["i_e_id", "i_label"]
    },
    "generalisationsInst": {
      "type": "object",
      "properties": {
        "i_g_id":     { "type": "string" },
        "i_sup_e_id": { "type": "string" },
        "i_sub_e_id": { "type": "string" },
      },
      "required": ["i_g_id", "i_sup_e_id", "i_sub_e_id"]
    },
    "assocInst": {
      "type": "object",
      "properties": {
        "i_a_id":  { "type": "string" },
        "i_e1_id": { "type": "string" },
        "i_e2_id": { "type": "string" },
      },
      "required": ["i_a_id", "i_e1_id", "i_e2_id"]
    },
  },

  "modelInst": {
    "type": "object",
    "properties": {
      "entitiesInsts": {
        "type": "array",
        "items": { "$ref": "#/definitions/entityInst" },
        "uniqueItems": true
      },
      "generalisationsInsts": {
        "type": "array",
        "items": { "$ref": "#/definitions/generalisationInst" },
        "uniqueItems": true
      },
      "associationsInsts": {
        "type": "array",
        "items": { "$ref": "#/definitions/associationInst" },
        "uniqueItems": true
      }
    },
    "required": ["entitiesInsts", "generalisationsInsts", "associationsInsts"]
  }
};

