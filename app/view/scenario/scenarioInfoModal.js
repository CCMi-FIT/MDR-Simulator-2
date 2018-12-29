//@flow

import * as R from 'ramda';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Modal, Button, Panel } from 'react-bootstrap';
import * as panels from '../panels';
import type { Scenario } from '../../metamodel/scenario';

type Props = {
  scenario: Scenario,
  resolve: any,
  reject: () => void
};

type State = {
  scenario2: Scenario,
  saveDisabled: boolean
};

class ScenarioForm extends React.Component<Props, State> {

  constructor(props) {
    super(props);
    this.state = {
      scenario2: R.clone(props.scenario),
      saveDisabled: true
    };
  }
  
  setAttr = (attr: string, val: any) => {
    this.setState((state: State, props: Props) => {
      let newSc: Scenario = R.mergeDeepRight(state.scenario2, { [attr]: val });
      return {
        scenario2: newSc,
        saveDisabled: R.equals(props.scenario, newSc)
      };
    });
  }

  save = () => {
    let scOrig = this.props.scenario;
    let scNew = this.state.scenario2;
    panels.hideModal();
    if (!R.equals(scNew, scOrig)) {
      this.props.resolve(scNew);
    } else {
      this.props.reject();
    }
    panels.hideModal();
  }

  renderName() {
    return (
      <div className="form-group">
        <label>Name</label>
        <input 
          className="form-control"
          value={this.state.scenario2.sc_name}
          onChange={evt => this.setAttr("sc_name", evt.currentTarget.value)}
        />
      </div>);
  }

  renderDescription() {
    return (
      <div className="form-group">
        <label>Description</label>
        <textarea 
          className="form-control"
          value={this.state.scenario2.sc_desc}
          onChange={evt => this.setAttr("sc_desc", evt.currentTarget.value)}
        />
      </div>);
  }
  
  renderButtons() {
    return (
      <div className="form-group row col-sm-12"> 
        <div className="col-sm-4">
          <Button 
            className="btn-primary" 
            onClick={this.save} 
            disabled={this.state.saveDisabled}
          >Update Scenario</Button>
        </div>
        <div className="col-sm-4">
          <Button className="btn-warning" onClick={() => panels.hideModal()}>Cancel</Button>
        </div>
      </div>);
  }

  render() {
    return ( 
      <Modal.Dialog>
          <Panel className="dialog">
            <Panel.Heading><strong>Scenario</strong></Panel.Heading>
            <Panel.Body collapsible={false}>
              {this.renderName()}
              {this.renderDescription()}
              {this.renderButtons()}
            </Panel.Body>
          </Panel>
      </Modal.Dialog>);
  }
}

export function render(scenario: Scenario): Promise<any> {
  return new Promise((resolve, reject) => {
    let panel = panels.getModal();
    if (panel) {
      ReactDOM.render(<ScenarioForm scenario={scenario} resolve={resolve} reject={reject}/>, panel);
      panels.showModal();
    }
  });
}

