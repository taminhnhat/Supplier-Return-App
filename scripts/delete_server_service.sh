#!/bin/bash

systemctl --user stop mergewall_KHOCTY.service
systemctl --user disable mergewall_KHOCTY.service
sudo rm /home/nhattm/.config/systemd/user/mergewall_KHOCTY.service
systemctl --user daemon-reload
