docker rm -f freemediaserver
docker build -t gestur1976/freemediaserver .
docker push gestur1976/freemediaserver
echo sudo docker run -d --name freemediaserver -p 7997:80 -v /var/freemediaserver:/var/www/html gestur1976/freemediaserver:latest
