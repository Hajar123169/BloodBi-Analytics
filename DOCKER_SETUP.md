# Docker Setup for BloodBI Analytics

This guide will help you run the entire BloodBI Analytics application stack using Docker and Docker Compose.

## Prerequisites

- Docker Desktop (or Docker Engine) installed and running
  - [Download Docker Desktop](https://www.docker.com/products/docker-desktop)
- Docker Compose (usually included with Docker Desktop)
- Git (for cloning the repository)

## Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/Hajar123169/BloodBi-Analytics.git
cd BloodBi-Analytics
```

### 2. Configure Environment (Optional)
The project comes with a pre-configured `.env` file. If you want to customize it:

```bash
cp .env.example .env
# Edit .env with your preferred settings (optional)
```

### 3. Build and Start Services
```bash
# Build Docker images and start all services
docker-compose up -d --build

# Or without building (if images already exist)
docker-compose up -d
```

### 4. Access the Application

Once all services are running:

- **Frontend (React App)**: http://localhost:3000
- **Backend API**: http://localhost:8082
- **MySQL Database**: localhost:3306

### 5. Check Service Status
```bash
# View all running containers
docker-compose ps

# View logs for all services
docker-compose logs -f

# View logs for specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mysql
```

### 6. Stop Services
```bash
# Stop all services (keeps volumes)
docker-compose stop

# Stop and remove containers (keeps volumes)
docker-compose down

# Remove everything including volumes
docker-compose down -v
```

## Service Details

### MySQL (bloodbi-mysql)
- **Port**: 3306
- **Root Username**: root
- **Root Password**: rootpassword (changeable via .env)
- **Databases Created**:
  - `bloodbi_v2` - Main application database
  - `bloodbi_dw_v2` - Data warehouse database
- **Initialization Scripts**:
  - Runs SQL scripts from `/database` folder on first startup
  - Data persists in `mysql_data` volume

### Backend (bloodbi-backend)
- **Port**: 8082
- **Technology**: Spring Boot 3.3.0 with Java 17
- **Profile**: Runs with `docker` profile
- **Health Check**: Available at `http://localhost:8082/actuator/health`
- **Auto Restart**: Enabled

### Frontend (bloodbi-frontend)
- **Port**: 3000
- **Technology**: React 18 with Nginx reverse proxy
- **API Proxy**: Routes `/api/*` requests to backend
- **Health Check**: Checks if port 3000 responds
- **Auto Restart**: Enabled

## Environment Configuration

Key environment variables in `.env`:

```bash
# Database
MYSQL_ROOT_PASSWORD=rootpassword
MYSQL_DATABASE=bloodbi_v2

# Backend
SPRING_PROFILES_ACTIVE=docker
SERVER_PORT=8082
BLOODBI_CORS_ALLOWED_ORIGINS=http://localhost:3000,http://frontend:3000

# Frontend
REACT_APP_API_URL=http://localhost:8082
REACT_APP_API_BASE_PATH=/api
```

**For Production**: Change `MYSQL_ROOT_PASSWORD` and `DB_PASSWORD` to strong passwords.

## Common Commands

### View Application Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mysql
```

### Rebuild Services
```bash
# Rebuild all images
docker-compose build --no-cache

# Rebuild specific service
docker-compose build --no-cache backend
docker-compose build --no-cache frontend
```

### Execute Commands in Container
```bash
# Run a command in backend container
docker-compose exec backend bash

# Run a command in mysql container
docker-compose exec mysql mysql -u root -p bloodbi_v2

# Check Java version in backend
docker-compose exec backend java -version
```

### Database Operations
```bash
# Access MySQL CLI
docker-compose exec mysql mysql -u root -prootpassword

# Backup database
docker-compose exec mysql mysqldump -u root -prootpassword bloodbi_v2 > backup.sql

# Restore database
docker-compose exec -T mysql mysql -u root -prootpassword bloodbi_v2 < backup.sql
```

### View Container Resource Usage
```bash
docker stats
```

## Troubleshooting

### Port Already in Use
If ports 3000, 8082, or 3306 are already in use, either:
1. Stop the service using that port
2. Modify the port mapping in `docker-compose.yml`
3. Change the port in `.env` file

### Container Crashes on Startup
```bash
# Check logs for errors
docker-compose logs backend
docker-compose logs frontend
docker-compose logs mysql
```

### Database Connection Issues
1. Wait for MySQL to be fully initialized (check with `docker-compose logs mysql`)
2. Verify MySQL container is running: `docker-compose ps`
3. Check credentials in `.env` file match docker-compose.yml

### Frontend Can't Connect to Backend
1. Verify backend container is running: `docker-compose ps`
2. Check backend logs: `docker-compose logs backend`
3. Verify `BLOODBI_CORS_ALLOWED_ORIGINS` includes your frontend URL

### Memory Issues
If containers are running out of memory:
1. Increase Docker Desktop memory allocation
2. Check resource usage: `docker stats`
3. Remove unused images/containers: `docker system prune`

## Production Deployment

For production deployment:

1. **Update .env with strong passwords**
   ```bash
   MYSQL_ROOT_PASSWORD=<strong-random-password>
   DB_PASSWORD=<strong-random-password>
   ```

2. **Configure CORS origins**
   ```bash
   BLOODBI_CORS_ALLOWED_ORIGINS=https://yourdomain.com,https://api.yourdomain.com
   ```

3. **Set appropriate log levels**
   - Modify `application-docker.properties` to reduce logging

4. **Use environment-specific compose file**
   ```bash
   docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
   ```

5. **Set up proper backups**
   ```bash
   docker-compose exec mysql mysqldump -u root -p<password> --all-databases > /backup/bloodbi-backup-$(date +%Y%m%d).sql
   ```

6. **Enable SSL/TLS**
   - Configure Nginx with SSL certificates
   - Update frontend API URL to use https

## Docker Network

All services communicate via the `bloodbi-network` bridge network:
- Backend can access MySQL using hostname `mysql:3306`
- Frontend can access Backend using hostname `backend:8082`
- Services are isolated from external access except through exposed ports

## Volumes

- **mysql_data**: Persists MySQL data between container restarts
  - Location: Docker's default volume storage
  - Survives `docker-compose down` and `docker-compose stop`
  - Remove with: `docker-compose down -v`

## Performance Optimization

### Frontend
- Nginx gzip compression enabled
- Static assets cached for 1 year with versioning
- index.html cache-control set to 0 for updates

### Backend
- Multi-stage Docker build to reduce image size
- Running with Java 17 slim image
- Health checks configured for quick failure detection

### Database
- MySQL 8.0 with utf8mb4 character set
- Connection pooling handled by Spring Boot
- Initialization scripts run only on first startup

## Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Spring Boot Docker Support](https://spring.io/blog/2020/01/27/creating-docker-images-with-spring-boot-2-3-0-m1)
- [Nginx Documentation](https://nginx.org/en/docs/)

## Support

For issues or questions:
1. Check the logs: `docker-compose logs -f`
2. Review the troubleshooting section above
3. Visit the GitHub repository
4. Check Docker documentation

## License

See LICENSE file in the project root.
