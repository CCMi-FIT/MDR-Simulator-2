//@flow

var express = require('express');
var cors = require('cors');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var ufoaMeta = require('./metamodel/ufoa');
var ufobMeta = require('./metamodel/ufob');
var ufoaDB = require('./db/ufoa');
var ufobDB = require('./db/ufob');
var urls = require('./urls');

var app = express();

app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '../public')));

// Home

app.get('/', (req, res: any) => {
  res.render('index.html');
});

// UFO-A

app.get(urls.ufoaGetModel, (req, res: any) => {
  ufoaDB.getModel().then(model => {
    res.json(model);
  }, (error) => {
    res.json( {error: `Server error in loading UFO-A model: ${error}` });
  });
});

app.get(urls.ufoaGetGraphics, (req, res: any) => {
  ufoaDB.getGraphics().then(graphics => {
    res.json(graphics);
  }, (error) => {
    res.json( {error: `Server error in loading UFO-A model layout: ${error}` });
  });
});

app.post(urls.ufoaGraphicsSave, (req, res: any) => {
  try {
    const graphics = JSON.parse(req.body.graphics);
    ufoaDB.saveGraphics(graphics, (result) => {
      res.json(result);
    });
  } catch (SyntaxError) { 
    res.json({ error: "Unable to parse `graphics` object" });
  }
});

app.post(urls.ufoaGraphicsDelete, (req, res: any) => {
  ufoaDB.graphicsDelete().then((result) => {
    res.json(result);
  }, (error) => {
    res.json( {error: `Server error in deleting UFO-A model layout: ${error}` });
  });
});

// Entities

app.post(urls.ufoaEntityUpdate, (req, res: any) => {
  try {
    const entity = JSON.parse(req.body.entity);
    const validity = ufoaMeta.validateEntity(entity);
    if (validity.errors) {
      res.json(validity);
    } else { 
      ufoaDB.updateEntity(entity, (result) => {
        res.json(result);
      });
    }
  } catch (SyntaxError) { 
    res.json({error: "Unable to parse `entity` object"});
  }
});

app.post(urls.ufoaEntityDelete, (req, res: any) => {
  let e_id = req.body.e_id;
  if (!e_id) {
    res.json({error: "Missing `e_id`"});
  } else { 
    ufoaDB.deleteEntity(e_id, (result) => {
      res.json(result);
    });
  }
});

// Generalisations

app.post(urls.generalisationUpdate, (req, res: any) => {
  let generalisation = {};
  try {
    const generalisation = JSON.parse(req.body.generalisation);
    const validity = ufoaMeta.validateGeneralisation(generalisation);
    if (validity.errors) {
      res.json(validity);
    } else { 
      ufoaDB.updateGeneralisation(generalisation, (result) => {
        res.json(result);
      });
    }
  } catch (SyntaxError) { 
    res.json({error: "Unable to parse `generalisation` object"});
  }
});

app.post(urls.ufoaGeneralisationDelete, (req, res: any) => {
  const g_id = req.body.g_id;
  if (!g_id) {
    res.json({error: "Missing `g_id`"});
  } else { 
    ufoaDB.deleteGeneralisation(g_id, (result) => {
      res.json(result);
    });
  }
});

// Associations

app.post(urls.associationUpdate, (req, res: any) => {
  try {
    const assoc = JSON.parse(req.body.association);
    const validity = ufoaMeta.validateAssociation(assoc);
    if (validity.errors) {
      res.json(validity);
    } else { 
      ufoaDB.updateAssociation(assoc, (result) => {
        res.json(result);
      });
    }
  } catch (SyntaxError) { 
    res.json({error: "Unable to parse `association` object"});
  }
});

app.post(urls.ufoaAssociationDelete, (req, res: any) => {
  const a_id = req.body.a_id;
  if (!a_id) {
    res.json({error: "Missing `a_id`"});
  } else { 
    ufoaDB.deleteAssociation(a_id, (result) => {
      res.json(result);
    });
  }
});

// UFO-B

// Model

app.get(urls.ufobGetModel, (req, res: any) => {
  ufobDB.getModel().then(model => {
    res.json(model);
  }, (error) => {
    res.json( {error: `Server error in loading UFO-B model: ${error}` });
  });
});

app.get(urls.ufobGetGraphics, (req, res: any) => {
  ufobDB.getGraphics().then(graphics => {
    res.json(graphics);
  }, (error) => {
    res.json( {error: `Server error in loading UFO-B model layout: ${error}` });
  });
});

app.post(urls.ufobGraphicsSave, (req, res: any) => {
  try {
    const graphics = JSON.parse(req.body.graphics);
    ufoaDB.saveGraphics(graphics, (result) => {
      res.json(result);
    });
  } catch (SyntaxError) { 
    res.json({ error: "Unable to parse `graphics` object" });
  }
});

// Event

app.post(urls.ufobEventUpdate, (req, res: any) => {
  try {
    const event = JSON.parse(req.body.event);
    const validity = ufobMeta.validateEvent(event);
    if (validity.errors) {
      res.json(validity);
    } else { 
      ufobDB.updateEvent(event, (result) => {
        res.json(result);
      });
    }
  } catch (SyntaxError) { 
    res.json({error: "Unable to parse `event` object"});
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
  let ev_id = req.body.ev_id;
  if (!ev_id) {
    res.json({error: "Missing `ev_id`"});
  } else { 
    ufobDB.deleteSituation(ev_id, (result) => {
      res.json(result);
    });
  }
});



module.exports = app;
