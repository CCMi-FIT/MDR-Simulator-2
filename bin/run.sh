#!/bin/bash

echo "Starting MDR Simulator 2 server..."
export NODE_ENV="production"
cd /srv/nodejs/mdr-simulator2/dist
/usr/bin/node server
