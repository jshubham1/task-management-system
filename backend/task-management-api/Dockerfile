FROM eclipse-temurin:21-jdk-alpine as builder
WORKDIR /app

# Copy Maven wrapper and pom.xml
COPY .mvn/ .mvn
COPY mvnw pom.xml ./

# Download dependencies
RUN ./mvnw dependency:resolve

# Copy source code
COPY src ./src

# Build application
RUN ./mvnw clean package -DskipTests

# Create directories for logs and uploads
RUN mkdir -p /app/logs /app/uploads

# Expose port
EXPOSE 8080

# Add health check endpoint
HEALTHCHECK --interval=30s --timeout=3s --start-period=120s --retries=3 \
  CMD curl -f http://localhost:8080/actuator/health || exit 1

# Run application
CMD ["java", "-jar", "target/task-management-api-0.0.1-SNAPSHOT.jar"]
