FROM ubuntu:focal AS freemediaserver

MAINTAINER "Josep Hervàs (josep.hervas@gmail.com")

ENV OS_LOCALE="en_US.UTF-8" \
    LABEL="en_US.UTF-8" \
    LANGUAGE="en_US.UTF-8" \
    DEBIAN_FRONTEND=noninteractive

RUN apt update && apt -y upgrade

RUN apt -y install --no-install-recommends software-properties-common git openssl unzip wget curl ssh \
    nano apt-transport-https ca-certificates gnupg gnupg2 gnupg1 cpp-10 joe python3.8

# Install apache and php from https://deb.sury.org/ PPAs

RUN add-apt-repository -y ppa:ondrej/php \
	&& add-apt-repository -y ppa:ondrej/apache2

# Install apache2
RUN apt update && apt -y install apache2 apache2-doc apache2-utils libapache2-mod-fcgid libapache2-mod-php

# Install php 8.0 and modules \
RUN apt-get -y install php8.0 php8.0-common libapache2-mod-php8.0 php8.0-cgi php8.0-fpm php8.0-amqp php8.0-apcu \
    php8.0-curl libphp8.0-embed php8.0-bcmath php8.0-bz2 php8.0-cli php8.0-dba php8.0-ds php8.0-enchant \
    php8.0-gd php8.0-gmp php8.0-imagick php8.0-imap php8.0-igbinary php8.0-interbase php8.0-gearman php8.0-dev \
    php8.0-gnupg php8.0-http php8.0-intl php8.0-ldap php8.0-mailparse php8.0-mbstring php8.0-memcache \
    php8.0-memcached php8.0-mongodb php8.0-mysql php8.0-oauth php8.0-odbc php8.0-opcache php8.0-pcov php8.0-pgsql \
    php8.0-phpdbg php8.0-propro php8.0-ps php8.0-pspell php8.0-raphf php8.0-readline php8.0-redis php8.0-snmp \
    php8.0-soap php8.0-ssh2 php8.0-tidy php8.0-uploadprogress php8.0-uuid php8.0-xdebug php8.0-xml php8.0-xmlrpc \
    php8.0-xsl php8.0-yaml php8.0-zip php8.0-zmq

RUN a2enmod proxy proxy_fcgi proxy_http proxy_balancer php8.0 lbmethod_byrequests rewrite

# Install node.js and package managers

RUN apt -y install nodejs npm ffmpeg curl python3.9-full python3-pip wget

# Install ffmpeg
RUN apt -y install ffmpeg

# Install whisper-ctranslate2

RUN pip3 install git+https://github.com/jordimas/whisper-ctranslate2.git


RUN mkdir -p /opt /var/www/html && touch /firstrun
# && rm -f /usr/local/apache/htdocs/* 2>/dev/null || true

ADD html/ /opt/html/
ADD mediaserver /usr/local/mediaserver/
ADD conf/000-default.conf /etc/apache2/sites-available/
ADD conf/www.conf /etc/php/php8.0/php-fpm.d/conf.d/
ADD scripts/ /usr/local/bin/

RUN wget https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp && mv yt-dlp /usr/local/bin/ \
	&& chmod +x /usr/local/bin/yt-dlp

#CMD ["/bin/bash"]
CMD ["/usr/local/bin/startup.sh"]
EXPOSE 80 7997