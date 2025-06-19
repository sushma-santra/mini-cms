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

## Step 3: Set up AWS Profile (Recommended)

### Option A: Using AWS CLI (Recommended)
1. **Install AWS CLI** if not already installed
   ```bash
   # Ubuntu/Debian
   sudo apt install awscli
   
   # macOS
   brew install awscli
   
   # Windows
   # Download from https://aws.amazon.com/cli/
   ```

2. **Configure AWS Profile**
   ```bash
   aws configure
   ```
   
   Enter the following when prompted:
   - AWS Access Key ID: [Your access key]
   - AWS Secret Access Key: [Your secret key]
   - Default region name: us-east-1
   - Default output format: json

3. **Create a specific profile for the CMS** (optional)
   ```bash
   aws configure --profile cms-s3-user
   ```

### Option B: Manual Profile Setup
1. **Create AWS credentials file**
   ```bash
   mkdir -p ~/.aws
   nano ~/.aws/credentials
   ```

2. **Add your credentials**
   ```ini
   [default]
   aws_access_key_id = YOUR_ACCESS_KEY
   aws_secret_access_key = YOUR_SECRET_KEY

   [cms-s3-user]
   aws_access_key_id = YOUR_CMS_ACCESS_KEY
   aws_secret_access_key = YOUR_CMS_SECRET_KEY
   ```

3. **Create AWS config file**
   ```bash
   nano ~/.aws/config
   ```

4. **Add your configuration**
   ```ini
   [default]
   region = us-east-1
   output = json

   [profile cms-s3-user]
   region = us-east-1
   output = json
   ```

## Step 4: Create IAM User (if using specific profile)

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

## Step 5: Update Environment Variables

```env
# Use default profile (recommended)
AWS_REGION="us-east-1"
AWS_S3_BUCKET="your-cms-uploads"

# OR use specific profile
AWS_PROFILE="cms-s3-user"
AWS_REGION="us-east-1"
AWS_S3_BUCKET="your-cms-uploads"
```

## Step 6: Test Configuration

1. **Test AWS profile access**
   ```bash
   # Test with default profile
   aws s3 ls s3://your-cms-uploads
   
   # Test with specific profile
   aws s3 ls s3://your-cms-uploads --profile cms-s3-user
   ```

2. **Start your application**
   ```bash
   npm run dev
   ```

3. **Test image upload** in the CMS admin panel

## Security Benefits of Using AWS Profiles

✅ **No access keys in environment variables** - credentials are stored securely in `~/.aws/credentials`  
✅ **Automatic credential rotation** - easier to manage and rotate credentials  
✅ **Multiple profiles** - can use different credentials for different environments  
✅ **AWS CLI integration** - seamless integration with AWS CLI and other AWS tools  
✅ **IAM role support** - can use IAM roles when running on EC2 or other AWS services  

Your images will now be stored in AWS S3 using secure profile-based authentication! 🚀 