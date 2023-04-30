# linux 建站

## Ubuntu基本配置

1. 创建一个新的Ubuntu用户，例如“ubuntu”。

```
sudo adduser ubuntu
sudo usermod -aG sudo ubuntu
```



## 安装Node.js和npm

```bash
sudo apt-get update

sudo apt-get install nodejs
sudo apt-get install npm

node -v
npm -v
```



## 安装配置 nginx

```bash
sudo apt-get install nginx
```



### 1 nginx默认建站目录

Nginx将主机文档根目录设置为`/var/www/html`。但是，您可以通过修改`/etc/nginx/sites-available/default`文件中的默认配置文件来更改此设置。

### 2 启动Nginx服务

```bash
sudo systemctl start nginx  # 启动
sudo systemctl stop nginx  # 停止
sudo systemctl restart nginx # 重启
```

### 3 使用Nginx

当我们希望增加新网站时，我们可以在 **sites-available** 中创建新配置文件，然后ln到site-enable文件夹中 **sites-available** 是用于存放网站的配置文件，意为可用的网站列表，用于在需要时链接到 **sites-enabled** 中作为需要启用的网站。

```bas
sudo nano /etc/nginx/sites-available/example.com

sudo ln -s /etc/nginx/sites-available/example.com  /etc/nginx/sites-enabled/
```

```bash
# example.com：
server {
    listen 80;		# 监听外部端口
    server_name example.com; # 虚拟服务器的识别路径

    root /var/www/html;		# 对应本地目录
    index index.html;		# 定义默认主页

    location / {
        try_files $uri $uri/ /index.html;
        #deny 127.0.0.1; #拒绝的ip
        #allow 172.18.5.54; #允许的ip    
    }
}


server {	# 配置没写www情况的的重定向
    listen 80;
    server_name example.com;

    return 301 $scheme://www.example.com$request_uri;
}
```

#### 3.1 检查Nginx配置是否正确

```bash
sudo nginx -t
```

如果一切正常，则应收到以下输出：

```bash
nginx: configuration file /etc/nginx/nginx.conf test is successful
```

### 4 https证书

#### 4.1 使用Let's Encrypt来获取免费的SSL/TLS证书

安装Certbot

```bash
sudo apt install certbot
```

注册

```bash
sudo certbot certonly --email YOUR_EMAIL_ADDRESS --agree-tos --webroot -w /var/www/html -d YOUR_DOMAIN_NAME -d www.YOUR_DOMAIN_NAME
```

#### 4.2 修改nginx配置，将80端口重定向到443

```nginx
server {  # 将80端口重定向到443
    listen 80;
    server_name www.example.com example.com;
    return 301 https://www.example.com$request_uri;
}

server {  # 配置证书
    listen 443 ssl;
    server_name www.example.com;

    ssl_certificate /etc/letsencrypt/live/example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/example.com/privkey.pem;

    root /var/www/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

#### 4.3 证书有效期

Let's Encrypt的免费证书有效期为90天。到期后，您需要更新您的证书才能继续使用HTTPS。您可以在证书即将到期时使用Certbot工具自动续期证书，也可以手动续期。

##### 4.3.1 续期

```bash
sudo systemctl stop nginx

sudo certbot renew

sudo systemctl start nginx
```

### 5 同时托管多个网站

按之前的配置，在 **sites-available** 中创建新配置文件，然后ln到site-enable文件夹中 

```bash
server {
    listen 80;
    server_name xq.coolazy.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    server_name xq.coolazy.com;

    # 填写您在 certbot 中生成的证书信息
    ssl_certificate /etc/letsencrypt/live/xq.coolazy.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/xq.coolazy.com/privkey.pem;

    location / {
        proxy_pass http://127.0.0.1:19999/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;

        proxy_set_header X-Forwarded-Proto https;
        proxy_redirect off;
    }

    location /ws/ {
        proxy_pass http://127.0.0.1:19999/ws/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

## 安装python环境及gunicorn

```bash
pip3 install virtualenv
virtualenv venvname
```

启动venv

```bash
source ./venvname/bin/activate
```

安装依赖

```
pip3 -i requirements.txt
```

启动gunicorn

```bash
gunicorn main:app -b 0.0.0.0:19999 -w 4 -k uvicorn.workers.UvicornWorker --daemon
```

