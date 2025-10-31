# Kube Credential - Microservice-Based Credential Management System

A scalable, cloud-native credential issuance and verification system built with microservices architecture, containerized with Docker, and deployable on Kubernetes.

## 📋 Table of Contents

- [Overview](#overview)
- [Live Demo (Render)](#live-demo-render)
- [Architecture](#architecture)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Local Development](#local-development)
- [Testing](#testing)
- [Docker Deployment](#docker-deployment)
- [Kubernetes Deployment](#kubernetes-deployment)
- [Render Deployment](#render-deployment)
- [API Documentation](#api-documentation)
- [Design Decisions](#design-decisions)
- [Assumptions](#assumptions)
- [Contact Information](#contact-information)

## 🎯 Overview

Kube Credential is a microservice-based application that provides credential issuance and verification capabilities. The system consists of:

- **Issuance Service**: Issues new credentials and maintains a record of all issued credentials
- **Verification Service**: Verifies credentials by checking against the issuance service
- **Frontend Application**: React-based UI for issuing and verifying credentials

## 🌐 Live Demo (Render)

The project is deployed on Render:

- **Frontend**: https://kube-credential-frontend-1.onrender.com
- **Issuance Service**: https://kube-credential-issuance-service-cf63.onrender.com
- **Verification Service**: https://kube-credential-verification-service-jxhx.onrender.com

Notes:

- **Health checks**: `GET /health` on backend services should return status JSON.
- **CORS**: Backends use `cors()` with defaults, allowing cross-origin calls from the hosted frontend.

## 🏗️ Architecture

### System Architecture Diagram

```
┌──────────────────────────────────────────────────────────────┐
│                         Frontend (React)                     │
│                    Port: 3000 (Dev) / 80 (Prod)              │
└────────────────┬────────────────────────────┬────────────────┘
                 │                            │
                 │                            │
        ┌────────▼──────────┐        ┌────────▼──────────┐
        │  Issuance Service │        │ Verification      │
        │   (Node.js/TS)    │◄───────┤   Service         │
        │   Port: 3001      │        │  (Node.js/TS)     │
        └───────────────────┘        │   Port: 3002      │
                 │                   └───────────────────┘
                 │
        ┌────────▼─────────┐
        │   SQLite DB      │
        │  (Persistence)   │
        └──────────────────┘
```

### Microservices Design

#### 1. Issuance Service

- **Responsibility**: Issue and store credentials
- **Persistence**: SQLite database
 - **Endpoints**:
   - `POST /api/issue-credential` - Issue a new credential
   - `GET /api/credentials` - List all credentials
   - `GET /api/credentials/:id` - Get specific credential
   - `GET /health` - Health check

#### 2. Verification Service

- **Responsibility**: Verify credentials against issuance records
- **Communication**: HTTP calls to Issuance Service
{{ ... }}
- **Persistence**: Verification attempts are logged to a local SQLite database using `better-sqlite3` at `/app/data/verification-logs.db` (created on startup by `services/verification-service/src/logDatabase.ts`). In Docker, the image prepares `/app/data` with correct permissions for a non-root user. The provided Kubernetes deployment (`k8s/verification-deployment.yaml`) does not mount a volume by default, so logs are ephemeral per pod. For persistence across pod restarts, mount a PersistentVolumeClaim at `/app/data`.
- **Endpoints**:
  - `POST /api/verify` - Verify a credential
  - `POST /api/verify/batch` - Verify multiple credentials
  - `GET /health` - Health check

#### 3. Frontend Application

- **Technology**: React with TypeScript, Vite, TailwindCSS
- **Pages**:
  - Issue Credential Page
  - Verify Credential Page
- **Features**: Real-time feedback, responsive design, error handling

## ✨ Features

- ✅ **Microservices Architecture**: Independent, scalable services
- ✅ **Type-Safe Code**: Full TypeScript implementation
- ✅ **Containerized**: Docker containers for all services
- ✅ **Kubernetes Ready**: Complete K8s manifests with HPA
- ✅ **Worker Identification**: Each pod reports its worker ID
- ✅ **Duplicate Prevention**: Prevents re-issuance of existing credentials
- ✅ **Comprehensive Testing**: Unit tests for all services
- ✅ **Health Checks**: Liveness and readiness probes
- ✅ **Modern UI**: Beautiful, responsive React interface
- ✅ **CORS Enabled**: Cross-origin resource sharing configured
- ✅ **Error Handling**: Robust error handling throughout

## 🛠️ Technology Stack

### Backend

- **Runtime**: Node.js 20
- **Language**: TypeScript
- **Framework**: Express.js
- **Database**: SQLite (better-sqlite3)
- **Testing**: Jest, Supertest
- **HTTP Client**: Axios

### Frontend

- **Framework**: React 18
- **Language**: TypeScript
- **Build Tool**: Vite
- **Styling**: TailwindCSS
- **Routing**: React Router v6
- **Icons**: Lucide React
- **HTTP Client**: Axios

### DevOps

- **Containerization**: Docker
- **Orchestration**: Kubernetes
- **CI/CD Ready**: Dockerfile and K8s manifests included

## 📁 Project Structure

```
kube-credential/
├── services/
│   ├── issuance-service/
│   │   ├── src/
│   │   │   ├── __tests__/
│   │   │   │   ├── api.test.ts
│   │   │   │   ├── database.test.ts
│   │   │   │   └── utils.test.ts
│   │   │   ├── database.ts
│   │   │   ├── index.ts
│   │   │   ├── types.ts
│   │   │   └── utils.ts
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── jest.config.js
│   │
│   └── verification-service/
│       ├── src/
│       │   ├── __tests__/
│       │   │   ├── api.test.ts
│       │   │   ├── verifier.test.ts
│       │   │   └── utils.test.ts
│       │   ├── index.ts
│       │   ├── types.ts
│       │   ├── utils.ts
│       │   └── verifier.ts
│       ├── Dockerfile
│       ├── package.json
│       ├── tsconfig.json
│       └── jest.config.js
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Alert.tsx
│   │   │   ├── CredentialDisplay.tsx
│   │   │   ├── CredentialForm.tsx
│   │   │   └── Layout.tsx
│   │   ├── pages/
│   │   │   ├── IssuancePage.tsx
│   │   │   └── VerificationPage.tsx
│   │   ├── api.ts
│   │   ├── App.tsx
│   │   ├── config.ts
│   │   ├── index.css
│   │   ├── main.tsx
│   │   └── types.ts
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── tailwind.config.js
│
├── k8s/
│   ├── namespace.yaml
│   ├── configmap.yaml
│   ├── issuance-deployment.yaml
│   ├── verification-deployment.yaml
│   ├── frontend-deployment.yaml
│   ├── ingress.yaml
│   └── hpa.yaml
│
├── docker-compose.yml
├── .gitignore
└── README.md
```

## 📋 Prerequisites

- **Node.js**: v20 or higher
- **npm**: v9 or higher
- **Docker**: v24 or higher
- **Docker Compose**: v2 or higher
- **Kubernetes**: v1.28 or higher (for K8s deployment)
- **kubectl**: Latest version

## 🚀 Local Development

### 1. Clone the Repository

```bash
cd /home/gtf4/Documents/kube-credential
```

### 2. Setup Issuance Service

```bash
cd services/issuance-service
npm install
npm run dev
```

The service will run on `http://localhost:3001`

### 3. Setup Verification Service

```bash
cd services/verification-service
npm install
npm run dev:local
```

The service will run on `http://localhost:3002`

### 4. Setup Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

The frontend will run on `http://localhost:3000`

## 🧪 Testing

### Run All Tests

#### Issuance Service Tests

```bash
cd services/issuance-service
npm test
npm run test:watch  # Watch mode
```

#### Verification Service Tests

```bash
cd services/verification-service
npm test
npm run test:watch  # Watch mode
```

### Test Coverage

Both services include comprehensive unit tests covering:

- API endpoints
- Database operations
- Validation logic
- Error handling
- Edge cases

## 🐳 Docker Deployment

### Build Docker Images

```bash
# Build Issuance Service
cd services/issuance-service
docker build -t issuance-service:latest .

# Build Verification Service
cd services/verification-service
docker build -t verification-service:latest .

# Build Frontend
cd frontend
docker build -t kube-credential-frontend:latest .
```

### Run with Docker Compose

```bash
# From project root
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

Access the application:

- Frontend: http://localhost:3000
- Issuance Service: http://localhost:3001
- Verification Service: http://localhost:3002

## ☸️ Kubernetes Deployment

### Prerequisites

- Kubernetes cluster (Minikube, GKE, or AKS)
- kubectl configured
- Docker images pushed to a registry

### 1. Update Image References

Edit the deployment files in `k8s/` directory and replace `your-registry` with your actual Docker registry:

```yaml
image: your-registry/issuance-service:latest
```

### 2. Deploy to Kubernetes

```bash
# Create namespace
kubectl apply -f k8s/namespace.yaml

# Deploy ConfigMap
kubectl apply -f k8s/configmap.yaml

# Deploy services
kubectl apply -f k8s/issuance-deployment.yaml
kubectl apply -f k8s/verification-deployment.yaml
kubectl apply -f k8s/frontend-deployment.yaml

# Deploy Ingress (optional)
kubectl apply -f k8s/ingress.yaml

# Deploy HPA (optional)
kubectl apply -f k8s/hpa.yaml
```

### 3. Verify Deployment

```bash
# Check pods
kubectl get pods -n kube-credential

# Check services
kubectl get svc -n kube-credential

# Check deployments
kubectl get deployments -n kube-credential

# View logs
kubectl logs -f deployment/issuance-service -n kube-credential
```

### 4. Access the Application

```bash
# Get LoadBalancer IP (if using LoadBalancer service type)
kubectl get svc frontend -n kube-credential

# Port forward (for testing)
kubectl port-forward svc/frontend 3000:80 -n kube-credential
```

### Scaling

The deployments include Horizontal Pod Autoscalers (HPA) that automatically scale based on CPU and memory usage:

```bash
# View HPA status
kubectl get hpa -n kube-credential

# Manual scaling
kubectl scale deployment issuance-service --replicas=5 -n kube-credential
```


## 📚 API Documentation

### Issuance Service API

#### Issue Credential

```http
POST /api/issue-credential
Content-Type: application/json

{
  "id": "CRED-2025-001",
  "holderName": "John Doe",
  "credentialType": "Driver License",
  "issueDate": "2025-01-01",
  "expiryDate": "2030-01-01",
}

Response (201):
{
  "success": true,
  "message": "Credential issued by worker-1",
  "credential": { ... },
  "workerId": "worker-1",
  "timestamp": "2025-01-01T00:00:00.000Z"
}

Response (409 - Already Issued):
{
  "success": false,
  "message": "Credential already issued",
  "workerId": "worker-1",
  "timestamp": "2025-01-01T00:00:00.000Z"
}
```

#### Get All Credentials

```http
GET /api/credentials

Response (200):
{
  "success": true,
  "credentials": [ ... ],
  "count": 10,
  "workerId": "worker-1",
  "timestamp": "2025-01-01T00:00:00.000Z"
}
```

#### Get Credential by ID

```http
GET /api/credentials/:id

Response (200):
{
  "success": true,
  "credential": { ... },
  "workerId": "worker-1",
  "timestamp": "2025-01-01T00:00:00.000Z"
}
```

### Verification Service API

#### Verify Credential

```http
POST /api/verify
Content-Type: application/json

{
  "credential": {
    "id": "CRED-2025-001",
    "holderName": "John Doe",
    "credentialType": "Driver License",
    "issueDate": "2025-01-01"
  }
}

Response (200 - Valid):
{
  "success": true,
  "verified": true,
  "message": "Credential is valid and has been issued",
  "credential": { ... },
  "issuedBy": "issuance-worker-1",
  "issuedAt": "2025-01-01T00:00:00.000Z",
  "workerId": "verification-worker-1",
  "timestamp": "2025-01-01T00:00:00.000Z"
}

Response (200 - Invalid):
{
  "success": true,
  "verified": false,
  "message": "Credential not found in issuance records",
  "workerId": "verification-worker-1",
  "timestamp": "2025-01-01T00:00:00.000Z"
}
```

## 🎨 Design Decisions

### 1. Microservices Architecture

- **Decision**: Separate services for issuance and verification
- **Rationale**:
  - Independent scaling based on load
  - Separation of concerns
  - Easier maintenance and updates
  - Can be deployed independently

### 2. SQLite for Persistence

- **Decision**: Use SQLite for the issuance service
- **Rationale**:
  - Lightweight and serverless
  - No additional infrastructure required
  - Sufficient for the assignment scope
  - Easy to set up and use
  - Can be replaced with PostgreSQL/MySQL for production

### 3. HTTP Communication Between Services

- **Decision**: REST API calls between verification and issuance services
- **Rationale**:
  - Simple and straightforward
  - No additional message broker required
  - Suitable for synchronous verification
  - Easy to debug and monitor

### 4. TypeScript Throughout

- **Decision**: Use TypeScript for both backend and frontend
- **Rationale**:
  - Type safety reduces bugs
  - Better IDE support
  - Self-documenting code
  - Easier refactoring

### 5. React with Vite

- **Decision**: Use Vite instead of Create React App
- **Rationale**:
  - Faster build times
  - Better development experience
  - Modern tooling
  - Smaller bundle sizes

### 6. TailwindCSS for Styling

- **Decision**: Use TailwindCSS for UI styling
- **Rationale**:
  - Rapid development
  - Consistent design system
  - Small production bundle
  - Responsive by default

### 7. Worker ID Tracking

- **Decision**: Each pod reports its hostname as worker ID
- **Rationale**:
  - Demonstrates Kubernetes pod awareness
  - Helps with debugging and monitoring
  - Shows load distribution
  - Meets assignment requirements

## 📝 Assumptions

1. **Credential Uniqueness**: Credentials are uniquely identified by their `id` field
2. **Credential Immutability**: Once issued, credentials cannot be modified (only verified)
3. **Data Persistence**: SQLite is sufficient for the assignment; production would use a distributed database
4. **Network Reliability**: Services can communicate over HTTP within the cluster
5. **Authentication**: No authentication/authorization implemented (would be added for production)
6. **Credential Format**: JSON format is sufficient for credential representation
7. **Verification Logic**: Verification checks all credential fields match exactly
8. **Scalability**: Services are stateless (except for the database) and can be horizontally scaled
9. **Cloud Provider**: Any cloud provider with Kubernetes support works

## 🔒 Security Considerations (Production)

For production deployment, consider:

1. **Authentication & Authorization**: Implement JWT or OAuth2
2. **HTTPS**: Use TLS certificates for all communications
3. **Secrets Management**: Use Kubernetes Secrets or cloud provider secrets manager
4. **Database Encryption**: Encrypt data at rest
5. **Rate Limiting**: Implement rate limiting on APIs
6. **Input Validation**: Enhanced validation and sanitization
7. **CORS**: Restrict CORS to specific origins
8. **Network Policies**: Implement Kubernetes Network Policies
9. **Image Scanning**: Scan Docker images for vulnerabilities
10. **Audit Logging**: Comprehensive audit trail

## 🚀 Future Enhancements

1. **Persistent Storage**: Replace SQLite with PostgreSQL/MongoDB
2. **Message Queue**: Add RabbitMQ/Kafka for async operations
3. **Caching**: Implement Redis for frequently accessed data
4. **Monitoring**: Add Prometheus and Grafana
5. **Logging**: Centralized logging with ELK stack
6. **CI/CD**: GitHub Actions or GitLab CI pipeline
7. **API Gateway**: Kong or cloud provider API Gateway
8. **Service Mesh**: Istio for advanced traffic management
9. **Blockchain**: Store credential hashes on blockchain for immutability
10. **Mobile App**: React Native mobile application
