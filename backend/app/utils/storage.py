import os
import logging
from typing import Optional
from app.utils.config import settings

logger = logging.getLogger(__name__)

class StorageAdapter:
    """
    Adapter to manage file storage. Supports saving, reading, and deleting files
    either on the local disk (with persistent mounts) or via MinIO S3 object storage.
    """
    def __init__(self):
        self.storage_type = getattr(settings, "STORAGE_TYPE", "local").lower().strip()
        
        if self.storage_type == "local":
            self.base_dir = getattr(settings, "LOCAL_STORAGE_DIR", "storage")
            # Auto-create storage directory if missing
            if not os.path.exists(self.base_dir):
                os.makedirs(self.base_dir, exist_ok=True)
            logger.info(f"Initialized Local Storage Adapter at: {os.path.abspath(self.base_dir)}")
        elif self.storage_type == "minio":
            self.minio_endpoint = getattr(settings, "MINIO_ENDPOINT", "localhost:9000")
            self.minio_bucket = getattr(settings, "MINIO_BUCKET", "resumes")
            self.access_key = getattr(settings, "MINIO_ACCESS_KEY", "minioadmin")
            self.secret_key = getattr(settings, "MINIO_SECRET_KEY", "minioadmin")
            logger.info(f"Initialized MinIO Storage Adapter on bucket: {self.minio_bucket}")
        else:
            self.storage_type = "local"
            self.base_dir = "storage"
            if not os.path.exists(self.base_dir):
                os.makedirs(self.base_dir, exist_ok=True)
            logger.warning("Unknown STORAGE_TYPE. Defaulted to local disk storage.")

    def save_file(self, filename: str, content: bytes) -> str:
        """
        Saves file bytes and returns the access path or URL.
        """
        if self.storage_type == "local":
            filepath = os.path.join(self.base_dir, filename)
            # Ensure subdirectories are created if filename has subpaths
            os.makedirs(os.path.dirname(filepath), exist_ok=True)
            with open(filepath, "wb") as f:
                f.write(content)
            return filepath
        else:
            # MinIO mock upload fallback to local if client library boto3 is missing
            try:
                import boto3
                from botocore.client import Config
                
                s3 = boto3.client(
                    's3',
                    endpoint_url=f"http://{self.minio_endpoint}",
                    aws_access_key_id=self.access_key,
                    aws_secret_access_key=self.secret_key,
                    config=Config(signature_version='s3v4')
                )
                
                # Check / create bucket
                try:
                    s3.head_bucket(Bucket=self.minio_bucket)
                except Exception:
                    s3.create_bucket(Bucket=self.minio_bucket)
                    
                s3.put_object(
                    Bucket=self.minio_bucket,
                    Key=filename,
                    Body=content
                )
                return f"http://{self.minio_endpoint}/{self.minio_bucket}/{filename}"
                
            except Exception as e:
                logger.error(f"MinIO S3 upload failed ({str(e)}). Falling back to local disk write.")
                filepath = os.path.join("storage", filename)
                os.makedirs(os.path.dirname(filepath), exist_ok=True)
                with open(filepath, "wb") as f:
                    f.write(content)
                return filepath

    def get_file(self, filename: str) -> Optional[bytes]:
        """
        Retrieves file bytes. Returns None if the file does not exist.
        """
        if self.storage_type == "local":
            filepath = os.path.join(self.base_dir, filename)
            if not os.path.exists(filepath):
                return None
            with open(filepath, "rb") as f:
                return f.read()
        else:
            try:
                import boto3
                s3 = boto3.client(
                    's3',
                    endpoint_url=f"http://{self.minio_endpoint}",
                    aws_access_key_id=self.access_key,
                    aws_secret_access_key=self.secret_key
                )
                response = s3.get_object(Bucket=self.minio_bucket, Key=filename)
                return response['Body'].read()
            except Exception as e:
                logger.error(f"Failed to read from MinIO ({str(e)}). Checking local fallback.")
                filepath = os.path.join("storage", filename)
                if os.path.exists(filepath):
                    with open(filepath, "rb") as f:
                        return f.read()
                return None

    def delete_file(self, filename: str) -> bool:
        """
        Deletes the file. Returns True if deleted successfully.
        """
        if self.storage_type == "local":
            filepath = os.path.join(self.base_dir, filename)
            if os.path.exists(filepath):
                os.remove(filepath)
                return True
            return False
        else:
            try:
                import boto3
                s3 = boto3.client(
                    's3',
                    endpoint_url=f"http://{self.minio_endpoint}",
                    aws_access_key_id=self.access_key,
                    aws_secret_access_key=self.secret_key
                )
                s3.delete_object(Bucket=self.minio_bucket, Key=filename)
                return True
            except Exception as e:
                logger.error(f"Failed to delete from MinIO: {str(e)}")
                filepath = os.path.join("storage", filename)
                if os.path.exists(filepath):
                    os.remove(filepath)
                    return True
                return False

# Export a single global instance for application import
storage_adapter = StorageAdapter()
