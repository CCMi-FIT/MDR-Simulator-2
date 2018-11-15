//@flow

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Button } from 'react-bootstrap';
import type { UfoaModel } from '../../../metamodel/ufoa';
import * as r from '../canvas/rendering';
import * as ufoaDB from '../../../db/ufoa';
import * as panels from '../../panels';

type Props = {
  ufoaModel: UfoaModel,
  network: any
};

export class UfoaNewLayout extends React.Component<Props> {

  relayout = () => {
    ufoaDB.deleteEntityGraphics().then(result => {
      let ufoaVisModel = r.model2vis(this.props.ufoaModel, {} );
      this.props.network.setData(ufoaVisModel);
    }, error => panels.displayError("Layout reset failed: " + error));
  }

  render() {
    return ( 
      <Button title="New layout" onClick={this.relayout}><i className="glyphicon glyphicon-asterisk"></i></Button>);
  }
}

