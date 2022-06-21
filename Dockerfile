#FROM node:18-alpine3.15 as dev

#LABEL MAINTAINER="<>"

#EXPOSE 3000



FROM node:18-alpine3.15 as prod

LABEL MAINTAINER="<>"

WORKDIR /app

COPY . .

RUN npm run clear

RUN npm install && npm run build

CMD ["npm", "run-script", "serve"]


EXPOSE 3000
