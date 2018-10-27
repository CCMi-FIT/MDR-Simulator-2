// @flow

import * as R from 'ramda';
import { ufoaSchema } from '../schema/ufoa.schema.js';
var Ajv = require('ajv');

// Common types

export type Id = string;
export type Name = string;
export type Label = string;

// Validation

export type ValidationResult = {
  errors?: string
}

export const validationResultOK = {};

function validateElement(elem: any, uri: string): ValidationResult {
  ajv.validate(uri, elem); 
  if (!ajv.errors) {
    return {};
  } else {
    return { errors: ajv.errorsText() };
  }
}

var ajv = new Ajv();
ajv.addSchema(ufoaSchema); 

// Entity

export type EntityType = "kind" | "subkind" | "role" | "phase" | "mode" | "relator" | "quantity" | "quality" | "collective"

export const entityTypes: Array<EntityType> = ["kind", "subkind", "role", "phase", "mode", "relator", "quantity", "quality", "collective"];

export type UfoaEntity = {
  e_id: Id,
  e_type: EntityType,
  e_name: Name
};

export const entityAttrs: Array<string> = Object.keys(ufoaSchema.definitions.entity.properties);

export function entityNameLine(e: UfoaEntity): string {
  return e.e_name.replace("\n", " ");
}

export function e_typeStr(e: UfoaEntity): string {
  return "<<" + e.e_type + ">>";
}

export function entityStr(e: UfoaEntity): string {
  return e_typeStr(e) + "\n" + e.e_name;
}

export function entityColor(e: UfoaEntity) {
  switch (e.e_type) {
    case "kind": return       "#8A9EFC"; 
    case "subkind": return    "#8A9EFC";
    case "collective": return "#67d6f2";
    case "quantity": return   "#9EFFF2";
    case "role": return       "#FFAA67";
    case "phase": return      "#ffd467";
    case "relator": return    "#9EFFC3";
    case "mode": return       "#c5c5c5";
    case "quality": return    "#d7d7d7";
    default: return           "#FFFFFF";
  }
}

export function validateEntity(entity: UfoaEntity): ValidationResult {
  return validateElement(entity, "ufoa-meta#/definitions/entity"); 
}

// Generalisation Set

export type GenMeta = "" | "disjoint" | "complete" | "disjoint-complete";

export const genMetas = ["", "disjoint", "complete", "disjoint-complete"];

export function genMetaStr(genMeta: GenMeta): string {
  return genMeta === "" ? "{}"
       : genMeta === "disjoint" ? "{disjoint}"
       : genMeta === "complete" ? "{complete}"
       : genMeta === "disjoint-complete" ? "{disjoint, complete}"
       : "invalid generalisation meta";
}

export type GSet = {
  g_set_id: Id,
  g_meta: GenMeta
};

export const gSetAttrs: Array<string> = Object.keys(ufoaSchema.definitions.gset.properties);

// Generalisation 

export type Generalisation = {
  g_id: Id,
  g_set: GSet,
  g_sup_e_id: Id,
  g_sub_e_id: Id,
};

export const generalisationAttrs: Array<string> = Object.keys(ufoaSchema.definitions.generalisation.properties);

export function generalisationStr(gen: Generalisation): string {
  switch(gen.g_set.g_meta) {
    case "disjoint": return "{disjoint}";
    case "complete": return "{complete}";
    case "disjoint-complete": return "{disjoint, complete}";
    default: return "";
  };
}

export function validateGeneralisation(generalisation: Generalisation): ValidationResult {
  return validateElement(generalisation, "ufoa-meta#/definitions/generalisation"); 
}

// Association

export type Lower = number
export type Upper = number

export type Mult = {
  lower: Lower,
  upper: Upper
}

export type Connection = {
  e_id: Id,
  mult: Mult
}

export type AssocType = "" | "mediation" | "characterization" | "containment" | "member of"

export const assocTypes = ["", "mediation", "characterization", "containment", "member of"];

export function isValidAssocType(s: string): boolean {
  return assocTypes.includes(s);
}

export function assocTypeStr(atype: AssocType): string {
  return "<<" + atype + ">>";
}

export type AssocMeta = "" | "essential" | "inseparable" | "essential-inseparable"

export const assocMetas = ["", "essential", "inseparable", "essential-inseparable"];

export function assocMetaStr(assocMeta: AssocMeta): string {
  return assocMeta === "" ? "{}"
       : assocMeta === "essential" ? "{essential}"
       : assocMeta === "inseparable" ? "{inseparable}"
       : assocMeta === "essential-inseparable" ? "{essential, inseparable}"
       : "invalid association meta";
}

export type Association = {
  a_id: Id,
  a_type: AssocType,
  a_meta: AssocMeta,
  a_connection1: Connection,
  a_connection2: Connection,
  a_label: Label
}

export const associationAttrs: Array<string> = Object.keys(ufoaSchema.definitions.association.properties);

export function isValidAssociationAttr(attr: string): boolean {
  return associationAttrs.includes(attr);
}

export function assocStr(a: Association): string {
  return a.a_label + "\n" + assocTypeStr(a.a_type) + (a.a_meta ? "\n" + assocMetaStr(a.a_meta) : "");
}

export function validateAssociation(assoc: Association): ValidationResult {
  return validateElement(assoc, "ufoa-meta#/definitions/association"); 
}

// Model

export type Model = {
  entities: Array<UfoaEntity>,
  generalisations: Array<Generalisation>,
  associations: Array<Association>
};

export const emptyModel = { entities: [], generalisations: [], associations: [] };

export function isEmpty(model: Model) {
  return !model || model.entities.length === 0;
}

export function getGeneralisationSets(model: Model): Array<GSet> {
  let gss = model.generalisations.map(g => g.g_set);
  return R.uniq(gss);
}               

export function validateModel(model: Model): ValidationResult {
  return validateElement(model, "ufoa-meta#/model"); 
}

