//@flow

import * as R from 'ramda';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Modal, Panel, Button } from 'react-bootstrap';
import { Confirm } from 'react-confirm-bootstrap';
import type { Situation, Disposition } from '../../../metamodel/ufob';
import * as ufobMeta from '../../../metamodel/ufob';
import * as ufobDB from '../../../db/ufob';
import type { VisModel } from '../../rendering';
import * as panels from '../../panels';

type Props = {
  disposition: Disposition,
  resolve: any,
  reject: () => void
};

type State = {
  disposition2: Disposition,
  saveDisabled: boolean
};

class DispositionForm extends React.Component<Props, State> {

  constructor(props) {
    super(props);
    this.state = {
      disposition2: R.clone(props.disposition),
      saveDisabled: true
    };
    //console.dir(this.props);
    //console.dir(this.state);
  }

  setAttr = (attr: string, event: any) => {
    let val = event.currentTarget.value;
    this.setState((state: State, props: Props) => {
      let aOrig = props.disposition;
      let stateNew = 
        attr === "d_text" ?
          R.mergeDeepRight(state, { disposition2: { d_text: val }})
        : (() => {
            console.error(`DispositionForm: setAttr of ${attr} not implemented`);
            return R.mergeDeepRight(state, {});
          })();
      return R.mergeDeepRight(stateNew, { saveDisabled: R.equals(aOrig, stateNew.disposition2) });
    });
  }

  save = () => {
    let dOrig = this.props.disposition;
    let dNew = this.state.disposition2;
    panels.hideModal();
    if (!R.equals(dNew, dOrig)) {
      this.props.resolve(this.state.disposition2);
    } else {
      this.props.reject();
    }
    panels.hideModal();
  }
  
  //delete = () => {
    //ufobDB.deleteDisposition(this.props.situation.s_id, d.d_text).then(() => {
      //panels.hideDialog();
      //panels.displayInfo("Disposition deleted.");
    //}, (error) => panels.displayError("Disposition delete failed: " + error));
  //}

  renderDispositionText() {
    return (
      <div className="form-group">
        <textarea className="form-control" type="text" value={this.state.disposition2.d_text} onChange={(e) => this.setAttr("d_text", e)} rows="5" cols="30"/>
      </div>);
  }

  renderButtons() {
    return (
      <div className="form-group row col-sm-12"> 
        <div className="col-sm-6">
          <Button className="btn-primary" onClick={this.save} disabled={this.state.saveDisabled}>Update disposition</Button>
        </div>
        <div className="col-sm-6">
          <Button className="btn-danger" onClick={() => panels.hideModal()}>Cancel</Button>
        </div>
        {/*<div className="col-sm-6 text-right">
          {this.renderButtonDelete()}
        </div>*/}
      </div>);
  }

  //renderButtonDelete() {
    //return (
      //<Confirm
        //onConfirm={this.delete}
        //body={`Are you sure you want to delete "${this.props.disposition.d_text}"?`}
        //confirmText="Confirm Delete"
        //title="Deleting Disposition">
        //<Button className="btn-danger">Delete disposition</Button>
      //</Confirm>);
  //}

  render() {
    return ( 
      <Modal.Dialog>
          <Panel className="dialog">
            <Panel.Heading><strong>Disposition</strong></Panel.Heading>
            <Panel.Body collapsible={false}>
              {this.renderDispositionText()}
              {this.renderButtons()}
            </Panel.Body>
          </Panel>
      </Modal.Dialog>);
  }
}

export function render(disposition: Disposition): Promise<any> {
  return new Promise((resolve, reject) => {
    let panel = panels.getModal();
    if (panel) {
      ReactDOM.render(<DispositionForm disposition={disposition} resolve={resolve} reject={reject}/>, panel);
      panels.showModal();
    }
  });
}

