//@flow

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Modal, Panel, Button } from 'react-bootstrap';
import type { UfoaEntity } from '../../../ufoa/metamodel';
import type { EntityInst } from '../../../ufoa-inst/metamodel';
import * as panels from '../../../panels';

type Props = {
  insts: Array<EntityInst>,
  choiceType: string,
  entity: UfoaEntity,
  resolve: any,
  reject: () => void
};

type State = {
  chosenInstName: string,
};

class ChooseEntityInstForm extends React.Component<Props, State> {

  constructor(props) {
    super(props);
    this.state = {
      chosenInstName: props.insts[0].ei_name
    };
  }

  // Operations {{{1

  choose = () => {
    panels.disposeModal();
    console.log(this.state.chosenInstName);
    console.log(this.props.insts);
    const chosenInst = this.props.insts.find(ei => ei.ei_name === this.state.chosenInstName);
    if (!chosenInst) {
      console.error(`Something is very wrong in ChooseEntityInstForm: ${this.state.chosenInstName} disappeared from props.insts`);
      this.props.reject();
    } else {
      this.props.resolve(chosenInst);
    }
  }
  
  // Rendering {{{1

  renderSelection() {
    return (
      <div className="form-group"> 
        <label>Available instances</label>
        <select className="form-control"
          value={this.state.chosenInstName}
          onChange={event => this.setState({ chosenInstName: event.currentTarget.value })}
        >{this.props.insts.map(ei => <option key={ei.ei_name}>{ei.ei_name}</option>)}</select>
      </div>
    );
  }

  renderButtons() {
    return (
      <div className="form-group"> 
        <Button 
          className="btn-primary" 
          onClick={this.choose}
        >Choose</Button>
      </div>);
  }

  render() {
    return ( 
      <Modal.Dialog>
          <Panel className="dialog">
            <Panel.Heading>Choose instance of <strong>{this.props.entity.e_name}</strong> as <strong>{this.props.choiceType}</strong></Panel.Heading>
            <Panel.Body collapsible={false}>
              {this.renderSelection()}
              {this.renderButtons()}
            </Panel.Body>
          </Panel>
      </Modal.Dialog>);
  }
}

// }}}1

export function renderPm(insts: Array<EntityInst>, entity: UfoaEntity, choiceType: string): Promise<any> {
  return new Promise((resolve, reject) => {
    let panel = panels.getModal();
    if (panel) {
      ReactDOM.render(<ChooseEntityInstForm insts={insts} choiceType={choiceType} entity={entity} resolve={resolve} reject={reject}/>, panel);
      panels.showModal();
    }
  });
}

