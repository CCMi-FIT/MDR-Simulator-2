#!/bin/bash

# Compile start
~/bin/terminal.sh -- "npm run server:watch" &
sleep 0.5
~/bin/terminal.sh -- "npm run client:watch" &
sleep 0.5
xdotool key super+j
xdotool key super+j
xdotool key Return
xdotool key super+shift+j
