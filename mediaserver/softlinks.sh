#!/bin/sh
PATH='/usr/local/apache2/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin'
cd $(pwd)
ln -s $(which ffmpeg) ffmpeg
ln -s $(which ffprobe) ffprobe
ln -s $(which youtube-dl) youtube-dl
ln -s /usr/local/apache2/htdocs web