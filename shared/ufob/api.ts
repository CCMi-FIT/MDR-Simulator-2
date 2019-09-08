import { Id, Graphics } from "../metamodel";
import { UfobEvent, Situation } from "./metamodel";

export const getModelURL = "/ufob/getModel";

export const getGraphicsURL = "/ufob/getGraphics";
export const graphicsSaveURL = "/ufob/saveGraphics";
export interface Graphics {
  graphics: Graphics;
}

export const eventUpdateURL = "/ufob/event/update";
export interface UpdateEvent {
  event: UfobEvent;
}

export const eventDeleteURL = "/ufob/event/delete";
export interface DeleteEvent {
  ev_id: Id;
}

export const situationUpdateURL = "/ufob/situation/update";
export interface UpdateSituation {
  situation: Situation;
}

export const situationDeleteURL = "/ufob/situation/delete";
export interface DeleteSituation {
  s_id: Id;
}
