FROM node:4.2.3

RUN mkdir /code
WORKDIR /code

ADD package.json /code/
RUN npm install

ADD . /code/

EXPOSE 3000

CMD ["node", "index.js"]
