# Deployment Guide - User Stories Assistant

This guide covers various deployment options for the User Stories Assistant application, from simple local deployment to production-ready cloud deployments.

## Deployment Options Overview

| Option | Complexity | Cost | Scalability | Recommended For |
|--------|------------|------|-------------|-----------------|
| Local Development | Low | Free | Low | Development, Testing |
| Docker Compose | Medium | Low | Medium | Small Teams, Staging |
| Cloud VPS | Medium | Low-Medium | Medium | Small Production |
| Kubernetes | High | Medium-High | High | Enterprise, High Traffic |
| Serverless | Medium | Variable | High | Variable Workloads |

## Prerequisites

- Docker and Docker Compose (for containerized deployments)
- Cloud account (AWS, GCP, Azure, DigitalOcean, etc.)
- Domain name (optional, for production)
- SSL certificate (for HTTPS)
- OpenAI API key

## Local Development Deployment

### Quick Start
```bash
# Backend
cd backend
python main.py

# Frontend (new terminal)
cd frontend/user-stories-frontend
npm run dev -- --host
```

Access at:
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:8000`

## Docker Deployment

### 1. Create Docker Files

#### Backend Dockerfile
```dockerfile
# backend/Dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8000/ || exit 1

# Run application
CMD ["python", "main.py"]
```

#### Frontend Dockerfile
```dockerfile
# frontend/Dockerfile
FROM node:20-alpine as builder

WORKDIR /app

# Copy package files
COPY user-stories-frontend/package*.json ./
RUN npm ci --only=production

# Copy source code and build
COPY user-stories-frontend/ .
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built files
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

#### Nginx Configuration
```nginx
# frontend/nginx.conf
events {
    worker_connections 1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;

    server {
        listen 80;
        server_name localhost;
        root /usr/share/nginx/html;
        index index.html;

        # Handle React Router
        location / {
            try_files $uri $uri/ /index.html;
        }

        # API proxy
        location /api/ {
            proxy_pass http://backend:8000/;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # Gzip compression
        gzip on;
        gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
    }
}
```

### 2. Docker Compose Setup

```yaml
# docker-compose.yml
version: '3.8'

services:
  backend:
    build: 
      context: ./backend
      dockerfile: Dockerfile
    container_name: user-stories-backend
    environment:
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - OPENAI_API_BASE=${OPENAI_API_BASE}
      - DEBUG=False
      - HOST=0.0.0.0
      - PORT=8000
    ports:
      - "8000:8000"
    volumes:
      - ./backend:/app
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/"]
      interval: 30s
      timeout: 10s
      retries: 3

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: user-stories-frontend
    ports:
      - "80:80"
    depends_on:
      - backend
    restart: unless-stopped

  # Optional: Redis for caching
  redis:
    image: redis:7-alpine
    container_name: user-stories-redis
    ports:
      - "6379:6379"
    restart: unless-stopped
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data

volumes:
  redis_data:
```

### 3. Environment Configuration

```bash
# .env
OPENAI_API_KEY=your_actual_api_key
OPENAI_API_BASE=https://api.openai.com/v1
```

### 4. Deploy with Docker Compose

```bash
# Build and start services
docker-compose up -d --build

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Update and restart
docker-compose pull
docker-compose up -d --build
```

## Cloud VPS Deployment

### DigitalOcean Droplet

#### 1. Create Droplet
- Choose Ubuntu 22.04 LTS
- Minimum: 2GB RAM, 1 vCPU
- Recommended: 4GB RAM, 2 vCPU

#### 2. Initial Server Setup
```bash
# Connect to server
ssh root@your_server_ip

# Update system
apt update && apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Install Docker Compose
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Create application directory
mkdir -p /opt/user-stories-assistant
cd /opt/user-stories-assistant
```

#### 3. Deploy Application
```bash
# Upload your code (use git, scp, or rsync)
git clone your-repository .

# Set up environment
cp .env.example .env
nano .env  # Add your OpenAI API key

# Deploy
docker-compose up -d --build

# Set up firewall
ufw allow 22    # SSH
ufw allow 80    # HTTP
ufw allow 443   # HTTPS
ufw enable
```

#### 4. Set Up Domain and SSL

```bash
# Install Certbot
apt install certbot python3-certbot-nginx -y

# Get SSL certificate
certbot --nginx -d yourdomain.com

# Auto-renewal
crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### AWS EC2 Deployment

#### 1. Launch EC2 Instance
- AMI: Ubuntu Server 22.04 LTS
- Instance Type: t3.small or larger
- Security Group: Allow ports 22, 80, 443

#### 2. Deploy Application
```bash
# Connect to instance
ssh -i your-key.pem ubuntu@your-instance-ip

# Install Docker
sudo apt update
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker ubuntu

# Deploy application (same as DigitalOcean steps)
```

#### 3. Set Up Load Balancer (Optional)
- Create Application Load Balancer
- Configure target groups
- Set up health checks
- Configure SSL termination

## Kubernetes Deployment

### 1. Kubernetes Manifests

#### Namespace
```yaml
# k8s/namespace.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: user-stories
```

#### ConfigMap
```yaml
# k8s/configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
  namespace: user-stories
data:
  DEBUG: "False"
  HOST: "0.0.0.0"
  PORT: "8000"
  OPENAI_API_BASE: "https://api.openai.com/v1"
```

#### Secret
```yaml
# k8s/secret.yaml
apiVersion: v1
kind: Secret
metadata:
  name: app-secrets
  namespace: user-stories
type: Opaque
data:
  OPENAI_API_KEY: <base64-encoded-api-key>
```

#### Backend Deployment
```yaml
# k8s/backend-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: backend
  namespace: user-stories
spec:
  replicas: 3
  selector:
    matchLabels:
      app: backend
  template:
    metadata:
      labels:
        app: backend
    spec:
      containers:
      - name: backend
        image: your-registry/user-stories-backend:latest
        ports:
        - containerPort: 8000
        env:
        - name: OPENAI_API_KEY
          valueFrom:
            secretKeyRef:
              name: app-secrets
              key: OPENAI_API_KEY
        envFrom:
        - configMapRef:
            name: app-config
        resources:
          requests:
            memory: "512Mi"
            cpu: "250m"
          limits:
            memory: "1Gi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /
            port: 8000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /
            port: 8000
          initialDelaySeconds: 5
          periodSeconds: 5
```

#### Backend Service
```yaml
# k8s/backend-service.yaml
apiVersion: v1
kind: Service
metadata:
  name: backend-service
  namespace: user-stories
spec:
  selector:
    app: backend
  ports:
  - port: 8000
    targetPort: 8000
  type: ClusterIP
```

#### Frontend Deployment
```yaml
# k8s/frontend-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: frontend
  namespace: user-stories
spec:
  replicas: 2
  selector:
    matchLabels:
      app: frontend
  template:
    metadata:
      labels:
        app: frontend
    spec:
      containers:
      - name: frontend
        image: your-registry/user-stories-frontend:latest
        ports:
        - containerPort: 80
        resources:
          requests:
            memory: "128Mi"
            cpu: "100m"
          limits:
            memory: "256Mi"
            cpu: "200m"
```

#### Ingress
```yaml
# k8s/ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: app-ingress
  namespace: user-stories
  annotations:
    kubernetes.io/ingress.class: nginx
    cert-manager.io/cluster-issuer: letsencrypt-prod
spec:
  tls:
  - hosts:
    - yourdomain.com
    secretName: app-tls
  rules:
  - host: yourdomain.com
    http:
      paths:
      - path: /api
        pathType: Prefix
        backend:
          service:
            name: backend-service
            port:
              number: 8000
      - path: /
        pathType: Prefix
        backend:
          service:
            name: frontend-service
            port:
              number: 80
```

### 2. Deploy to Kubernetes

```bash
# Apply manifests
kubectl apply -f k8s/

# Check deployment status
kubectl get pods -n user-stories
kubectl get services -n user-stories
kubectl get ingress -n user-stories

# View logs
kubectl logs -f deployment/backend -n user-stories
```

## Serverless Deployment

### AWS Lambda + API Gateway

#### 1. Prepare Backend for Lambda
```python
# lambda_handler.py
from mangum import Mangum
from main import app

handler = Mangum(app)
```

#### 2. Requirements for Lambda
```txt
# requirements-lambda.txt
fastapi
mangum
openai
pydantic
```

#### 3. Deploy with Serverless Framework
```yaml
# serverless.yml
service: user-stories-api

provider:
  name: aws
  runtime: python3.11
  region: us-east-1
  environment:
    OPENAI_API_KEY: ${env:OPENAI_API_KEY}

functions:
  api:
    handler: lambda_handler.handler
    events:
      - http:
          path: /{proxy+}
          method: ANY
          cors: true
      - http:
          path: /
          method: ANY
          cors: true

plugins:
  - serverless-python-requirements
```

#### 4. Deploy
```bash
npm install -g serverless
serverless deploy
```

### Vercel Deployment (Frontend)

#### 1. Vercel Configuration
```json
{
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "https://your-backend-api.com/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
```

#### 2. Deploy
```bash
npm install -g vercel
vercel --prod
```

## Production Considerations

### Security
- Use HTTPS everywhere
- Implement API rate limiting
- Set up proper CORS policies
- Use environment variables for secrets
- Regular security updates

### Monitoring
```yaml
# docker-compose.monitoring.yml
version: '3.8'

services:
  prometheus:
    image: prom/prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml

  grafana:
    image: grafana/grafana
    ports:
      - "3000:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
    volumes:
      - grafana_data:/var/lib/grafana

volumes:
  grafana_data:
```

### Backup Strategy
```bash
# Backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)

# Backup application data
docker-compose exec backend python backup_data.py > backup_$DATE.json

# Upload to cloud storage
aws s3 cp backup_$DATE.json s3://your-backup-bucket/
```

### Scaling Considerations

#### Horizontal Scaling
- Use load balancers
- Implement session management
- Consider database clustering
- Use CDN for static assets

#### Performance Optimization
- Implement caching (Redis)
- Optimize database queries
- Use connection pooling
- Compress responses

### Cost Optimization

| Resource | Development | Production | Enterprise |
|----------|-------------|------------|------------|
| VPS | $5-10/month | $20-50/month | $100+/month |
| Serverless | $0-5/month | $10-50/month | $50+/month |
| Kubernetes | $50+/month | $200+/month | $500+/month |

## Troubleshooting

### Common Issues

#### Container Won't Start
```bash
# Check logs
docker-compose logs backend

# Check container status
docker ps -a

# Rebuild container
docker-compose build --no-cache backend
```

#### SSL Certificate Issues
```bash
# Check certificate status
certbot certificates

# Renew certificate
certbot renew --dry-run
```

#### Performance Issues
```bash
# Monitor resource usage
docker stats

# Check application logs
docker-compose logs -f --tail=100
```

### Health Checks

```bash
# Backend health
curl -f http://localhost:8000/ || echo "Backend down"

# Frontend health
curl -f http://localhost/ || echo "Frontend down"

# Database health (if using)
docker-compose exec db pg_isready
```

## Maintenance

### Regular Tasks
- Update dependencies monthly
- Rotate API keys quarterly
- Review logs weekly
- Backup data daily
- Monitor costs monthly

### Update Procedure
```bash
# 1. Backup current state
docker-compose exec backend python backup.py

# 2. Pull latest code
git pull origin main

# 3. Update containers
docker-compose pull
docker-compose up -d --build

# 4. Verify deployment
curl -f http://localhost:8000/
```

---

**Choose the deployment option that best fits your needs, budget, and technical requirements. Start simple and scale as needed.**

