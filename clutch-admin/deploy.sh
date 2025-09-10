#!/bin/bash

# Clutch Admin Production Deployment Script
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="clutch-admin"
DOCKER_COMPOSE_FILE="docker-compose.prod.yml"
ENV_FILE=".env.production"
BACKUP_DIR="./backups"
LOG_FILE="./deploy.log"

# Functions
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a $LOG_FILE
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1" | tee -a $LOG_FILE
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a $LOG_FILE
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a $LOG_FILE
    exit 1
}

# Check prerequisites
check_prerequisites() {
    log "Checking prerequisites..."
    
    if ! command -v docker &> /dev/null; then
        error "Docker is not installed"
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        error "Docker Compose is not installed"
    fi
    
    if [ ! -f "$ENV_FILE" ]; then
        error "Environment file $ENV_FILE not found"
    fi
    
    success "Prerequisites check passed"
}

# Backup current deployment
backup_deployment() {
    log "Creating backup of current deployment..."
    
    mkdir -p $BACKUP_DIR
    BACKUP_NAME="backup-$(date +'%Y%m%d-%H%M%S')"
    
    # Backup database
    if docker-compose -f $DOCKER_COMPOSE_FILE ps postgres | grep -q "Up"; then
        log "Backing up database..."
        docker-compose -f $DOCKER_COMPOSE_FILE exec -T postgres pg_dump -U $POSTGRES_USER $POSTGRES_DB > "$BACKUP_DIR/$BACKUP_NAME-database.sql"
    fi
    
    # Backup uploads
    if [ -d "./uploads" ]; then
        log "Backing up uploads..."
        tar -czf "$BACKUP_DIR/$BACKUP_NAME-uploads.tar.gz" ./uploads
    fi
    
    # Backup logs
    if [ -d "./logs" ]; then
        log "Backing up logs..."
        tar -czf "$BACKUP_DIR/$BACKUP_NAME-logs.tar.gz" ./logs
    fi
    
    success "Backup created: $BACKUP_NAME"
}

# Run tests
run_tests() {
    log "Running tests..."
    
    # Build test image
    docker build -t $APP_NAME-test -f Dockerfile.test .
    
    # Run tests
    if docker run --rm $APP_NAME-test npm test; then
        success "Tests passed"
    else
        error "Tests failed"
    fi
}

# Build and deploy
deploy() {
    log "Building and deploying application..."
    
    # Pull latest images
    docker-compose -f $DOCKER_COMPOSE_FILE pull
    
    # Build application
    docker-compose -f $DOCKER_COMPOSE_FILE build --no-cache
    
    # Stop current services
    docker-compose -f $DOCKER_COMPOSE_FILE down
    
    # Start services
    docker-compose -f $DOCKER_COMPOSE_FILE up -d
    
    # Wait for services to be ready
    log "Waiting for services to be ready..."
    sleep 30
    
    # Health check
    if curl -f http://localhost:3000/api/health; then
        success "Application is healthy"
    else
        error "Application health check failed"
    fi
}

# Run database migrations
run_migrations() {
    log "Running database migrations..."
    
    # Wait for database to be ready
    sleep 10
    
    # Run migrations
    docker-compose -f $DOCKER_COMPOSE_FILE exec clutch-admin npm run migrate
    
    success "Database migrations completed"
}

# Setup monitoring
setup_monitoring() {
    log "Setting up monitoring..."
    
    # Wait for monitoring services to be ready
    sleep 20
    
    # Check Prometheus
    if curl -f http://localhost:9090/-/healthy; then
        success "Prometheus is running"
    else
        warning "Prometheus health check failed"
    fi
    
    # Check Grafana
    if curl -f http://localhost:3001/api/health; then
        success "Grafana is running"
    else
        warning "Grafana health check failed"
    fi
}

# Cleanup old resources
cleanup() {
    log "Cleaning up old resources..."
    
    # Remove unused images
    docker image prune -f
    
    # Remove unused volumes
    docker volume prune -f
    
    # Remove old backups (keep last 7 days)
    find $BACKUP_DIR -name "backup-*" -type f -mtime +7 -delete
    
    success "Cleanup completed"
}

# Send deployment notification
send_notification() {
    log "Sending deployment notification..."
    
    # This would integrate with your notification system (Slack, email, etc.)
    # curl -X POST -H 'Content-type: application/json' \
    #     --data '{"text":"Clutch Admin v2.0.0 deployed successfully!"}' \
    #     $SLACK_WEBHOOK_URL
    
    success "Notification sent"
}

# Main deployment function
main() {
    log "Starting deployment of Clutch Admin v2.0.0"
    
    check_prerequisites
    backup_deployment
    run_tests
    deploy
    run_migrations
    setup_monitoring
    cleanup
    send_notification
    
    success "Deployment completed successfully!"
    log "Application is available at: https://admin.clutch.com"
    log "Monitoring dashboard: http://localhost:3001"
    log "Prometheus metrics: http://localhost:9090"
}

# Handle script arguments
case "${1:-}" in
    --backup-only)
        check_prerequisites
        backup_deployment
        ;;
    --test-only)
        check_prerequisites
        run_tests
        ;;
    --deploy-only)
        check_prerequisites
        deploy
        ;;
    --monitoring-only)
        setup_monitoring
        ;;
    --cleanup-only)
        cleanup
        ;;
    --help)
        echo "Usage: $0 [OPTIONS]"
        echo "Options:"
        echo "  --backup-only     Only create backup"
        echo "  --test-only       Only run tests"
        echo "  --deploy-only     Only deploy application"
        echo "  --monitoring-only Only setup monitoring"
        echo "  --cleanup-only    Only cleanup resources"
        echo "  --help           Show this help message"
        ;;
    *)
        main
        ;;
esac
