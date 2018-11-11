//@flow

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Button } from 'react-bootstrap';
import * as ufoaDB from '../../../db/ufoa';

type Props = {
  network: any
};

export class UfoaNewLayout extends React.Component<Props> {

  relayout = () => {
    ufoaDB.deleteEntityGraphics().then((result) => console.log(result));
    //TODO: reload model
  }

  render() {
    return ( 
      <Button onClick={this.relayout}>New layout</Button>);
  }
}

