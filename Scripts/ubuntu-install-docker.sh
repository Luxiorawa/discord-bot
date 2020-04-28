#!bin/bash
apt-get update && apt-get upgrade && apt-get dist-upgrade -y| # Update ubuntu distribution

apt-get install apt-transport-https ca-certificates curl gnupg-agent software-properties-common nano python auditd default-jdk node npm -y | # Installing docker and other packages

wget -q -O - https://pkg.jenkins.io/debian/jenkins.io.key | sudo apt-key add -
sudo sh -c 'echo deb https://pkg.jenkins.io/debian-stable binary/ > \
    /etc/apt/sources.list.d/jenkins.list'
sudo apt-get install jenkins
sudo npm install pm2 -g
sudo ln -s /usr/bin/nodejs /usr/local/bin/node
sudo ln -s /usr/bin/npm /usr/local/bin/npm
sudo apt-get install build-essential libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev