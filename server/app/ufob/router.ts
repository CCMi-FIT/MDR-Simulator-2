import { Request, Response } from "express";
import * as express from "express";
import * as ufobMeta from "./metamodel";
import { clientErrRes, serverErrRes, okRes } from "../router";
import * as ufobDB from "./db";
import * as api from "./api";

var ufobRouter = express.Router();

// Model {{{1

ufobRouter.get(api.getModelURL, (req: Request, res: Response) => {
  ufobDB.getModel().then(
    model => okRes(res, model),
    error => serverErrRes(res, `Error in loading UFO-B model: ${error}`)
  );
});

// Event {{{1

ufobRouter.post(api.eventUpdateURL, (req: Request, res: Response) => {
  try {
    const event = JSON.parse(req.body.event);
    const validity = ufobMeta.validateEvent(event);
    if (validity.errors) {
      serverErrRes(res, "Validity error on Event update");
    } else { 
      ufobDB.updateEvent(event).then(
        result => okRes(res, result),
        error  => serverErrRes(res, `Error in updating event: ${error}`)
      );
    }
  } catch (SyntaxError) { 
    clientErrRes(res, "Unable to parse `event` object");
  }
});

ufobRouter.post(api.eventDeleteURL, (req: Request, res: Response) => {
  let ev_id = req.body.ev_id;
  if (!ev_id) {
    res.json({error: "Missing `ev_id`"});
  } else { 
    ufobDB.deleteEvent(ev_id).then(
      result => okRes(res, result),
      error  => serverErrRes(res, error)
    );
  }
});

// Situation {{{1

ufobRouter.post(api.situationUpdateURL, (req: Request, res: Response) => {
  try {
    const situation = JSON.parse(req.body.situation);
    const validity = ufobMeta.validateSituation(situation);
    if (validity.errors) {
      res.json(validity);
    } else { 
      ufobDB.updateSituation(situation).then(
        result => okRes(res, result),
        error  => serverErrRes(res, error)
      );
    }
  } catch (SyntaxError) { 
    res.json({error: "Unable to parse `situation` object"});
  }
});

ufobRouter.post(api.situationDeleteURL, (req: Request, res: Response) => {
  let s_id = req.body.s_id;
  if (!s_id) {
    res.json({error: "Missing `s_id`"});
  } else { 
    ufobDB.deleteSituation(s_id).then(
      result => okRes(res, result),
      error  => serverErrRes(res, error)
    );
  }
});

// Graphics {{{1

ufobRouter.get(api.getGraphicsURL, (req: Request, res: Response) => {
  ufobDB.getGraphics().then(
    graphics => res.json(graphics),
    error => res.json( {error: `Server error in loading UFO-B model layout: ${error}` })
  );
});

ufobRouter.post(api.graphicsSaveURL, (req: Request, res: Response) => {
  try {
    const graphics = JSON.parse(req.body.graphics);
    ufobDB.saveGraphics(graphics).then(
      result => okRes(res, result),
      error  => serverErrRes(res, error)
    );
  } catch (SyntaxError) { 
    res.json({ error: "Unable to parse `graphics` object" });
  }
});

export default ufobRouter;