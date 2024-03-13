## INSTALLATION PREREQUISITES

### Install Node20
https://nodejs.org/dist/latest-v20.x/

### Install pm2
`npm install pm2@latest -g`

### Install MongoDB Community Edition
https://docs.mongodb.com/manual/installation/#mongodb-community-edition-installation-tutorials

## INSTALL webapp

1. Move/copy epic-edge folder to the installation directory

2. Inside epic-edge/installation folder, run the installation script 

    `./install.sh`

## START webapp

1. Start MongoDB if it's not started yet

2. Inside epic-edge/installation folder, run the pm2 start command 

    `pm2 start server_pm2.json`
    
## STOP webapp

    `pm2 stop all`
