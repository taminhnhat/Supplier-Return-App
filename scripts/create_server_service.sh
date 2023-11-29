#!/bin/bash

sudo cp mergewall_KHOCTY.service /home/nhattm/.config/systemd/user
systemctl --user daemon-reload
systemctl --user enable mergewall_KHOCTY.service
systemctl --user start mergewall_KHOCTY.service
