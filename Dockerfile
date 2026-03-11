FROM node:18
# establecer el directorio de trabajo
WORKDIR /vudec
COPY package*.json .
# instalamos las dependencias en nuestro directorio 
RUN npm install husky -g
RUN npm install --only=production
RUN npm install bcrypt
RUN npm install express@4.21.2 --save
# copiarmos permisos de node 
COPY --chown=node:node . .
COPY . .
RUN npm run build

CMD [ "npm", "run", "docker:run" ]