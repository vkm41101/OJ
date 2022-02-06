# OJ

This API Runs Code submissions in a secure environment and Passes Verdicts based
 on pre-saved testcases. It suppports the following Languages:

 * C
 * C++
 * Python 3

 ### Pre-requisites

 The Following Services should be up and running:
 * [RabbitMQ](https://www.rabbitmq.com/download.html)
 * [Redis](https://redis.io/download)
 * [MongoDB](https://docs.mongodb.com/manual/installation/)
 
 Apart from this You should have [Docker](https://docs.docker.com/engine/install/) Installed in your system

 ### Clone the Repository

 Run the following Command to clone the repository:
 ```
 git clone https://github.com/vkm41101/OJ.git
 ```

 ### Run the Server

 ```
node Server/server.js
 ```

 ### Run The Judge

 ```
node Judge/config/rabbitMQ.js
 ```

 ### Usage:

 

### Built With

* [Express](https://expressjs.com/)     -  The web framework used
* [RabbitMQ](https://www.rabbitmq.com/) -  Message queue
* [MongoDB](https://www.mongodb.com/)   - Database for testcases.
* [Redis](https://redis.io/)           -  Used for caching the results.
* [NodeJS](https://nodejs.org/en/)      -  Used as the js runtime.
