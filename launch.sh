#sudo -u pi epiphany-browser -a -i --profile ~/.config ~/hotsign/HotSign.html --display=:0 &
epiphany-browser -a -i --profile ~/.config ~/hotsign/HotSign.html --display=:0 &
sleep 45s;
xte "key F11" -x:0
