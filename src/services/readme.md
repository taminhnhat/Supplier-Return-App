# SERVICE
Create services
```sh
#
$ sudo cp ~/Supplier-Return-App/service/wall-gateway.service /etc/systemd/system
#
sudo chmod 744 ~/Supplier-Return-App/service/wall-gateway.sh
#
sudo chmod 664 /etc/systemd/system/wall-gateway.service
# reload service
systemctl daemon-reload
# enable service
systemctl enable wall-gateway.service
# start service
systemctl start wall-gateway.service
# Reboot
sudo reboot
```
Working with service
```sh
# start
$ systemctl start wall-gateway.service
# stop
$ systemctl stop wall-gateway.service
# restart
$ systemctl restart wall-gateway.service
# get status
$ systemctl status wall-gateway.service
# debug
$ sudo journalctl --unit=wall-gateway
$ sudo journalctl --unit=wall-gpio
```
View service logs
```sh
cat /var/log/wall-controller/gateway-process.log
```

Chmod options
|#|rwx|
|-|-|
|7|rwx|
|6|rw-|
|5|r-x|
|4|r--|
|3|-wx|
|2|-w-|
|1|--x|
|0|---|

Remove service
```sh
systemctl stop [servicename]
systemctl disable [servicename]
rm /etc/systemd/system/[servicename] # and symlinks that might be related
rm /usr/lib/systemd/system/[servicename] # and symlinks that might be related
systemctl daemon-reload
systemctl reset-failed
```