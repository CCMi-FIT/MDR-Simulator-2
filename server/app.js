//@flow

var express = require('express');
var cors = require('cors');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var ufoaMeta = require('./metamodel/ufoa');
var entityGraphics = require('./metamodel/entityGraphics');
var ufoaDB = require('./db/ufoa');
var urls = require('./urls');

var app = express();

app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '../public')));

app.get('/', (req, res: any) => {
  res.render('index.html');
});

// Model

app.get(urls.ufoaGetModel, (req, res: any) => {
  ufoaDB.getModel().then((model) => {
    res.setHeader('Content-Type', 'application/json');
    res.json(model);
  }, (error) => {
    res.json( {error: `Server error in loading UFO-A model: ${error}` });
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
  }
  catch (SyntaxError) { 
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

 app.post(urls.ufoaEntityGraphicsSave, (req, res: any) => {
  try {
    const entityGraphics = JSON.parse(req.body.entityGraphics);
    ufoaDB.saveEntityGraphics(entityGraphics, (result) => {
      res.json(result);
    });
  }
  catch (SyntaxError) { 
    res.json({ error: "Unable to parse `entityGraphics` object" });
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
  }
  catch (SyntaxError) { 
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
  }
  catch (SyntaxError) { 
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

module.exports = app;
