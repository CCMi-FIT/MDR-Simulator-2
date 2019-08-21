import * as R from "ramda";
import { Id, Name, Label, ValidationResult, validateElement } from "../metamodel";
import { ufoaSchema } from "./schema";
import { Ajv } from "ajv";

const ajv = new Ajv();
ajv.addSchema(ufoaSchema);

// Entity {{{1

export type EntityType = "kind" | "subkind" | "role" | "phase" | "mode" | "relator" | "quantity" | "quality" | "collective";

export const entityTypes: EntityType[] = ["kind", "subkind", "role", "phase", "mode", "relator", "quantity", "quality", "collective"];

export interface UfoaEntity {
  e_id: Id;
  e_type: EntityType;
  e_name: Name;
}

export const entityAttrs: string[] = Object.keys(ufoaSchema.definitions.entity.properties);

export function entityNameLine(e: UfoaEntity): string {
  return e.e_name.replace("\n", " ");
}

export function entityTypeStr(e: UfoaEntity): string {
  return "«" + e.e_type + "»";
}

export function entityStr(e: UfoaEntity): string {
  return entityTypeStr(e) + "\n" + e.e_name;
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
  return validateElement(ajv, entity, "ufoa-meta#/definitions/entity");
}

// Generalisation Set {{{1

export type GenMeta = "" | "disjoint" | "complete" | "disjoint-complete";

export const genMetas = ["", "disjoint", "complete", "disjoint-complete"];

export function genMetaStr(genMeta: GenMeta): string {
  return genMeta === "" ? "{}"
       : genMeta === "disjoint" ? "{disjoint}"
       : genMeta === "complete" ? "{complete}"
       : genMeta === "disjoint-complete" ? "{disjoint, complete}"
       : "invalid generalisation meta";
}

export interface GSet {
  g_set_id: Id;
  g_meta: GenMeta;
}

export const gSetAttrs: string[] = Object.keys(ufoaSchema.definitions.gset.properties);

// Generalisation {{{1

export interface Generalisation {
  g_id: Id;
  g_set: GSet;
  g_sup_e_id: Id;
  g_sub_e_id: Id;
}

export const generalisationAttrs: string[] = Object.keys(ufoaSchema.definitions.generalisation.properties);

export function generalisationStr(gen: Generalisation): string {
  switch (gen.g_set.g_meta) {
    case "disjoint": return "{disjoint}";
    case "complete": return "{complete}";
    case "disjoint-complete": return "{disjoint, complete}";
    default: return "";
  }
}

export function validateGeneralisation(generalisation: Generalisation): ValidationResult {
  return validateElement(ajv, generalisation, "ufoa-meta#/definitions/generalisation");
}

// Association {{{1

export type Lower = number;
export type Upper = number;

export interface Mult {
  lower: Lower;
  upper?: Upper;
}

export interface Connection {
  e_id: Id;
  mult: Mult;
}

export type AssocType = "" | "Mediation" | "Characterization" | "ComponentOf" | "SubCollectionOf" | "MemberOf" | "Containment" | "SubQuantityOf";

export const assocTypes = ["", "Mediation", "Characterization", "ComponentOf", "SubCollectionOf", "MemberOf", "Containment", "SubQuantityOf"];

export function isValidAssocType(s: string): boolean {
  return assocTypes.includes(s);
}

export function assocTypeStr(atype: AssocType): string {
  return "«" + atype + "»";
}

export type AssocMeta = "" | "essential" | "inseparable" | "essential-inseparable";

export const assocMetas = ["", "essential", "inseparable", "essential-inseparable"];

export function assocMetaStr(assocMeta: AssocMeta): string {
  return assocMeta === "" ? "{}"
       : assocMeta === "essential" ? "{essential}"
       : assocMeta === "inseparable" ? "{inseparable}"
       : assocMeta === "essential-inseparable" ? "{essential, inseparable}"
       : "invalid association meta";
}

export interface Association {
  a_id: Id;
  a_type: AssocType;
  a_meta: AssocMeta;
  a_connection1: Connection;
  a_connection2: Connection;
  a_label: Label;
}

export const associationAttrs: string[] = Object.keys(ufoaSchema.definitions.association.properties);

export function isValidAssociationAttr(attr: string): boolean {
  return associationAttrs.includes(attr);
}

export function assocStr(a: Association): string {
  return a.a_label + "\n" + assocTypeStr(a.a_type) + (a.a_meta ? "\n" + assocMetaStr(a.a_meta) : "");
}

export function validateAssociation(assoc: Association): ValidationResult {
  return validateElement(ajv, assoc, "ufoa-meta#/definitions/association");
}

// Model {{{1

export interface UfoaModel {
  entities: UfoaEntity[];
  generalisations: Generalisation[];
  associations: Association[];
}

export const emptyModel = { entities: [], generalisations: [], associations: [] };

export function isEmpty(model: UfoaModel) {
  return !model || model.entities.length === 0;
}

export function getGeneralisationSets(model: UfoaModel): GSet[] {
  const gss = model.generalisations.map((g) => g.g_set);
  return R.uniq(gss);
}

export function validateModel(model: UfoaModel): ValidationResult {
  return validateElement(ajv, model, "ufoa-meta#/model");
}
