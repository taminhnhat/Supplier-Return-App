#!/bin/bash

sudo echo '' > /var/log/mergewall/gateway.log
sudo chmod 744 /var/log/mergewall/gateway.log
sudo node /home/ubuntu/Supplier-Return-App/server.js > /var/log/mergewall/gateway.log