//@flow

export const port = 3050;
export var baseURL = "";
if (process && process.env.NODE_ENV === "production") {
  baseURL = "http://mdr-simulator.com";
} else {
  baseURL = "http://localhost:" + port;
}

// UFO-A

export const ufoaGetModel = "/ufoa/getModel";
export const ufoaGetGraphics = "/ufoa/getGraphics";
export const ufoaEntityUpdate = "/ufoa/entity/update";
export const ufoaGraphicsSave = "/ufoa/saveGraphics";
export const ufoaGraphicsDelete = "/ufoa/deleteGraphics";
export const ufoaEntityDelete = "/ufoa/entity/delete";
export const generalisationUpdate = "/ufoa/generalisation/update";
export const ufoaGeneralisationDelete = "/ufoa/generalisation/delete";
export const associationUpdate = "/ufoa/association/update";
export const ufoaAssociationDelete = "/ufoa/association/delete";

// UFO-B

export const ufobGetModel = "/ufob/getModel";
export const ufobGetGraphics = "/ufob/getGraphics";
export const ufobGraphicsSave = "/ufob/saveGraphics";
export const ufobEventUpdate = "/ufoa/event/update";
export const ufobSituationUpdate = "/ufoa/situation/update";
export const ufobEventDelete = "/ufob/event/delete";
export const ufobSituationDelete = "/ufob/situation/delete";
