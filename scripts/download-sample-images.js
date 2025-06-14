const fs = require('fs')
const path = require('path')
const https = require('https')

const uploadsDir = path.join(process.cwd(), 'public', 'uploads')

// Create uploads directory if it doesn't exist
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
}

// Sample images from Unsplash
const images = [
  {
    url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c',
    filename: 'sample-1.jpg'
  },
  {
    url: 'https://images.unsplash.com/photo-1555066931-bf19f8fd8865',
    filename: 'sample-2.jpg'
  },
  {
    url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c',
    filename: 'sample-3.jpg'
  },
  {
    url: 'https://images.unsplash.com/photo-1555066931-bf19f8fd8865',
    filename: 'sample-4.jpg'
  },
  {
    url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c',
    filename: 'sample-5.jpg'
  },
  {
    url: 'https://images.unsplash.com/photo-1555066931-bf19f8fd8865',
    filename: 'sample-6.jpg'
  }
]

async function downloadImage(url, filename) {
  return new Promise((resolve, reject) => {
    const filePath = path.join(uploadsDir, filename)
    const file = fs.createWriteStream(filePath)

    https.get(url, (response) => {
      response.pipe(file)
      file.on('finish', () => {
        file.close()
        console.log(`Downloaded ${filename}`)
        resolve()
      })
    }).on('error', (err) => {
      fs.unlink(filePath, () => {}) // Delete the file if there's an error
      reject(err)
    })
  })
}

async function main() {
  try {
    for (const image of images) {
      await downloadImage(image.url, image.filename)
    }
    console.log('All sample images downloaded successfully!')
  } catch (error) {
    console.error('Error downloading images:', error)
    process.exit(1)
  }
}

main() 