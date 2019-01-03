#!/bin/bash

# IDE start
xdotool key ,
xdotool key E
xdotool key super+shift+6
xdotool key super+5

# Compile start
~/bin/terminal.sh -- "npm run server:watch" &
~/bin/terminal.sh -- "npm run client:watch" &
sleep 0.5
xdotool key super+j
xdotool key super+j
xdotool key Return
xdotool key super+shift+k
xdotool key super+shift+k
xdotool key super+j
xdotool key super+shift+j
xdotool key super+j

# Browser start
xdotool key super+6
chromium "localhost:3333" &
sleep 0.5
xdotool super+shift+j