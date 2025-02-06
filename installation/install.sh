#!/bin/bash
echo "Install EPIC EDGE webapp..."
pwd=$PWD
app_home="$(dirname "$pwd")"

#create upload/log/projects/public directories, skip this step for reinstallation
io_home=$app_home/io
if [ ! -d  $io_home ]; then
  echo "Create directories"
  mkdir ${io_home}
  dirs=(
    "upload"
    "upload/files"
    "upload/tmp" 
    "log"
    "projects"
    "public"
    "db"
    "structures"
    "sra"
  )

  for dir in "${dirs[@]}"
  do
    mkdir ${io_home}/${dir}
  done

  test_data_home=$app_home/test_data
  if [ -d  $test_data_home ]; then
    ln -s ${test_data_home} ${io_home}/public/test_data
  fi
fi

echo "Setup EPIC EDGE webapp ..."
#build client
echo "install client..."
cd $app_home/webapp/client
npm install --legacy-peer-deps
#build server
echo "install server..."
cd $app_home/webapp/server
npm install

echo "EPIC EDGE webapp successfully installed!"
echo "Next steps:"
echo "1. copy webapp/client/.env.example to webapp/client/.env and update settings in the .env file"
echo "2. inside webapp/client, run command: npm run build"
echo "3. copy webapp/server/.env.example to webapp/server/.env and update settings in the .env file"
echo "4. start MongoDB if it's not started yet"
echo "5. start the webapp in epic-edge's root directory: pm2 start pm2.config.js"s 