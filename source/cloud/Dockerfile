# 设置基础镜像为 AdoptOpenJDK 17，可以根据需要选择其他镜像
FROM openjdk:17-jdk-alpine

# 设置工作目录
WORKDIR /app

# 复制 Spring Boot 项目的 JAR 文件到容器中的 /app 目录
COPY target/cloud-1.0-SNAPSHOT.jar /app
COPY src/main/resources/application.yml /app

VOLUME /app/data/
VOLUME /app/db/
VOLUME /app/application.yml

# 暴露 Spring Boot 项目的默认端口（如果有自定义端口，请修改为实际端口）
EXPOSE 21066

# 设置启动命令，运行 Spring Boot 项目
CMD ["java", "-jar", "cloud-1.0-SNAPSHOT.jar"]
