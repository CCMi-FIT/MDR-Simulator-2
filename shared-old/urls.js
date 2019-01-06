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
export const ufoaEntityUpdate = "/ufoa/entity/update";
export const ufoaEntityDelete = "/ufoa/entity/delete";
export const ufoaGeneralisationUpdate = "/ufoa/generalisation/update";
export const ufoaGeneralisationDelete = "/ufoa/generalisation/delete";
export const ufoaAssociationUpdate = "/ufoa/association/update";
export const ufoaAssociationDelete = "/ufoa/association/delete";

// UFO-A Graphics

export const ufoaGetGraphics = "/ufoa/getGraphics";
export const ufoaGraphicsSave = "/ufoa/saveGraphics";
export const ufoaGraphicsDelete = "/ufoa/deleteGraphics";

// UFO-B

export const ufobGetModel = "/ufob/getModel";
export const ufobEventUpdate = "/ufoa/event/update";
export const ufobSituationUpdate = "/ufoa/situation/update";
export const ufobEventDelete = "/ufob/event/delete";
export const ufobSituationDelete = "/ufob/situation/delete";

// UFO-B Graphics

export const ufobGetGraphics = "/ufob/getGraphics";
export const ufobGraphicsSave = "/ufob/saveGraphics";

// Scenarios

export const scenariosGet = "/scenarios/get";
export const scenarioUpdate = "/scenarios/update";
export const scenarioDelete = "/scenarios/delete";
