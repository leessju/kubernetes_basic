FROM node:carbon
EXPOSE 8080
COPY index.js .
# COPY healthy /tmp/  => 내용과 상관없이 healthcheck 용
# 명령은 3가지 HTTP. TCP, Shell command
CMD node index.js > log.out

# Deployment 1, 2
# FROM node:carbon
# EXPOSE 8080
# COPY server2.js .
# CMD node server2.js > log.out