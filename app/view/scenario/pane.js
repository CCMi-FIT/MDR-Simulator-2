//@flow

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import type { VisModel } from '../rendering';
import { Button, Panel } from 'react-bootstrap';
import * as panels from '../panels';
import type { Scenario } from '../../metamodel/scenario';
import * as db from  '../../db/scenario';

type Props = {
  ufobVisModel: VisModel
};

type State = {
  openScenario: ?Scenario
};

class ScenarioBox extends React.Component<Props, State> {

  constructor(props) {
    super(props);
    this.state = {
      openScenario: null
    };
  }

  newScenario = () => {
    db.newScenario().then(
      newSc => this.setState({ openScenario: newSc }),
      error => panels.displayError(error)
    );
  }

  renderToolbar = () => {
    return (
      <div style={{paddingTop: "5px", paddingBottom: "5px"}}>
        <div className="btn-group" role="group">
          <Button className="btn-default">Load</Button>
          <Button className="btn-default" onClick={() => this.newScenario()}>New</Button>
        </div>
      </div>
    );
  }

  renderEditor = () => {
    const scName = this.state.openScenario ? this.state.openScenario.sc_name : "";
    return (
      <Panel>
        <Panel.Heading><strong>{scName}</strong></Panel.Heading>
        <Panel.Body collapsible={false}>
        </Panel.Body>
      </Panel>
    );
  }

  render() {
    return ( 
      <div className="container-fluid nopadding">
        {this.renderToolbar()}
        {this.state.openScenario ? this.renderEditor() : null}
      </div>
    );
  }

}

export function render(ufobVisModel: VisModel) {
  let box = panels.getScenariosBox();
  if (box) {
    ReactDOM.render(<ScenarioBox ufobVisModel={ufobVisModel}/>, box);
  }
}


