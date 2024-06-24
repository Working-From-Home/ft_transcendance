[![CI](https://github.com/ggjulio/poc_dockerize_nestjs/actions/workflows/ci.yml/badge.svg)](https://github.com/ggjulio/poc_dockerize_nestjs/actions/workflows/ci.yml)


### ft_transcendence

#### getting started
Download the repo :
```bash
git clone https://github.com/Working-From-Home/ft_transcendence.git && cd ft_transcendence
```
Create a `.env` file, template example:
```
ACCESS_TOKEN_SECRET=my_secret
# expressed in seconds or a string describing a time span zeit/ms. Eg: 60, "2 days", "10h", "7d"
ACCESS_TOKEN_EXPIRATION=7d

# Must change thoses two variables BEFORE BUILD AND RUN if
# running on 42's linux dump.
# Type the command `id` to get your `uid` and `gid`)
# Also it only works ouside `NFS`, like `/goinfre` or `/tmp`,
# thus, it doesn't works inside `/sgoinfre`, or your home `~/`.
# (PS: pretty useless because docker rootless set "random" uid:gid)
HOST_UID=1000
HOST_GID=1000

HOSTNAME=e2r10p17
FRONTEND_PORT=8080
# localhost can be replaced by the hostname or ip of the computer to
# make the website available from others computers.
# example: http://e2r5p13:3000 or http://10.05.155.14:3000
BACKEND_SERVER_URI=http://localhost:3000

# the path must always be [host]:[frontend-port]/signup/oauth
OAUTH_REDIRECT_URI=http://localhost:8080/signup/oauth

# Either development or production
NODE_ENV=development

# Create an app to get some credentials -> https://profile.intra.42.fr/oauth/applications/new
# must feed valid 42 api credentials-> https://api.intra.42.fr/apidoc/guides/getting_started
FORTY_TWO_CLIENT_ID=
FORTY_TWO_SECRET=

# Create google oauth2 credentials here -> https://console.cloud.google.com/apis/credentials
GOOGLE_CLIENT_ID=
GOOGLE_SECRET=

# Database settings
POSTGRES_PORT=5432
POSTGRES_USER=pong
POSTGRES_PASSWORD=qwerty
POSTGRES_DATABASE=pong

#PgAdmin container
PGADMIN_DEFAULT_EMAIL=pong@pong.com
PGADMIN_DEFAULT_PASSWORD=qwerty

```

Then build and run all services :
```bash
docker-compose up --build
```
Then to either run tests, use vue/nest cli, install packages, or use node,
open a new zsh in one of the container :
```bash
docker-compose exec frontend zsh
```
```bash
docker-compose exec backend zsh
```

#### Setup 42 oAuth
- Register an app -> https://profile.intra.42.fr/oauth/applications/new
  - Name the app.
  - Set the redirect uri (the value of `OAUTH_REDIRECT_URI` from .env)
- Copy paste `uid` and `secret` in their respective variables inside the `.env` file.
  - `FORTY_TWO_CLIENT_ID`
  - `FORTY_TWO_SECRET`
#### Setup Google oAuth
- Create an `Oauth client id` here -> https://console.cloud.google.com/apis/credentials
	- Application type -> `Web application`
  - Name the app.
  - Set the authorised redirect uri (the value of `OAUTH_REDIRECT_URI` from .env)
- Copy paste `uid` and `secret` in their respective variables inside the `.env` file.
  - `GOOGLE_CLIENT_ID`
  - `GOOGLE_SECRET`

#### Access to ft_pong DB from pgAdmin UI
- open: http://localhost:8081/
- Use pgAdmin credentials from .env file (`PGADMIN_DEFAULT_EMAIL` and `PGADMIN_DEFAULT_PASSWORD`)
- create/add a new server
  - Give it a name
  - Open the `Connection` panel:
    - **Host** : The docker-compose service name of our database ( in our case `postgres`)
    - **Port** : The value of `POSTGRES_PORT` in the `.env` file (default port is `5432`)
    - **Username** : The value of `POSTGRES_USER` in the `.env` file
    - **Password** : The value of `POSTGRES_PASSWORD` in the `.env` file
  - Hit **`Save`** and voila.

#### Setup debug for backend in vscode
```bash
cd backend
```
```bash
mkdir -p .vscode && touch .vscode/launch.json
```
copy paste this into `lauch.json` :
```json
{
	"configurations": [
		{
			"name": "Backend",
			"type": "node",
			"request": "attach",
			"restart": true,
			"port": 9229,
			"sourceMaps": true,
			"localRoot": "${workspaceFolder}/backend/dist",
			"remoteRoot": "/app/dist",
			"outFiles": ["${workspaceFolder}/backend/dist/**/**.js"],
			"skipFiles": ["<node_internals>/**/*.js"],
		},
	]
}
```

Also, variable `DEBUG=*` can be uncommented in docker-compose.yaml to get more logs

#### Links
###### access our beautiful website
- http://localhost:8080
###### PgAdmin (an ui for postgres)
- http://localhost:8081/
###### openapi design first
(Render better in [stoplight elements](https://elements-demo.stoplight.io/?spec=https://raw.githubusercontent.com/Working-From-Home/ft_transcendence/main/reference/api.oas3.yaml#/))
(Or in stoplight studio https://stoplight.io/studio )
- http://localhost:8082
###### Backend rest api
- http://localhost:3000/
###### proxy/mock backend rest api
- http://localhost:3001/
###### access the swagger code first (remove ? it cause dependabot warning and not really useful for planing routes)
- http://localhost:3000/api

###### access compodoc (just for testing how it works, maybe useless for api endpoints because of swagger)
- http://localhost:8080
