//@flow

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Button } from 'react-bootstrap';
import * as panels from '../panels';

type Props = {
  network: any,
  db: any
};

export class SaveLayout extends React.Component<Props> {

  save = () => {
    var graphics = this.props.network.getPositions();
    this.props.db.saveGraphics(graphics).then(() => {
      panels.displayInfo("Diagram layout saved.");
    }, (error) => panels.displayError("Diagram layout saving failed: " + error));
  }

  render() {
    return ( 
      <Button title="Save diagram layout" onClick={this.save}><i className="glyphicon glyphicon-save"></i></Button>);
  }
}

