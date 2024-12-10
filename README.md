## Dependencies (pre-install):
* Have `git` installed
* Have `npm` installed
* Have `mongodb` installed

## Installation
1. `git clone https://luckytoaster/salsa_backend`
2. `cd salsa_backend`
3. `npm install`
4. Make sure `mongod` is running with: `systemctl status mongod`
5. Restore the database: `mongorestore --db=salsa_db ./db_backup/salsa_db`

## Post Install
* Run the server locally with: `npm start`



