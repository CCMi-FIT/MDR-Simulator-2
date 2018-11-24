//@flow

export const port = 3050;
export var baseURL;
if (process && process.env.NODE_ENV === "production") {
  baseURL = "http://mdr-simulator.com";
} else {
  baseURL = "http://localhost:" + port;
}

// UFO-A

export const ufoaGetModel = "/ufoa/getModel";
export const ufoaGetEntityGraphics = "/ufoa/getEntityGraphics";
export const ufoaEntityUpdate = "/ufoa/entity/update";
export const ufoaEntityGraphicsSave = "/ufoa/entity/graphics/save";
export const ufoaEntityGraphicsDelete = "/ufoa/entity/graphics/delete";
export const ufoaEntityDelete = "/ufoa/entity/delete";
export const generalisationUpdate = "/ufoa/generalisation/update";
export const ufoaGeneralisationDelete = "/ufoa/generalisation/delete";
export const associationUpdate = "/ufoa/association/update";
export const ufoaAssociationDelete = "/ufoa/association/delete";

// UFO-B

export const ufobGetModel = "/ufob/getModel";
