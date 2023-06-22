#!/bin/sh
export PATH='/usr/local/apache2/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin'

KEYRING=/usr/share/keyrings/nodesource.gpg
curl -fsSL https://deb.nodesource.com/gpgkey/nodesource.gpg.key | gpg --dearmor | tee "$KEYRING" >/dev/null
# wget can also be used:
# wget --quiet -O - https://deb.nodesource.com/gpgkey/nodesource.gpg.key | gpg --dearmor | tee "$KEYRING" >/dev/null
gpg --no-default-keyring --keyring "$KEYRING" --list-keys
chmod a+r /usr/share/keyrings/nodesource.gpg
# Replace with the branch of Node.js or io.js you want to install: node_8.x, node_16.x, etc...
VERSION=node_16.x
# Replace with the keyring above, if different
KEYRING=/usr/share/keyrings/nodesource.gpg
# The below command will set this correctly, but if lsb_release isn't available, you can set it manually:
# - For Debian distributions: jessie, sid, etc...
# - For Ubuntu distributions: xenial, bionic, etc...
# - For Debian or Ubuntu derived distributions your best option is to use the codename corresponding to the upstream release your distribution is based off. This is an advanced scenario and unsupported if your distribution is not listed as supported per earlier in this README.
DISTRO="$(lsb_release -s -c)"
echo "deb [signed-by=$KEYRING] https://deb.nodesource.com/$VERSION $DISTRO main" | tee /etc/apt/sources.list.d/nodesource.list
echo "deb-src [signed-by=$KEYRING] https://deb.nodesource.com/$VERSION $DISTRO main" | tee -a /etc/apt/sources.list.d/nodesource.list
apt update
apt -y install nodejs
npm install -g yarn