[![CI](https://github.com/ggjulio/poc_dockerize_nestjs/actions/workflows/ci.yml/badge.svg)](https://github.com/ggjulio/poc_dockerize_nestjs/actions/workflows/ci.yml)

Create a .env file to the project root and set DB_NAME, JWT_SECRET and API_KEY_42

https://www.linkedin.com/pulse/nestjs-why-use-filipe-mazzon

### Just a poc

#### getting started
Download the repo :
```bash
git clone https://github.com/Working-From-Home/ft_transcendence.git && cd ft_transcendence
```
Create a `.env` file, template example:
```
DB_NAME=db.sqlite
JWT_SECRET=my_secret
API_KEY_42=my_api_key

#Database settings
POSTGRES_PASSWORD=qwerty
```

Then build :
```bash
docker-compose build
```
Then run the services :
```bash
docker-compose up
```
Then to either run tests, use vue/nest cli, or install packages,
open a new zsh in one of the container :
```bash
docker-compose exec frontend zsh
```
```bash
docker-compose exec backend zsh
```


###### access the backend api
- http://localhost:3000/
###### access the swagger
- http://localhost:3000/api
###### access compodoc (just for testing how it works, maybe useless for api endpoints because of swagger)
- http://localhost:8080

#### ressources 
- [nestjs doc - recipe swagger](https://docs.nestjs.com/openapi/introduction)
- [nestjs doc - OpenApi (with swagger)](https://docs.nestjs.com/openapi/introduction)
- [nestjs doc - recipe compodoc](https://docs.nestjs.com/recipes/documentation)

