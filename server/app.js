//@flow

const express = require('express');
const cors = require('cors');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const ufoaMeta = require('./metamodel/ufoa');
const ufobMeta = require('./metamodel/ufob');
const ufoaDB = require('./db/ufoa');
const ufobDB = require('./db/ufob');
const urls = require('./urls');

function clientErrRes(res: any, msg: string): void {
  res.status(400);
  res.send(msg);
}

function serverErrRes(res: any, msg: string): void {
  res.status(500);
  res.send(msg);
}

function okRes(res: any, result: any): void {
  res.status(200);
  res.json(result);
}

var app = express();

app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '../public')));

// Home

app.get('/', (req, res: any) => {
  res.status(200).render('index.html');
});

// UFO-A

app.get(urls.ufoaGetModel, (req, res: any) => {
  ufoaDB.getModel().then(
    model => okRes(res, model),
    error => serverErrRes(res, `Error in loading UFO-A model: ${error}`)
  );
});

// Entities

app.post(urls.ufoaEntityUpdate, (req, res: any) => {
  try {
    const entity = JSON.parse(req.body.entity);
    const validity = ufoaMeta.validateEntity(entity);
    if (validity.errors) {
      serverErrRes(res, "Error in entity update (validity violation)");
    } else { 
      ufoaDB.updateEntity(entity).then(
        result => okRes(res, result),
        error  => serverErrRes(res, `Error in updating entity: ${error}`)
      );
    }
  } catch (SyntaxError) { 
    clientErrRes(res, "Unable to parse `entity` object");
  }
});

app.post(urls.ufoaEntityDelete, (req, res: any) => {
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

// Generalisations

app.post(urls.generalisationUpdate, (req, res: any) => {
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

app.post(urls.ufoaGeneralisationDelete, (req, res: any) => {
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

// Associations

app.post(urls.associationUpdate, (req, res: any) => {
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

app.post(urls.ufoaAssociationDelete, (req, res: any) => {
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

// Graphics 

app.get(urls.ufoaGetGraphics, (req, res: any) => {
  ufoaDB.getGraphics().then(
    graphics => okRes(res, graphics),
    error    => serverErrRes(res, `Error in loading UFO-A model layout: ${error}`)
  );
});

app.post(urls.ufoaGraphicsSave, (req, res: any) => {
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

app.post(urls.ufoaGraphicsDelete, (req, res: any) => {
  ufoaDB.graphicsDelete().then(
    result => okRes(res, result),
    error  => serverErrRes(res, `Error in deleting UFO-A model layout: ${error}`)
  );
});

// UFO-B

// Model

app.get(urls.ufobGetModel, (req, res: any) => {
  ufobDB.getModel().then(
    model => okRes(res, model),
    error => serverErrRes(res, `Error in loading UFO-B model: ${error}`)
  );
});

// Event

app.post(urls.ufobEventUpdate, (req, res: any) => {
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

app.post(urls.ufobEventDelete, (req, res: any) => {
  let ev_id = req.body.ev_id;
  if (!ev_id) {
    res.json({error: "Missing `ev_id`"});
  } else { 
    ufobDB.deleteEvent(ev_id, (result) => {
      res.json(result);
    });
  }
});

// Situation

app.post(urls.ufobSituationUpdate, (req, res: any) => {
  try {
    const situation = JSON.parse(req.body.situation);
    const validity = ufobMeta.validateSituation(situation);
    if (validity.errors) {
      res.json(validity);
    } else { 
      ufobDB.updateSituation(situation, (result) => {
        res.json(result);
      });
    }
  } catch (SyntaxError) { 
    res.json({error: "Unable to parse `situation` object"});
  }
});

app.post(urls.ufobSituationDelete, (req, res: any) => {
  let s_id = req.body.s_id;
  if (!s_id) {
    res.json({error: "Missing `s_id`"});
  } else { 
    ufobDB.deleteSituation(s_id, (result) => {
      res.json(result);
    });
  }
});

// Graphics

app.get(urls.ufobGetGraphics, (req, res: any) => {
  ufobDB.getGraphics().then(graphics => {
    res.json(graphics);
  }, error => res.json( {error: `Server error in loading UFO-B model layout: ${error}` }));
});

app.post(urls.ufobGraphicsSave, (req, res: any) => {
  try {
    const graphics = JSON.parse(req.body.graphics);
    ufobDB.saveGraphics(graphics, (result) => {
      res.json(result);
    });
  } catch (SyntaxError) { 
    res.json({ error: "Unable to parse `graphics` object" });
  }
});

//

module.exports = app;
