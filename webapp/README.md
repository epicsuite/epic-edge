# Development

## Dependencies

* node.js v20
* MongoDB

## Install the webapp

    cd installation
    ./install-local.sh
    
## Start api server

    cd server
    npm start

## Start ui client

    cd client
    npm start

## View the website

    http://localhost:3000

## Note

- Have to restart the client when make changes in client/.env.
- Have to restart the server when make changes in server code or server/.env.
    
#### Restart api server

    cd server
    use Ctrl-C to stop the webapp server
    npm start

#### Restart ui client

    cd client
    use Ctrl-C to stop the webapp client
    npm start

    