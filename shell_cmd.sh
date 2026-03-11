Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser




##
## Install 
##
npm install -g @nestjs/cli
npm install class-validator class-transformer
npm install @nestjs/config     
# bcrypt (encrypt passwords)  
npm install bcrypt        
npm install -D @types/bcrypt                 
# graphql dependencies
npm install @nestjs/graphql @nestjs/apollo @apollo/server graphql
npm install apollo-server-core
# typoorm / with postgress driver
npm install  @nestjs/typeorm typeorm pg
# passport/jwt
npm install @nestjs/passport passport
npm install @nestjs/jwt passport-jwt
npm install -D @types/passport-jwt
npm install joi
# turn off strict IDE errors
npm uninstall prettier eslint-config-prettier eslint-plugin-prettier

###
### Project 
###
npm nest new [proyect]
nest g res [module] --no-spec
nest g mo [module] --no-spec
nest g r [resolver] --no-spec
nest g s [service] --no-spec


##
## Docker
##
wsl --update
docker --version         
docker pull postgres:14.3
docker-compose up -d
docker-compose down -d


##
## Run the app
##
npm start:dev 