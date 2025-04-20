export interface ApiError {
  error: string;
  code: string;
  details?: Record<string, any>;
}

export interface GetPresignedUrlRequest {
  key: string;
  bucket?: string;
}

export interface GetPresignedUrlResponse {
  url: string;
  expiresIn: number;
}

export enum ErrorCodes {
  BAD_REQUEST = '400',
  NOT_FOUND = '404',
  CONFLICT = '409',
  INTERNAL_SERVER_ERROR = '500'
}

export function validateBucketName(bucket: string): boolean {
  // S3 bucket name validation rules
  const bucketRegex = /^[a-z0-9][a-z0-9.-]*[a-z0-9]$/;
  return bucketRegex.test(bucket) && bucket.length >= 3 && bucket.length <= 63;
}

export function validateObjectKey(key: string): boolean {
  // S3 object key validation rules
  return key.length > 0 && key.length <= 1024;
} 