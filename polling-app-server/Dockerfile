

# First stage: complete build environment
FROM adoptopenjdk/maven-openjdk11  AS builder

# add pom.xml and source code
ADD ./pom.xml pom.xml
ADD ./src src/

# package jar
RUN mvn clean install -DskipTests

# Second stage: minimal runtime environment
FROM openjdk:11
# copy jar from the first stage
COPY --from=builder target/polls-0.0.1-SNAPSHOT.jar polls-0.0.1-SNAPSHOT.jar

EXPOSE 8080

CMD ["java", "-jar", "polls-0.0.1-SNAPSHOT.jar"]
