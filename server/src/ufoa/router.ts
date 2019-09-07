import { Request, Response } from "express";
import * as express from "express";
import { UfoaEntity } from "./metamodel";
import * as ufoaMeta from "./metamodel";
import { clientErrRes, serverErrRes, okRes } from "../router";
import * as ufoaDB from "./db";
import * as urls from "./urls";

var ufoaRouter = express.Router();
// Model {{{1

ufoaRouter.get(urls.ufoaGetModel, (req: Request, res: Response) => {
  ufoaDB.getModel().then(
    model => okRes(res, model),
    error => serverErrRes(res, `Error in loading UFO-A model: ${error}`)
  );
});

// Entities {{{1

ufoaRouter.post(urls.ufoaEntityUpdate, (req: Request, res: Response) => {
  try {
    const entity: UfoaEntity | null = JSON.parse(req.body.entity);
    if (!entity) {
      throw(new SyntaxError("Missing entity in request body"));
    }
    const validity = ufoaMeta.validateEntity(entity);
    if (validity.errors) {
      serverErrRes(res, "Error in entity update (validity violation)");
    } else { 
      ufoaDB.updateEntity(entity).then(
        result => okRes(res, result),
        error  => serverErrRes(res, `Error in updating entity: ${error}`)
      );
    }
  } catch (error) { 
    clientErrRes(res, error);
  }
});

ufoaRouter.post(urls.ufoaEntityDelete, (req: Request, res: Response) => {
  let e_id = req.body.e_id;
  if (!e_id) {
    clientErrRes(res, "Missing `e_id`");
  } else { 
    ufoaDB.deleteEntity(e_id).then(
      result => okRes(res, result),
      error  => serverErrRes(res, `Error in deleting entity: ${error}`)
    );
  }
});

// Generalisations {{{1

ufoaRouter.post(urls.ufoaGeneralisationUpdate, (req: Request, res: Response) => {
  try {
    const generalisation = JSON.parse(req.body.generalisation);
    const validity = ufoaMeta.validateGeneralisation(generalisation);
    if (validity.errors) {
      serverErrRes(res, "Validity error on generalisation update");
    } else { 
      ufoaDB.updateGeneralisation(generalisation).then(
        result => okRes(res, result),
        error  => serverErrRes(res, `Error in updating generalisation: ${error}`) 
      );
    }
  } catch (SyntaxError) { 
    clientErrRes(res, "Unable to parse `generalisation` object");
  }
});

ufoaRouter.post(urls.ufoaGeneralisationDelete, (req: Request, res: Response) => {
  const g_id = req.body.g_id;
  if (!g_id) {
    clientErrRes(res, "Missing `g_id`");
  } else { 
    ufoaDB.deleteGeneralisation(g_id).then(
      result => okRes(res, result),
      error  => serverErrRes(res, `Error in deleting generalisation: ${error}`)
    );
  }
});

// Associations {{{1

ufoaRouter.post(urls.ufoaAssociationUpdate, (req: Request, res: Response) => {
  try {
    const assoc = JSON.parse(req.body.association);
    const validity = ufoaMeta.validateAssociation(assoc);
    if (validity.errors) {
      serverErrRes(res, "Validity error on association update");
    } else { 
      ufoaDB.updateAssociation(assoc).then(
        result => okRes(res, result),
        error  => serverErrRes(res, `Error in updating association: ${error}`)
      );
    }
  } catch (SyntaxError) { 
    clientErrRes(res, "Unable to parse `association` object");
  }
});

ufoaRouter.post(urls.ufoaAssociationDelete, (req: Request, res: Response) => {
  const a_id = req.body.a_id;
  if (!a_id) {
    clientErrRes(res, "Missing `a_id`");
  } else { 
    ufoaDB.deleteAssociation(a_id).then(
      result => okRes(res, result),
      error  => serverErrRes(res, `Error in deleting association: ${error}`)
    );
  }
});

// Graphics {{{1

ufoaRouter.get(urls.ufoaGetGraphics, (req: Request, res: Response) => {
  ufoaDB.getGraphics().then(
    graphics => okRes(res, graphics),
    error    => serverErrRes(res, `Error in loading UFO-A model layout: ${error}`)
  );
});

ufoaRouter.post(urls.ufoaGraphicsSave, (req: Request, res: Response) => {
  try {
    const graphics = JSON.parse(req.body.graphics);
    ufoaDB.saveGraphics(graphics).then(
      result => okRes(res, result),
      error  => serverErrRes(res, error)
    );
  } catch (SyntaxError) { 
    clientErrRes(res, "Unable to parse `graphics` object");
  }
});

ufoaRouter.post(urls.ufoaGraphicsDelete, (req: Request, res: Response) => {
  ufoaDB.graphicsDelete().then(
    result => okRes(res, result),
    error  => serverErrRes(res, `Error in deleting UFO-A model layout: ${error}`)
  );
});

export default ufoaRouter;