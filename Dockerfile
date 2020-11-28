FROM node

RUN mkdir -p /home/app

COPY ./src /home/app

RUN cd src

CMD ["yarn", "dev"]