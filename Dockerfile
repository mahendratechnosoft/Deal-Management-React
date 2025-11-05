# Use official OpenJDK image as base
FROM eclipse-temurin:21-jdk-jammy

# Install comprehensive font libraries
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    fontconfig \
    libfreetype6 \
    libfontconfig1 \
    fonts-dejavu \
    fonts-dejavu-extra \
    fonts-liberation \
    fonts-noto \
    fonts-freefont-ttf \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Set working directory inside container
WORKDIR /app

# Copy built JAR into container
COPY target/*.jar app.jar

# Expose application port
EXPOSE 8080

# Run the application with headless mode
ENTRYPOINT ["java", "-Djava.awt.headless=true", "-jar", "app.jar"]
