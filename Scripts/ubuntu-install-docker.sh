#!bin/bash
apt-get update && apt-get upgrade && apt-get dist-upgrade | # Update ubuntu distribution

apt-get install apt-transport-https ca-certificates curl gnupg-agent software-properties-common nano | # Installing docker
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
sudo apt-key fingerprint 0EBFCD88
sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"
sudo apt-get install docker-ce docker-ce-cli containerd.io
docker run hello-world