// @flow

import $ from "jquery";
import { Promise } from 'es6-promise';
import * as ufoa from "./ufoa/main";
import * as ufob from "./ufob/main";
import * as simulation from "./simulation/main";
import * as panels from "./panels";
import * as ufoaDB from "./ufoa/db";
import * as ufobDB from "./ufob/db";

$(window).resize(function() {
  panels.fitPanes();
});

$(document).ready(function() {
  panels.fitPanes();
  Promise.all([
    ufoaDB.loadModel(),
    ufoaDB.loadGraphics(),
    ufobDB.loadModel(),
    ufobDB.loadGraphics()]).then(
      ([ufoaModel, ufoaEntityGraphics, ufobModel, ufobGraphics]) => {
        panels.hideMsg();
        ufoa.initialise(ufoaModel, ufoaEntityGraphics);
        let ufobVisModel = ufob.initialise(ufobModel, ufobGraphics);
        simulation.initialise(ufobVisModel);
      }, 
      error => panels.displayError("Error loading model: " + error)
    );
});

