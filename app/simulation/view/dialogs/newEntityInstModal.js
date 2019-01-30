//@flow

import * as R from 'ramda';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Modal, Panel, Button } from 'react-bootstrap';
import type { UfoaEntity } from '../../../ufoa/metamodel';
import type { EntityInst } from '../../../ufoa-inst/metamodel';
import * as ufoaInstModel from '../../../ufoa-inst/model';
import * as panels from '../../../panels';

type Props = {
  entity: UfoaEntity,
  insts: Array<EntityInst>,
  resolve: any,
  reject: () => void
};

type State = {
  instName: string,
  duplicityError: boolean,
  saveDisabled: boolean
};

class EntityInstNameForm extends React.Component<Props, State> {

  typeahead: any = null;

  constructor(props) {
    super(props);
    this.state = {
      instName: "",
      duplicityError: false,
      saveDisabled: true
    };
  }

  // Operations {{{1

  setInstName = (val: string) => {
    this.setState((state: State, props: Props) => {
      const state2 = R.mergeDeepRight(state, { instName: val }); 
      if (props.insts.find(ei => ei.ei_name === val)) {
        return R.mergeDeepRight(state2, { 
          duplicityError: true,
          saveDisabled: true });
      } else {
        return R.mergeDeepRight(state2, { 
          duplicityError: false,
          saveDisabled: false });
      }
    });
  }

  save = () => {
    panels.disposeModal();
    const res = ufoaInstModel.newEntityInst(this.props.entity, this.state.instName);
    this.props.resolve(res);
  }
  
  // Rendering {{{1

  renderInput() {
    return (
      <div className="form-group"> 
        <label>Name</label>
        <input className="form-control"
          value={this.state.instName}
          onChange={event => this.setInstName(event.currentTarget.value)}
        />
      </div>
    );
  }

  renderError() {
    return (
      <div>
        This name is already present.
      </div>
    );
  }
  
  renderButtons() {
    return (
      <div className="form-group"> 
        <Button 
          className="btn-primary" 
          onClick={this.save} 
          disabled={this.state.saveDisabled}>
          Set name
        </Button>
      </div>);
  }

  render() {
    return ( 
      <Modal.Dialog>
          <Panel className="dialog">
            <Panel.Heading><strong>Enter instance name for {this.props.entity.e_name}</strong></Panel.Heading>
            <Panel.Body collapsible={false}>
              {this.renderInput()}
              {this.state.duplicityError ? this.renderError() : ""}
              {this.renderButtons()}
            </Panel.Body>
          </Panel>
      </Modal.Dialog>);
  }
}

// }}}1

export function renderPm(insts: Array<EntityInst>, entity: UfoaEntity): Promise<any> {
  return new Promise((resolve, reject) => {
    let panel = panels.getModal();
    if (panel) {
      ReactDOM.render(<EntityInstNameForm insts={insts} entity={entity} resolve={resolve} reject={reject}/>, panel);
      panels.showModal();
    }
  });
}

