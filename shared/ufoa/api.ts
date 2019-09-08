import { Id, Graphics } from "../metamodel";
import { UfoaEntity, Generalisation, Association } from "./metamodel";

export const getModelURL = "/ufoa/getModel";

export const getGraphicsURL = "/ufoa/getGraphics";
export const graphicsSaveURL = "/ufoa/saveGraphics";
export const graphicsDeleteURL = "/ufoa/deleteGraphics";
export interface Graphics {
  graphics: Graphics;
}

export const entityUpdateURL = "/ufoa/entity/update";
export interface UpdateEntity {
  entity: UfoaEntity;
}

export const entityDeleteURL = "/ufoa/entity/delete";
export interface DeleteEntity {
  e_id: Id;
}

export const generalisationUpdateURL = "/ufoa/generalisation/update";
export interface UpdateGeneralisation {
  generalisation: Generalisation;
}

export const generalisationDeleteURL = "/ufoa/generalisation/delete";
export interface DeleteGeneralisation {
  g_id: Id;
}

export const associationUpdateURL = "/ufoa/association/update";
export interface UpdateAssociation {
  association: Association;
}

export const associationDeleteURL = "/ufoa/association/delete";
export interface DeleteAssociation {
  a_id: Id;
}
