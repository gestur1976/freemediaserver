#!/bin/sh
export PATH='/usr/local/apache2/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin'

if [ -f /firstrun ]; then
    echo "Preparing files for the first run..."

    nodejs-16.0.sh
#   Install mediaserver app, web files and set permissions to www-data.

#   Mediaserver
    cd /usr/local/mediaserver
    ./softlinks.sh
    yarn install
    chown -R www-data:www-data ../mediaserver

#   Web files
    mkdir -p /var/www
#   cd /var/wwww
#   tar xvfz /opt/html.tar.gz
    cp -R /opt/html /var/www/
    chown -R www-data:www-data /var/www/html

    rm /firstrun
    rm -rf /opt/*
fi
# shellcheck disable=SC2164
cd /usr/local/mediaserver
./mediaserver-watchdog.sh >/dev/null 2>/dev/null &

#       Every day, all downloaded media gets deleted to save space.
while true; do
        sleep 7200
#        cd /usr/local/apache2/htdocs/; rm *.mp3 *.m4a *.mp4 *.webm *.log *.err 2> /dev/null > /dev/null
done