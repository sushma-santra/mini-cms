# Release Notes

## Version 1.2.0 - Enhanced Multiple Image Upload

### 🎯 New Features

#### **Multi-Aspect Ratio Image Cropping**
- **Enhanced Image Cropper**: Users can now crop the same image for multiple aspect ratios in a single session
- **Visual Crop Indicators**: Green dots show which aspect ratios have been cropped
- **Live Preview Panel**: Real-time preview of all cropped versions with thumbnails
- **Batch Upload**: All cropped versions upload simultaneously with consistent naming

#### **Organized Directory Structure**
- **Aspect Ratio Folders**: Images automatically organized by aspect ratio
  ```
  /uploads/images/
  ├── 1-1/          # Square (1:1)
  ├── 16-9/         # Landscape (16:9)  
  ├── 9-16/         # Portrait (9:16)
  ├── 21-9/         # Wide (21:9)
  ├── 4-3/          # Standard (4:3)
  └── free/         # Free crop
  ```
- **Consistent Naming**: Same filename across all aspect ratios, only directory path changes
- **Automatic Directory Creation**: Aspect ratio folders created automatically as needed

#### **Enhanced User Experience**
- **Grouped Image Display**: Images grouped by base filename showing version counts
- **Image Set Management**: Manage multiple versions of the same image as a set
- **Individual Version Control**: Remove specific versions or entire image sets
- **Progress Indicators**: Clear upload status and processing feedback
- **Version Counter**: Shows "Image Set 1 (3 versions)" for better organization

### 🔧 Technical Improvements

#### **New API Endpoints**
- **`/api/upload/multiple`**: Handles batch uploads for multiple aspect ratios
- **Atomic Operations**: All versions upload together or fail together
- **Enhanced Validation**: Maintains security with type and size checks

#### **Utility Functions**
- **`src/lib/image-utils.ts`**: Centralized aspect ratio management
- **Modular Architecture**: Clean separation of concerns for image processing
- **Extensible Design**: Easy to add new aspect ratios in the future

#### **Component Enhancements**
- **ImageCropper**: Multi-crop interface with preview panel
- **MultipleImageUploader**: Grouped image display with version management
- **PostEditor**: Updated to handle new image structure

### 🎮 User Workflow
1. **Select Image** → Click "Add Image" and select file
2. **Multi-Crop Interface** → Enhanced modal with cropper and preview
3. **Add Multiple Crops** → Select different ratios and crop each
4. **Preview Versions** → See all cropped versions with thumbnails
5. **Upload All** → Single click uploads all versions
6. **Grouped Display** → Organized view with version counts

### 🚀 Benefits
- **Professional Workflow**: Crop once, get multiple optimized versions
- **Consistent Organization**: Clean directory structure by aspect ratio
- **Efficient Management**: Visual grouping and version control
- **Future-Proof**: Extensible architecture for new aspect ratios
- **Same UI Flow**: Enhanced existing interface without breaking changes

### 📊 Performance Improvements
- **Batch Processing**: Multiple uploads processed efficiently
- **Reduced Server Calls**: Single API call for multiple versions
- **Optimized Storage**: Organized directory structure

---

## Version 1.0.0 - Initial Release

## Features

### Post Management System
- Complete CRUD operations for blog posts
- Rich text editor with formatting options
- Support for multiple images per post with different aspect ratios
- Featured image support
- Draft and published post states
- SEO metadata management (title and description)

### Image Management
- Multiple image upload support
- Different aspect ratio options:
  - Landscape
  - Portrait
  - Square
  - Wide
  - Standard
  - Free
- Image preview and management interface
- Automatic image optimization

### User Management
- Role-based access control (Admin and Author roles)
- Secure authentication system
- User profile management
- Password protection

### Admin Dashboard
- Post management interface
- User management interface
- Draft mode functionality
- Post status tracking
- SEO management

### Technical Features
- Next.js 14 with App Router
- Prisma ORM for database management
- TypeScript implementation
- Responsive design
- Modern UI with Tailwind CSS
- Secure API routes
- Environment variable configuration

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
4. Run database migrations:
   ```bash
   npx prisma migrate dev
   ```
5. Start the development server:
   ```bash
   npm run dev
   ```

## Default Admin Account
- Email: admin@example.com
- Password: admin123

## Default Author Account
- Email: author@example.com
- Password: test123

## Breaking Changes
None - This is the initial release.

## Known Issues
None at the moment.

## Future Roadmap
- Comment system
- Social media sharing
- Analytics integration
- Newsletter subscription
- Category and tag management 