# OJ

This API Runs Code submissions in a secure environment and Passes Verdicts based
 on pre-saved testcases. It uses RabbitMQ for Queueing the submissions, Redis for Caching the results and Docker for Sandboxing. It is a Remote Code Execution Engine, linked to an online judge. It suppports the following Languages:

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

 ### Why Message Queueing?

 The Problem Lies in the scale, This kind of API would work fine without Message Queueing with a small scale, whee at a time, the API might only face about 10-15 Submission at a time at most. However For a lager Scale, it becomes Impossible to execute all of them at once. One solution could be rate Limiting, but It would be unfair in a coding contest if your submission is held because of rate limiting, and hence Message Queueing was a Legitimate option.

 ### Why Docker?

 Let us Consider a case where a person tries to submit a malicious Code, like try to do a Fork attack or execute "rm-rf". In such Cases Docker Plays a crucial role in Containerizing the effects of such malicious code.


 ### How to Use:

Following Header is to be used for All requests:
```
{"Content-type" : "application/json"}
```
Testcases need to be individually sent as a Post request to
```
http://localhost:3000/testCase/:questionID
```
where `:questionID` refers to a unique question ID for a question

The Body for Posting Testcases should be in the following format:

```
{
  inputSRC : "Input of the respective testcase"
  outputSRC : "Expected output for the above input"
}
```

To delete The Testcases, send a Delete request to:

```
http://localhost:3000/testCase/delete-all/:questionID
```

To Check a particular Testcase, send a Get request to:
```
http://localhost:3000/testCase/:questionID/:testcaseNumber
```

where `:testCaseNumber` refers to the testcase number of the particular Test Case you want to recieve.

Although the Testcases are posted individually, a submitted program will be tested against all the testcases.

To post a submission, send a Post request to:

```
http://localhost:3000/submit/
```

The body of the Post should include:

```
{
  questionID: "Question ID of the question for whom the submission is supposed to be"
  language: "Language Code of the Submission as per given below"
  timeOut: "Time Limit for Execution"
  src: "Source code of Submission"
}
```

The language Code of the languages are given below:

* C: 'C'
* C++: 'C++'
* Python: 'python3'

When Successfully Queued, the API Sends the Following response:
```
{
  status: "InQueue"
  submissionID: "The submission ID assigned by the API to the respective submission"
}
```

After this, the User needs to send Regular Get Requests to:
```
http://localhost:3000/result/:submissionID
```

To get updates about the Submission. Here `submissionID` is the Submission ID assigned to the submission by the application

Refer Below for What does each response mean:

* AC: All Correct
* WA: Wrong Answer
* CE: Compilation Error
* timeOut: Time Limit Exceeded

### Applications

* Online Coding Contests
* Coding Interviews
* Online Assesments and Coding Tests


### Built With

* [Express](https://expressjs.com/)     -  The web framework used
* [RabbitMQ](https://www.rabbitmq.com/) -  Message queue
* [MongoDB](https://www.mongodb.com/)   - Database for testcases.
* [Redis](https://redis.io/)           -  Used for caching the results.
* [Docker](https://www.docker.com/)    - Used for Running the Program in a secure Environment.
* [NodeJS](https://nodejs.org/en/)      -  Used as the js runtime.

### Acknowledgements:

* [https://blog.remoteinterview.io/how-we-used-docker-to-compile-and-run-untrusted-code-2fafbffe2ad5](https://blog.remoteinterview.io/how-we-used-docker-to-compile-and-run-untrusted-code-2fafbffe2ad5)
* [https://medium.com/@yashbudukh/building-a-remote-code-execution-system-9e55c5b248d6](https://medium.com/@yashbudukh/building-a-remote-code-execution-system-9e55c5b248d6)
