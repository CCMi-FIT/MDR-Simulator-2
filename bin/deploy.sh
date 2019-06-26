#!/bin/bash

D="~/rsync/mdr-simulator2/"

rm -rf dist/*
npm run server:build
rm -rf public/*
npm run client:build
rsync -rvLz -e ssh bin dist node_modules public rob@ccmi.fit.cvut.cz:$D
#rsync -rvLz -e ssh data rob@ccmi.fit.cvut.cz:$D
rsync -rvLz --ignore-existing -e ssh data rob@ccmi.fit.cvut.cz:$D

