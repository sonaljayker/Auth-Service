FROM eclipse-temurin:25-jdk-alpine AS builder

WORKDIR /app

COPY pom.xml .
COPY mvnw .
COPY .mvn .mvn

RUN chmod +x ./mvnw && ./mvnw dependency:go-offline -B || true

COPY src src

RUN ./mvnw clean package -DskipTests

FROM eclipse-temurin:25-jre-alpine

WORKDIR /app

COPY --from=builder /app/target/*.jar app.jar

EXPOSE 8080 8090

ENTRYPOINT ["java", "-jar", "app.jar"]
