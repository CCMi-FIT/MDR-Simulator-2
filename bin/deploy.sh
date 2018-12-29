#!/bin/bash

D="~/rsync/mdr-simulator2/"

npm run server:build
npm run client:build
rsync -rvpLz --delete -e ssh bin dist node_modules public rob@ccmi.fit.cvut.cz:$D
#rsync -rvpLz --delete -e ssh data rob@ccmi.fit.cvut.cz:$D
rsync -rvpLz --ignore-existing -e ssh data rob@ccmi.fit.cvut.cz:$D

