## The Game

### Run app in docker environment

1. Install docker and docker compose.
2. Build images:
    ```shell
    $ docker build --no-cache -t game-app ./docker/app
    $ docker build --no-cache -t nginx ./docker/nginx
    ```
3. Install dependencies and build NEXT JS application:
    ```shell
    $ docker run -v ./:/app game-app yarn install --frozen-lockfile
    $ docker run -v ./:/app game-app yarn run build
    ```
4. Replace all strings _DOMAIN_ to your domain name in _configs/site.conf_:
    ```shell
    $ sed -i 's/DOMAIN/<YOUR_DOMAIN>/g' configs/site.conf
    ```
5. Configure volume with certs files in _docker-compose.yml_:
    ```yaml
   # docker-compose.yml
        volumes:
          - <PATH_TO_DIRECTORY_WITH_YOUR_CERTS>:/etc/nginx/certs
    ```
6. Create _.env_ file:
    ```shell
    $ echo 'PASSWORD=password' > .env
    ```
7. Run app:
    ```shell
    $ sudo docker compose up -d
    ```

### Run on cloud VM

0. Pull project and add .env

```shell
git clone github-repo-url
git pull
```

1. Install node

```shell
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs
```

2. Install deps add .env and build

```shell
cd /project-root-folder
echo 'PASSWORD=password' >> server/.env
echo 'CLIENT_HOST=https://YOUR_HOST' >> server/.env 
echo 'NEXT_PUBLIC_API_HOST=https://YOUR_HOST' >> client/.env
npm install --prefix client
npm run build --prefix client
npm install --prefix server
npm run build --prefix server
```

3. Install Node PM2 and run server

```shell
sudo npm install pm2 -g
pm2 start npm --name client -- run start -- -p 3000 --prefix client
pm2 start npm --name server -- run start -- -p 3001 --prefix server
```

4. Install Nginx proxy

```shell
sudo apt install nginx -y
```

- setup config

```shell
cd /etc/nginx/sites-available
sudo vim default
```

Nginx 'default' config:

```conf
server {
    listen 80 default_server;
    listen [::]:80 default_server;

    server_name domain.com www.domain.com;

    # listen 443 ssl; # managed by Certbot
    
    # RSA certificate
    # ssl_certificate /etc/letsencrypt/live/domain.com/fullchain.pem; # managed by Certbot
    # ssl_certificate_key /etc/letsencrypt/live/domain.com/privkey.pem; # managed by Certbot
    
    # http to https redirect by Certbot
    # if ($scheme != "https") {
    #    return 301 https://$host$request_uri;
    # }
    
    # include /etc/letsencrypt/options-ssl-nginx.conf; # managed by Certbot
    
    # proxy domain.com to local server
    location / {
            proxy_pass             http://localhost:3000;
            proxy_read_timeout     60;
            proxy_connect_timeout  60;
            proxy_redirect         off;
            location /api {
                  proxy_pass             http://localhost:3001;
                  proxy_read_timeout     60;
                  proxy_connect_timeout  60;
                  proxy_redirect         off;
                  # Allow the use of websockets
                  proxy_http_version 1.1;
                  proxy_set_header Upgrade $http_upgrade;
                  proxy_set_header Connection 'upgrade';
                  proxy_set_header Host $host;
                  proxy_cache_bypass $http_upgrade;
            }
    }
}
```

5. Restart

```shell
sudo systemctl restart nginx
```

```shell
sudo systemctl restart nginx
systemctl status nginx
```

### Certbot SSL setup

https://www.nginx.com/blog/using-free-ssltls-certificates-from-lets-encrypt-with-nginx/
