#!/bin/bash
echo "Install EPIC EDGE webapp..."

#check client-env and server-env
quit=0
if [ ! -f ./client-env ]; then
  echo "ERROR: client-env not found in the current directiory"
  quit=1
fi
if [ ! -f ./server-env ]; then
  echo "ERROR: server-env not found in the current directiory"
  quit=1
fi
[[ $quit == 1 ]] && exit 1

pwd=$PWD
app_home="$(dirname "$pwd")"

#production installation will be with https and nginx proxy
read -p 'Web server domain name (default localhost)? ' web_server_domain
[[ ! $web_server_domain ]] && web_server_domain=localhost
read -p 'Webapp port (default 5000)? ' web_server_port
[[ ! $web_server_port ]] && web_server_port=5000

echo "Install $env EPIC EDGE webapp to $app_home"
if [[ $web_server_domain == "localhost" ]]; then
  app_url="http://$web_server_domain:$web_server_port"
  echo "URL: http://$web_server_domain:$web_server_port"
else
  app_url="https://$web_server_domain"
  echo "URL: https://$web_server_domain"
fi

read -p 'Continue to install EPIC EDGE webapp? [y/n]'
[[ ! $REPLY =~ ^[Yy]$ ]] && exit 1

read -p 'Data root directory? (default /panfs/biopan04/epicdev/dataroot/products)' prod_home
[[ ! $prod_home ]] && prod_home=/panfs/biopan04/epicdev/dataroot/products

# Prompt user for installation system
echo 'What OS are you using? ' 
options=("Mac" "Linux" "Quit")
select opt in "${options[@]}"
do
    case $opt in
        "Mac")
            #Add this export for MacOS, otherwise will get 'tr: Illegal byte sequence' error when generating a random string
            export LC_CTYPE=C
            break;
            ;;
        "Linux")
            break;
            ;;
        "Quit")
            exit 1;
            ;;
        *) echo "invalid option $REPLY";;
    esac
done

#create log/db/datasets/sessions directories, skip this step for reinstallation
io_home=$app_home/io
if [ ! -d  $io_home ]; then
  echo "Create io directories"
  mkdir ${io_home}
  mkdir ${io_home}/upload
  mkdir ${io_home}/upload/files
  mkdir ${io_home}/upload/tmp
  mkdir ${io_home}/log
  mkdir ${io_home}/projects
  mkdir ${io_home}/public
  mkdir ${io_home}/db
  mkdir ${io_home}/datasets
  mkdir ${io_home}/sessions
fi

echo "Generate imports.zip"
cd $app_home/data/workflow/WDL
for f in *; do
    if [ -d "$f" ]; then
        # $f is a directory
        cd $f
        zip -r imports.zip *.wdl
        if [ "$?" != "0" ]; then
          echo "Cannot create $app_home/data/workflow/WDL/$f/imports.zip!" 1>&2
          exit 1
        fi
        cd ../
    fi
done


echo "Setup EPIC EDGE webapp ..."

#setup .env and server_pm2.json
#Generate random 20 character string (upper and lowercase)
jwt_key=`cat /dev/urandom|tr -dc '[:alpha:]'|fold -w ${1:-20}|head -n 1`

cp $pwd/client-env $app_home/webapp/client/.env
cp $pwd/server-env $app_home/webapp/server/.env
cp $pwd/server_pm2.tmpl $pwd/server_pm2.json
if [[ $opt == 'Mac' ]]; then
  sed -i "" "s/\<APP_URL\>/${app_url//\//\\/}/g" $app_home/webapp/client/.env
  sed -i "" "s/\<WEB_SERVER_PORT\>/${web_server_port}/g" $app_home/webapp/client/.env
  sed -i "" "s/\<APP_URL\>/${app_url//\//\\/}/g" $app_home/webapp/server/.env
  sed -i "" "s/\<WEB_SERVER_PORT\>/${web_server_port}/g" $app_home/webapp/server/.env
  sed -i "" "s/\<APP_HOME\>/${app_home//\//\\/}/g" $app_home/webapp/server/.env
  sed -i "" "s/\<PROD_HOME\>/${prod_home//\//\\/}/g" $app_home/webapp/server/.env
  sed -i "" "s/\<IO_HOME\>/${io_home//\//\\/}/g" $app_home/webapp/server/.env
  sed -i "" "s/\<JWT_KEY\>/${jwt_key}/g" $app_home/webapp/server/.env
  sed -i "" "s/\<APP_HOME\>/${app_home//\//\\/}/g" $pwd/server_pm2.json
else
  sed -i "s/<APP_URL>/${app_url//\//\\/}/g" $app_home/webapp/client/.env
  sed -i "s/<WEB_SERVER_PORT>/${web_server_port}/g" $app_home/webapp/client/.env
  sed -i "s/<APP_URL>/${app_url//\//\\/}/g" $app_home/webapp/server/.env
  sed -i "s/<WEB_SERVER_PORT>/${web_server_port}/g" $app_home/webapp/server/.env
  sed -i "s/<APP_HOME>/${app_home//\//\\/}/g" $app_home/webapp/server/.env
  sed -i "s/<PROD_HOME>/${prod_home//\//\\/}/g" $app_home/webapp/server/.env
  sed -i "s/<IO_HOME>/${io_home//\//\\/}/g" $app_home/webapp/server/.env
  sed -i "s/<JWT_KEY>/${jwt_key}/g" $app_home/webapp/server/.env
  sed -i "s/<APP_HOME>/${app_home//\//\\/}/g" $pwd/server_pm2.json
fi

#build client
echo "Build client..."
cd $app_home/webapp/client
npm install --legacy-peer-deps
npm run build
#build server
echo "Build server..."
cd $app_home/webapp/server
npm install

echo "EPIC EDGE webapp successfully installed!"
echo "To start the webapp:"
echo "pm2 start server_pm2.json"