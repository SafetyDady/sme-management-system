"""
Structured logging configuration for production environment
"""
import logging
import logging.config
import structlog
import sys
from datetime import datetime
from typing import Any, Dict
import os

def setup_logging():
    """Configure structured logging for the application"""
    
    # Determine log level based on environment
    environment = os.getenv('ENVIRONMENT', 'development')
    log_level = 'DEBUG' if environment == 'development' else 'INFO'
    
    # Configure standard logging
    logging_config = {
        'version': 1,
        'disable_existing_loggers': False,
        'formatters': {
            'json': {
                'format': '%(asctime)s %(name)s %(levelname)s %(message)s',
                'class': 'pythonjsonlogger.jsonlogger.JsonFormatter'
            },
            'standard': {
                'format': '%(asctime)s [%(levelname)s] %(name)s: %(message)s',
                'datefmt': '%Y-%m-%d %H:%M:%S'
            }
        },
        'handlers': {
            'console': {
                'class': 'logging.StreamHandler',
                'level': log_level,
                'formatter': 'standard',
                'stream': sys.stdout
            },
            'file': {
                'class': 'logging.handlers.RotatingFileHandler',
                'level': log_level,
                'formatter': 'json' if environment == 'production' else 'standard',
                'filename': 'logs/app.log',
                'maxBytes': 10485760,  # 10MB
                'backupCount': 5
            },
            'error_file': {
                'class': 'logging.handlers.RotatingFileHandler',
                'level': 'ERROR',
                'formatter': 'json' if environment == 'production' else 'standard',
                'filename': 'logs/error.log',
                'maxBytes': 10485760,  # 10MB
                'backupCount': 5
            }
        },
        'loggers': {
            '': {  # Root logger
                'handlers': ['console', 'file'],
                'level': log_level,
                'propagate': False
            },
            'uvicorn': {
                'handlers': ['console', 'file'],
                'level': 'INFO',
                'propagate': False
            },
            'uvicorn.error': {
                'handlers': ['console', 'error_file'],
                'level': 'ERROR',
                'propagate': False
            },
            'sqlalchemy.engine': {
                'handlers': ['file'],
                'level': 'WARNING',  # Only log warnings and errors for SQL
                'propagate': False
            },
            'security': {
                'handlers': ['console', 'error_file'],
                'level': 'WARNING',
                'propagate': False
            }
        }
    }
    
    # Create logs directory if it doesn't exist
    os.makedirs('logs', exist_ok=True)
    
    # Apply logging configuration
    logging.config.dictConfig(logging_config)
    
    # Configure structlog
    structlog.configure(
        processors=[
            structlog.stdlib.filter_by_level,
            structlog.stdlib.add_logger_name,
            structlog.stdlib.add_log_level,
            structlog.stdlib.PositionalArgumentsFormatter(),
            structlog.processors.TimeStamper(fmt="iso"),
            structlog.processors.StackInfoRenderer(),
            structlog.processors.format_exc_info,
            structlog.processors.UnicodeDecoder(),
            structlog.processors.JSONRenderer() if environment == 'production' else structlog.dev.ConsoleRenderer()
        ],
        context_class=dict,
        logger_factory=structlog.stdlib.LoggerFactory(),
        wrapper_class=structlog.stdlib.BoundLogger,
        cache_logger_on_first_use=True,
    )

def get_logger(name: str = None):
    """Get a structured logger instance"""
    return structlog.get_logger(name)

# Request logging middleware
class RequestLoggingMiddleware:
    def __init__(self, app):
        self.app = app
        self.logger = get_logger("request")

    async def __call__(self, scope, receive, send):
        if scope["type"] == "http":
            start_time = datetime.now()
            
            # Extract request info
            method = scope.get("method", "")
            path = scope.get("path", "")
            query_string = scope.get("query_string", b"").decode()
            client_ip = None
            
            # Get client IP from headers
            for header_name, header_value in scope.get("headers", []):
                if header_name == b"x-forwarded-for":
                    client_ip = header_value.decode().split(",")[0].strip()
                    break
                elif header_name == b"x-real-ip":
                    client_ip = header_value.decode()
                    break
            
            if not client_ip:
                client = scope.get("client")
                client_ip = client[0] if client else "unknown"
            
            # Log request start
            self.logger.info(
                "Request started",
                method=method,
                path=path,
                query_string=query_string,
                client_ip=client_ip
            )
            
            # Process request
            status_code = 500  # Default to error
            
            async def send_wrapper(message):
                nonlocal status_code
                if message["type"] == "http.response.start":
                    status_code = message.get("status", 500)
                await send(message)
            
            try:
                await self.app(scope, receive, send_wrapper)
            except Exception as e:
                self.logger.error(
                    "Request failed with exception",
                    method=method,
                    path=path,
                    client_ip=client_ip,
                    error=str(e),
                    exc_info=True
                )
                raise
            finally:
                # Log request completion
                end_time = datetime.now()
                duration = (end_time - start_time).total_seconds()
                
                log_level = "info"
                if status_code >= 500:
                    log_level = "error"
                elif status_code >= 400:
                    log_level = "warning"
                
                getattr(self.logger, log_level)(
                    "Request completed",
                    method=method,
                    path=path,
                    status_code=status_code,
                    duration_seconds=duration,
                    client_ip=client_ip
                )
        else:
            await self.app(scope, receive, send)

# Database logging
def log_database_operation(operation: str, table: str, details: Dict[str, Any] = None):
    """Log database operations"""
    logger = get_logger("database")
    logger.info(
        "Database operation",
        operation=operation,
        table=table,
        details=details or {}
    )

# Authentication logging
def log_auth_event(event_type: str, username: str = None, success: bool = True, details: Dict[str, Any] = None):
    """Log authentication events"""
    logger = get_logger("auth")
    
    log_data = {
        "event_type": event_type,
        "username": username,
        "success": success,
        "details": details or {}
    }
    
    if success:
        logger.info("Authentication event", **log_data)
    else:
        logger.warning("Authentication failure", **log_data)

# Error logging
def log_error(error: Exception, context: Dict[str, Any] = None):
    """Log application errors"""
    logger = get_logger("error")
    logger.error(
        "Application error",
        error_type=type(error).__name__,
        error_message=str(error),
        context=context or {},
        exc_info=True
    )

