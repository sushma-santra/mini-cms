# AWS S3 Setup Guide for Simple CMS

## Step 1: Create S3 Bucket

1. **Login to AWS Console**
   - Go to https://console.aws.amazon.com/
   - Navigate to S3 service

2. **Create Bucket**
   - Click "Create bucket"
   - Bucket name: `your-cms-uploads` (must be globally unique)
   - Region: Choose closest to your users
   - Uncheck "Block all public access"
   - Click "Create bucket"

## Step 2: Configure Bucket Permissions

### Bucket Policy
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::your-cms-uploads/*"
    }
  ]
}
```

### CORS Configuration
```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedOrigins": ["http://localhost:3000", "https://your-domain.com"],
    "ExposeHeaders": []
  }
]
```

## Step 3: Create IAM User

1. **Create User**: `cms-s3-user`
2. **Attach Policy**:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject"
      ],
      "Resource": "arn:aws:s3:::your-cms-uploads/*"
    }
  ]
}
```

3. **Generate Access Keys** and save them securely

## Step 4: Update Environment Variables

```env
AWS_ACCESS_KEY_ID="your_access_key"
AWS_SECRET_ACCESS_KEY="your_secret_key"
AWS_REGION="us-east-1"
AWS_S3_BUCKET="your-cms-uploads"
```

## Step 5: Switch Upload Endpoint

In `src/components/PostEditor.tsx`, change:
```javascript
const response = await fetch('/api/upload/local', {
```

To:
```javascript
const response = await fetch('/api/upload', {
```

Your images will now be stored in AWS S3! 