//@flow

// Imports {{{1
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import type { VisModel } from '../../diagram';
import * as panels from '../../panels';

type Props = {
  ufobVisModel: VisModel
};

type State = {
};

class SimulationPane extends React.Component<State, Props> {
}
  
export function render(ufobVisModel: VisModel) {
  let box = panels.getSimulationBox();
  if (box) {
    ReactDOM.render(<SimulationPane ufobVisModel={ufobVisModel}/>, box);
  }
}


