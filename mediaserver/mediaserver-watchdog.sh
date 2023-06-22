#!/bin/sh
PATH="/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/snap/bin"

while true; do
	cd $(pwd)
	MEDIASERVEROK=$(ps ax | grep -v grep | grep -c mediaserver.js)
	PHPOK=$(ps ax | grep -v grep | grep -c fpm)
	APACHEOK=$(ps ax | grep -v grep | grep -c apache)
	if [ "$MEDIASERVEROK" -eq "0" ]; then
		node mediaserver.js &
	fi
	if [ "$PHPOK" -eq "0" ]; then
		php-fpm8
	fi
	if [ "$APACHEOK" -eq "0" ]; then
		apachectl restart
	fi
	sleep 5
done