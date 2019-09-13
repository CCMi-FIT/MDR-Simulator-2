#!/bin/bash

D="~/rsync/mdr-simulator2/"

rsync -rvLz -e ssh bin server node_modules rob@ccmi.fit.cvut.cz:$D
#rsync -rvLz -e ssh data rob@ccmi.fit.cvut.cz:$D
#rsync -rvLz --ignore-existing -e ssh data rob@ccmi.fit.cvut.cz:$D

