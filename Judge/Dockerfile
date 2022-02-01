FROM ubuntu:20.04

RUN apt-get update
RUN apt-get install apt-utils
RUN apt-get install gcc -y
RUN apt-get install g++ -y
RUN apt-get install python3 -y

#install Java
RUN apt-get install default-jdk -y
RUN apt-get update
RUN apt-get install default-jre -y
RUN apt-get update
RUN apt-get install software-properties-common -y
RUN add-apt-repository ppa:linuxuprising/java
RUN apt update
RUN echo "deb http://ppa.launchpad.net/linuxuprising/java/ubuntu focal main" | tee /etc/apt/sources.list.d/linuxuprising-java.list
RUN apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys 73C3DB2A
RUN apt-get update
RUN echo yes | apt-get install -y oracle-java17-installer
RUN mkdir /home/folderrun
RUN chmod 775 /home/folderrun
RUN chmod g+s /home/folderrun
RUN chmod u+x /home/folderrun
RUN apt-get install sudo
