#!/bin/bash

D="~/rsync/mdr-simulator2/"

rsync -rvpLz --delete -e ssh bin dist node_modules public rob@ccmi.fit.cvut.cz:$D
rsync -rvpLz --ignore-existing -e ssh data rob@ccmi.fit.cvut.cz:$D

