from sqlalchemy.orm import Session, joinedload, selectinload
from sqlalchemy import func, and_, or_, text, Index
from typing import List, Dict, Any, Optional, Union
import redis
import json
import pickle
import gzip
from datetime import datetime, timedelta
import asyncio
from concurrent.futures import ThreadPoolExecutor
import logging
import os
import time
import psutil
import gc
from functools import wraps
import multiprocessing

from . import crud, models
from .database import get_db

logger = logging.getLogger(__name__)

class CacheManager:
    """Advanced caching system for performance optimization"""
    
    def __init__(self):
        self.redis_client = redis.Redis.from_url(
            os.getenv("REDIS_URL", "redis://localhost:6379/0"),
            decode_responses=False  # Keep binary for compressed data
        )
        self.cache_ttl = {
            "user_data": 3600,  # 1 hour
            "project_data": 1800,  # 30 minutes
            "analytics": 7200,  # 2 hours
            "geospatial": 3600,  # 1 hour
            "ai_results": 86400,  # 24 hours
            "search_results": 900,  # 15 minutes
        }
    
    def _compress_data(self, data: Any) -> bytes:
        """Compress data for storage"""
        serialized = pickle.dumps(data)
        return gzip.compress(serialized)
    
    def _decompress_data(self, compressed_data: bytes) -> Any:
        """Decompress data from storage"""
        decompressed = gzip.decompress(compressed_data)
        return pickle.loads(decompressed)
    
    def _get_cache_key(self, prefix: str, identifier: str) -> str:
        """Generate cache key"""
        return f"cache:{prefix}:{identifier}"
    
    async def get_cached_data(self, prefix: str, identifier: str) -> Optional[Any]:
        """Get data from cache"""
        try:
            cache_key = self._get_cache_key(prefix, identifier)
            cached_data = self.redis_client.get(cache_key)
            
            if cached_data:
                # Update cache hit metrics
                self.redis_client.incr("cache_hits")
                return self._decompress_data(cached_data)
            
            # Update cache miss metrics
            self.redis_client.incr("cache_misses")
            return None
            
        except Exception as e:
            logger.error(f"Cache get error: {e}")
            return None
    
    async def set_cached_data(self, prefix: str, identifier: str, data: Any, ttl: Optional[int] = None) -> bool:
        """Set data in cache"""
        try:
            cache_key = self._get_cache_key(prefix, identifier)
            compressed_data = self._compress_data(data)
            
            if ttl is None:
                ttl = self.cache_ttl.get(prefix, 3600)
            
            return self.redis_client.setex(cache_key, ttl, compressed_data)
            
        except Exception as e:
            logger.error(f"Cache set error: {e}")
            return False
    
    async def invalidate_cache(self, prefix: str, identifier: Optional[str] = None) -> bool:
        """Invalidate cache entries"""
        try:
            if identifier:
                cache_key = self._get_cache_key(prefix, identifier)
                return bool(self.redis_client.delete(cache_key))
            else:
                # Invalidate all keys with prefix
                pattern = f"cache:{prefix}:*"
                keys = self.redis_client.keys(pattern)
                if keys:
                    return bool(self.redis_client.delete(*keys))
                return True
                
        except Exception as e:
            logger.error(f"Cache invalidation error: {e}")
            return False
    
    async def get_cache_stats(self) -> Dict[str, Any]:
        """Get cache statistics"""
        try:
            hits = int(self.redis_client.get("cache_hits") or 0)
            misses = int(self.redis_client.get("cache_misses") or 0)
            total = hits + misses
            hit_rate = (hits / total * 100) if total > 0 else 0
            
            return {
                "hits": hits,
                "misses": misses,
                "hit_rate": hit_rate,
                "total_requests": total
            }
        except Exception as e:
            logger.error(f"Cache stats error: {e}")
            return {}

class DatabaseOptimizer:
    """Database optimization and query performance management"""
    
    def __init__(self):
        self.query_cache = {}
        self.slow_query_threshold = 1.0  # seconds
    
    async def optimize_query(self, query, use_cache: bool = True) -> Any:
        """Optimize database query with caching and performance monitoring"""
        import time
        start_time = time.time()
        
        try:
            # Check cache first
            if use_cache:
                cache_key = str(hash(str(query)))
                cached_result = await cache_manager.get_cached_data("query", cache_key)
                if cached_result:
                    return cached_result
            
            # Execute query
            result = query.all()
            
            # Cache result
            if use_cache:
                cache_key = str(hash(str(query)))
                await cache_manager.set_cached_data("query", cache_key, result, ttl=1800)
            
            # Monitor performance
            execution_time = time.time() - start_time
            if execution_time > self.slow_query_threshold:
                logger.warning(f"Slow query detected: {execution_time:.2f}s")
            
            return result
            
        except Exception as e:
            logger.error(f"Query optimization error: {e}")
            raise
    
    async def create_database_indexes(self, db: Session):
        """Create performance indexes for common queries"""
        try:
            # User indexes
            db.execute(text("""
                CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
                CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);
            """))
            
            # Project indexes
            db.execute(text("""
                CREATE INDEX IF NOT EXISTS idx_projects_owner_id ON projects(owner_id);
                CREATE INDEX IF NOT EXISTS idx_projects_commodity ON projects(commodity);
                CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at);
            """))
            
            # Drill hole indexes
            db.execute(text("""
                CREATE INDEX IF NOT EXISTS idx_drillholes_project_id ON drillholes(project_id);
                CREATE INDEX IF NOT EXISTS idx_drillholes_elevation ON drillholes(elevation);
            """))
            
            # AI run indexes
            db.execute(text("""
                CREATE INDEX IF NOT EXISTS idx_ai_runs_project_id ON ai_runs(project_id);
                CREATE INDEX IF NOT EXISTS idx_ai_runs_status ON ai_runs(status);
                CREATE INDEX IF NOT EXISTS idx_ai_runs_submission_time ON ai_runs(submission_time);
            """))
            
            # Usage indexes
            db.execute(text("""
                CREATE INDEX IF NOT EXISTS idx_usage_user_id ON usage(user_id);
                CREATE INDEX IF NOT EXISTS idx_usage_type ON usage(usage_type);
                CREATE INDEX IF NOT EXISTS idx_usage_created_at ON usage(created_at);
            """))
            
            # Subscription indexes
            db.execute(text("""
                CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
                CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
            """))
            
            db.commit()
            logger.info("Database indexes created successfully")
            
        except Exception as e:
            logger.error(f"Database index creation error: {e}")
            db.rollback()
    
    async def analyze_query_performance(self, db: Session) -> Dict[str, Any]:
        """Analyze database query performance"""
        try:
            # Get slow queries from PostgreSQL
            slow_queries = db.execute(text("""
                SELECT 
                    query,
                    calls,
                    total_time,
                    mean_time,
                    rows
                FROM pg_stat_statements 
                ORDER BY mean_time DESC 
                LIMIT 10
            """)).fetchall()
            
            # Get table statistics
            table_stats = db.execute(text("""
                SELECT 
                    schemaname,
                    tablename,
                    attname,
                    n_distinct,
                    correlation
                FROM pg_stats 
                WHERE schemaname = 'public'
                ORDER BY n_distinct DESC
            """)).fetchall()
            
            return {
                "slow_queries": [dict(row) for row in slow_queries],
                "table_statistics": [dict(row) for row in table_stats]
            }
            
        except Exception as e:
            logger.error(f"Query performance analysis error: {e}")
            return {}

class LargeDatasetHandler:
    """Handle large datasets with pagination, streaming, and chunking"""
    
    def __init__(self):
        self.chunk_size = 1000
        self.max_memory_usage = 1024 * 1024 * 100  # 100MB
    
    async def paginated_query(self, db: Session, query, page: int = 1, page_size: int = 100) -> Dict[str, Any]:
        """Execute paginated query"""
        try:
            total_count = query.count()
            total_pages = (total_count + page_size - 1) // page_size
            
            offset = (page - 1) * page_size
            paginated_query = query.offset(offset).limit(page_size)
            
            results = await database_optimizer.optimize_query(paginated_query)
            
            return {
                "data": results,
                "pagination": {
                    "page": page,
                    "page_size": page_size,
                    "total_count": total_count,
                    "total_pages": total_pages,
                    "has_next": page < total_pages,
                    "has_prev": page > 1
                }
            }
            
        except Exception as e:
            logger.error(f"Paginated query error: {e}")
            raise
    
    async def stream_large_dataset(self, db: Session, query, chunk_size: int = None) -> List[Any]:
        """Stream large dataset in chunks"""
        if chunk_size is None:
            chunk_size = self.chunk_size
        
        try:
            results = []
            offset = 0
            
            while True:
                chunk = query.offset(offset).limit(chunk_size).all()
                
                if not chunk:
                    break
                
                results.extend(chunk)
                offset += chunk_size
                
                # Check memory usage
                if len(results) * 1000 > self.max_memory_usage:  # Rough estimate
                    logger.warning("Memory usage limit reached during streaming")
                    break
            
            return results
            
        except Exception as e:
            logger.error(f"Dataset streaming error: {e}")
            raise
    
    async def process_large_dataset_async(self, db: Session, query, processor_func) -> List[Any]:
        """Process large dataset asynchronously"""
        try:
            # Get total count
            total_count = query.count()
            
            # Process in chunks
            results = []
            chunk_size = self.chunk_size
            total_chunks = (total_count + chunk_size - 1) // chunk_size
            
            with ThreadPoolExecutor(max_workers=4) as executor:
                futures = []
                
                for chunk_num in range(total_chunks):
                    offset = chunk_num * chunk_size
                    chunk_query = query.offset(offset).limit(chunk_size)
                    
                    future = executor.submit(self._process_chunk, chunk_query, processor_func)
                    futures.append(future)
                
                # Collect results
                for future in futures:
                    chunk_result = future.result()
                    results.extend(chunk_result)
            
            return results
            
        except Exception as e:
            logger.error(f"Async dataset processing error: {e}")
            raise
    
    def _process_chunk(self, chunk_query, processor_func):
        """Process a single chunk of data"""
        try:
            chunk_data = chunk_query.all()
            return [processor_func(item) for item in chunk_data]
        except Exception as e:
            logger.error(f"Chunk processing error: {e}")
            return []

class GeospatialOptimizer:
    """Optimize geospatial queries and operations"""
    
    def __init__(self):
        self.spatial_index_cache = {}
    
    async def optimize_geospatial_query(self, db: Session, query, spatial_column: str) -> Any:
        """Optimize geospatial query with spatial indexing"""
        try:
            # Add spatial index if not exists
            table_name = query.column_descriptions[0]['name']
            index_name = f"idx_{table_name}_{spatial_column}_spatial"
            
            if index_name not in self.spatial_index_cache:
                db.execute(text(f"""
                    CREATE INDEX IF NOT EXISTS {index_name} 
                    ON {table_name} 
                    USING GIST ({spatial_column})
                """))
                self.spatial_index_cache[index_name] = True
            
            # Execute optimized query
            return await database_optimizer.optimize_query(query)
            
        except Exception as e:
            logger.error(f"Geospatial optimization error: {e}")
            raise
    
    async def batch_geospatial_operations(self, db: Session, operations: List[Dict[str, Any]]) -> List[Any]:
        """Batch geospatial operations for better performance"""
        try:
            results = []
            
            # Group operations by type
            grouped_ops = {}
            for op in operations:
                op_type = op.get('type')
                if op_type not in grouped_ops:
                    grouped_ops[op_type] = []
                grouped_ops[op_type].append(op)
            
            # Process each group
            for op_type, ops in grouped_ops.items():
                if op_type == 'intersection':
                    batch_result = await self._batch_intersection(db, ops)
                elif op_type == 'buffer':
                    batch_result = await self._batch_buffer(db, ops)
                elif op_type == 'distance':
                    batch_result = await self._batch_distance(db, ops)
                else:
                    batch_result = []
                
                results.extend(batch_result)
            
            return results
            
        except Exception as e:
            logger.error(f"Batch geospatial operations error: {e}")
            raise
    
    async def _batch_intersection(self, db: Session, operations: List[Dict[str, Any]]) -> List[Any]:
        """Batch intersection operations"""
        # Implementation for batch intersection
        return []
    
    async def _batch_buffer(self, db: Session, operations: List[Dict[str, Any]]) -> List[Any]:
        """Batch buffer operations"""
        # Implementation for batch buffer
        return []
    
    async def _batch_distance(self, db: Session, operations: List[Dict[str, Any]]) -> List[Any]:
        """Batch distance calculations"""
        # Implementation for batch distance
        return []

class PerformanceMonitor:
    """Monitor and track system performance metrics"""
    
    def __init__(self):
        self.metrics = {}
        self.thresholds = {
            "cpu_usage": 80.0,
            "memory_usage": 85.0,
            "disk_usage": 90.0,
            "response_time": 2.0,
            "database_connections": 80
        }
    
    async def get_system_metrics(self) -> Dict[str, Any]:
        """Get current system performance metrics"""
        metrics = {
            "timestamp": datetime.utcnow().isoformat(),
            "cpu": {
                "usage_percent": psutil.cpu_percent(interval=1),
                "count": psutil.cpu_count(),
                "frequency": psutil.cpu_freq()._asdict() if psutil.cpu_freq() else None
            },
            "memory": {
                "total": psutil.virtual_memory().total,
                "available": psutil.virtual_memory().available,
                "used": psutil.virtual_memory().used,
                "percent": psutil.virtual_memory().percent
            },
            "disk": {
                "total": psutil.disk_usage('/').total,
                "used": psutil.disk_usage('/').used,
                "free": psutil.disk_usage('/').free,
                "percent": psutil.disk_usage('/').percent
            },
            "network": {
                "bytes_sent": psutil.net_io_counters().bytes_sent,
                "bytes_recv": psutil.net_io_counters().bytes_recv
            }
        }
        
        # Store metrics in Redis
        await redis_client.setex(
            f"system_metrics:{datetime.utcnow().strftime('%Y%m%d_%H%M')}",
            3600,  # 1 hour TTL
            json.dumps(metrics)
        )
        
        return metrics
    
    async def check_alerts(self) -> List[Dict[str, Any]]:
        """Check for performance alerts"""
        metrics = await self.get_system_metrics()
        alerts = []
        
        # Check CPU usage
        if metrics["cpu"]["usage_percent"] > self.thresholds["cpu_usage"]:
            alerts.append({
                "type": "high_cpu_usage",
                "value": metrics["cpu"]["usage_percent"],
                "threshold": self.thresholds["cpu_usage"],
                "severity": "warning",
                "timestamp": datetime.utcnow().isoformat()
            })
        
        # Check memory usage
        if metrics["memory"]["percent"] > self.thresholds["memory_usage"]:
            alerts.append({
                "type": "high_memory_usage",
                "value": metrics["memory"]["percent"],
                "threshold": self.thresholds["memory_usage"],
                "severity": "critical",
                "timestamp": datetime.utcnow().isoformat()
            })
        
        # Check disk usage
        if metrics["disk"]["percent"] > self.thresholds["disk_usage"]:
            alerts.append({
                "type": "high_disk_usage",
                "value": metrics["disk"]["percent"],
                "threshold": self.thresholds["disk_usage"],
                "severity": "critical",
                "timestamp": datetime.utcnow().isoformat()
            })
        
        return alerts

class DataProcessor:
    """Efficient data processing for large datasets"""
    
    def __init__(self):
        self.max_workers = min(multiprocessing.cpu_count(), 8)
        self.chunk_size = 1000
        self.executor = ThreadPoolExecutor(max_workers=self.max_workers)
    
    async def process_large_dataset(self, data: List[Any], 
                                  processor_func: Callable,
                                  chunk_size: Optional[int] = None) -> List[Any]:
        """Process large datasets in chunks"""
        chunk_size = chunk_size or self.chunk_size
        results = []
        
        # Split data into chunks
        chunks = [data[i:i + chunk_size] for i in range(0, len(data), chunk_size)]
        
        # Process chunks in parallel
        loop = asyncio.get_event_loop()
        tasks = []
        
        for chunk in chunks:
            task = loop.run_in_executor(self.executor, processor_func, chunk)
            tasks.append(task)
        
        # Wait for all tasks to complete
        chunk_results = await asyncio.gather(*tasks)
        
        # Combine results
        for chunk_result in chunk_results:
            results.extend(chunk_result)
        
        return results
    
    async def batch_database_operations(self, db: AsyncSession,
                                      operations: List[Callable],
                                      batch_size: int = 100) -> List[Any]:
        """Execute database operations in batches"""
        results = []
        
        for i in range(0, len(operations), batch_size):
            batch = operations[i:i + batch_size]
            
            # Execute batch
            batch_results = []
            for operation in batch:
                try:
                    result = await operation(db)
                    batch_results.append(result)
                except Exception as e:
                    logger.error(f"Error in batch operation: {e}")
                    batch_results.append(None)
            
            results.extend(batch_results)
            
            # Commit batch
            await db.commit()
            
            # Small delay to prevent overwhelming the database
            await asyncio.sleep(0.1)
        
        return results
    
    def optimize_memory_usage(self):
        """Optimize memory usage"""
        # Force garbage collection
        gc.collect()
        
        # Clear any cached data if memory usage is high
        memory_percent = psutil.virtual_memory().percent
        if memory_percent > 80:
            logger.warning(f"High memory usage detected: {memory_percent}%")
            # Clear some caches or reduce memory usage

class QueryOptimizer:
    """Query optimization utilities"""
    
    @staticmethod
    def optimize_select_query(query: str, limit: Optional[int] = None) -> str:
        """Optimize SELECT queries"""
        # Add LIMIT if not present and limit is specified
        if limit and "LIMIT" not in query.upper():
            query += f" LIMIT {limit}"
        
        # Add ORDER BY if not present (helps with consistent performance)
        if "ORDER BY" not in query.upper():
            # Try to find a primary key or id column
            if "id" in query.lower():
                query += " ORDER BY id"
        
        return query
    
    @staticmethod
    def create_pagination_query(query: str, page: int, page_size: int) -> str:
        """Create paginated query"""
        offset = (page - 1) * page_size
        return f"{query} LIMIT {page_size} OFFSET {offset}"
    
    @staticmethod
    def add_index_hints(query: str, table_name: str, index_name: str) -> str:
        """Add index hints to query"""
        # This is PostgreSQL specific
        return query.replace(
            f"FROM {table_name}",
            f"FROM {table_name} USE INDEX ({index_name})"
        )

class PerformanceDecorator:
    """Decorator for performance monitoring"""
    
    @staticmethod
    def monitor_performance(func_name: Optional[str] = None):
        """Decorator to monitor function performance"""
        def decorator(func):
            @wraps(func)
            async def wrapper(*args, **kwargs):
                start_time = time.time()
                start_memory = psutil.Process().memory_info().rss
                
                try:
                    result = await func(*args, **kwargs)
                    
                    # Record performance metrics
                    execution_time = time.time() - start_time
                    memory_used = psutil.Process().memory_info().rss - start_memory
                    
                    # Store metrics in Redis
                    metrics = {
                        "function": func_name or func.__name__,
                        "execution_time": execution_time,
                        "memory_used": memory_used,
                        "timestamp": datetime.utcnow().isoformat(),
                        "success": True
                    }
                    
                    await redis_client.lpush(
                        f"performance_metrics:{func.__name__}",
                        json.dumps(metrics)
                    )
                    await redis_client.ltrim(
                        f"performance_metrics:{func.__name__}",
                        0, 99  # Keep last 100 metrics
                    )
                    
                    return result
                
                except Exception as e:
                    # Record error metrics
                    execution_time = time.time() - start_time
                    memory_used = psutil.Process().memory_info().rss - start_memory
                    
                    error_metrics = {
                        "function": func_name or func.__name__,
                        "execution_time": execution_time,
                        "memory_used": memory_used,
                        "timestamp": datetime.utcnow().isoformat(),
                        "success": False,
                        "error": str(e)
                    }
                    
                    await redis_client.lpush(
                        f"performance_metrics:{func.__name__}",
                        json.dumps(error_metrics)
                    )
                    
                    raise
            
            return wrapper
        return decorator

class LoadBalancer:
    """Simple load balancing for database connections"""
    
    def __init__(self, database_urls: List[str]):
        self.database_urls = database_urls
        self.current_index = 0
        self.connection_pools = {}
        
        # Initialize connection pools for each database
        for i, url in enumerate(database_urls):
            self.connection_pools[f"db_{i}"] = create_engine(
                url,
                poolclass=QueuePool,
                pool_size=10,
                max_overflow=20,
                pool_pre_ping=True
            )
    
    def get_next_connection(self) -> str:
        """Get next database connection using round-robin"""
        connection = self.database_urls[self.current_index]
        self.current_index = (self.current_index + 1) % len(self.database_urls)
        return connection
    
    async def get_connection_pool(self, pool_name: Optional[str] = None) -> Any:
        """Get connection pool"""
        if pool_name is None:
            pool_name = f"db_{self.current_index}"
        return self.connection_pools.get(pool_name)

# Global instances
cache_manager = CacheManager()
database_optimizer = DatabaseOptimizer()
large_dataset_handler = LargeDatasetHandler()
geospatial_optimizer = GeospatialOptimizer()
performance_monitor = PerformanceMonitor()
data_processor = DataProcessor()
query_optimizer = QueryOptimizer()

# Initialize database optimizer with default URL
database_url = os.getenv("DATABASE_URL", "postgresql://user:password@localhost/geovision_ai_miner")
database_optimizer = DatabaseOptimizer(database_url)

# Initialize load balancer if multiple databases are configured
database_urls = os.getenv("DATABASE_URLS", "").split(",")
if len(database_urls) > 1:
    load_balancer = LoadBalancer(database_urls)
else:
    load_balancer = None

# Performance decorators
def track_performance(query_name: str):
    """Decorator to track query performance"""
    def decorator(func):
        async def wrapper(*args, **kwargs):
            import time
            start_time = time.time()
            
            try:
                result = await func(*args, **kwargs)
                execution_time = time.time() - start_time
                await performance_monitor.track_query_performance(query_name, execution_time, True)
                return result
            except Exception as e:
                execution_time = time.time() - start_time
                await performance_monitor.track_query_performance(query_name, execution_time, False)
                raise
        
        return wrapper
    return decorator

def cache_result(prefix: str, ttl: Optional[int] = None):
    """Decorator to cache function results"""
    def decorator(func):
        async def wrapper(*args, **kwargs):
            # Generate cache key from function name and arguments
            cache_key = f"{func.__name__}:{hash(str(args) + str(kwargs))}"
            
            # Try to get from cache
            cached_result = await cache_manager.get_cached_data(prefix, cache_key)
            if cached_result:
                return cached_result
            
            # Execute function and cache result
            result = await func(*args, **kwargs)
            await cache_manager.set_cached_data(prefix, cache_key, result, ttl)
            
            return result
        
        return wrapper
    return decorator 