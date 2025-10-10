# 📸 Media & Embeds Guide

Your CMS now supports **image uploads, video uploads, and social media embeds**!

---

## 🖼️ Image Upload

### Drag & Drop

1. In the rich text editor, click **"🖼️ Image"**
2. **Drag and drop** an image file
3. Or **click to browse** and select a file
4. Image auto-optimizes to WebP format
5. Inserts into your content!

### Supported Formats

- PNG
- JPEG/JPG
- GIF
- WebP
- SVG

### Features

✅ **Automatic optimization** - Converts to WebP  
✅ **Resize** - Max 1920x1080  
✅ **Compression** - 85% quality  
✅ **Fast uploads** - Optimized performance  
✅ **Preview** - See before inserting

---

## 🎥 Video Upload

### Upload Videos

1. Click **"🎥 Video"** in the editor toolbar
2. Drop video file or click to browse
3. Uploads and inserts playable video
4. Supports MP4, WebM, MOV

### Supported Formats

- MP4 (recommended)
- WebM
- MOV
- AVI

### Features

✅ **Drag & drop** - Easy upload  
✅ **HTML5 player** - Works everywhere  
✅ **Responsive** - Scales with content  
✅ **Controls** - Play, pause, fullscreen

---

## 📱 Social Media Embeds

### ▶️ YouTube

**Button:** `▶️ YouTube`

**How to use:**

1. Click the YouTube button
2. Paste YouTube URL:
   ```
   https://www.youtube.com/watch?v=VIDEO_ID
   or
   https://youtu.be/VIDEO_ID
   ```
3. Video embeds automatically!

**Example URLs:**

- `https://www.youtube.com/watch?v=dQw4w9WgXcQ`
- `https://youtu.be/dQw4w9WgXcQ`

---

### 📷 Instagram

**Button:** `📷 Instagram`

**How to use:**

1. Click the Instagram button
2. Paste Instagram post URL:
   ```
   https://www.instagram.com/p/POST_ID/
   ```
3. Post embeds with image/video!

**Example URL:**

- `https://www.instagram.com/p/CxxxxXXxxxx/`

**Getting the URL:**

1. Go to Instagram post
2. Click the 3 dots (...)
3. Click "Copy Link"
4. Paste in the prompt

---

### 🐦 Twitter/X

**Button:** `🐦 Twitter`

**How to use:**

1. Click the Twitter button
2. Paste tweet URL:
   ```
   https://twitter.com/username/status/TWEET_ID
   or
   https://x.com/username/status/TWEET_ID
   ```
3. Tweet embeds with full formatting!

**Example URL:**

- `https://twitter.com/elonmusk/status/1234567890`
- `https://x.com/elonmusk/status/1234567890`

---

### 🎵 TikTok

**Button:** `🎵 TikTok`

**How to use:**

1. Click the TikTok button
2. Paste TikTok video URL:
   ```
   https://www.tiktok.com/@username/video/VIDEO_ID
   ```
3. Video embeds in feed format!

**Example URL:**

- `https://www.tiktok.com/@username/video/1234567890123456789`

**Getting the URL:**

1. Open TikTok video
2. Click "Share"
3. Click "Copy Link"
4. Paste in the prompt

---

## 🎨 Rich Text Editor Features

### Full Toolbar

```
[B] [I] [S]  |  [H2] [H3]  |  [•] [1.]  |  [🖼️] [🎥] [▶️]  |  [📷] [🐦] [🎵]  |  [🔗]
```

### What Each Does

| Button | Function        | Shortcut     |
| ------ | --------------- | ------------ |
| **B**  | Bold text       | Ctrl/Cmd + B |
| **I**  | Italic text     | Ctrl/Cmd + I |
| **S**  | Strikethrough   |              |
| **H2** | Heading 2       |              |
| **H3** | Heading 3       |              |
| **•**  | Bullet list     |              |
| **1.** | Numbered list   |              |
| **🖼️** | Upload image    |              |
| **🎥** | Upload video    |              |
| **▶️** | YouTube embed   |              |
| **📷** | Instagram embed |              |
| **🐦** | Twitter embed   |              |
| **🎵** | TikTok embed    |              |
| **🔗** | Add link        | Ctrl/Cmd + K |

---

## 📝 Example Blog Post with Everything

### Creating Rich Content

1. **Add a title**
2. **Upload featured image**
3. **Write content** with the editor
4. **Upload inline images** (drag & drop!)
5. **Embed YouTube video** of your product
6. **Embed Instagram** posts from your brand
7. **Embed tweets** for social proof
8. **Upload videos** directly
9. **Add links** to external resources
10. **Publish!**

---

## 🎯 Tips & Tricks

### Images

- Use **WebP** for best performance (auto-converted)
- Max size: **1920x1080** (auto-resized)
- Drag & drop for speed
- Preview before inserting

### Videos

- Use **MP4** for best compatibility
- Keep under **100MB** for fast loading
- Use YouTube for long videos (better performance)
- Direct upload for short clips

### YouTube

- Paste full URL - it auto-extracts video ID
- Works with both youtube.com and youtu.be
- Embeds at 640x360 by default
- Responsive and mobile-friendly

### Instagram

- Only works with public posts
- Paste the full URL from Instagram
- Shows image, caption, and engagement
- Fully responsive

### Twitter/X

- Works with both twitter.com and x.com
- Shows full tweet with media
- Includes engagement metrics
- Responsive embed

### TikTok

- Paste full video URL
- Shows video in feed format
- Includes sound and effects
- Mobile-optimized

---

## 🔧 Advanced Usage

### Multiple Images

Just click "🖼️ Image" multiple times to add several images throughout your content.

### Image Galleries

Upload multiple images and arrange them in your content:

```markdown
Image 1 here
Image 2 here  
Image 3 here
```

### Mixed Media Posts

Combine everything:

1. Featured image at top
2. Text content
3. Inline images
4. YouTube video
5. Instagram posts
6. Tweet embeds
7. More text
8. TikTok video

---

## 💡 Pro Tips

### 1. **Image Optimization**

- Always upload high-quality images
- System auto-optimizes to WebP
- Reduces file size by 30-70%
- Faster page loads!

### 2. **Video Strategy**

- Short clips: Upload directly
- Long videos: Use YouTube
- Social clips: Keep on platform (Instagram, TikTok)

### 3. **Social Proof**

- Embed customer tweets
- Show Instagram engagement
- Include TikTok reviews
- Link to YouTube demos

### 4. **SEO Benefits**

- Rich media improves engagement
- Longer time on page
- Social embeds add credibility
- Videos increase rankings

---

## 📊 File Storage

### Where Files Go

```
public/uploads/
├── abc123.webp        (optimized image)
├── xyz789.webp        (another image)
├── video-abc.mp4      (uploaded video)
└── ...
```

### Database Record

```sql
media
├── id: 1
├── filename: abc123.webp
├── original_name: my-photo.jpg
├── url: /uploads/abc123.webp
├── mime_type: image/webp
├── size: 125840
└── created_at: 2025-01-09
```

---

## 🚀 What You Can Do Now

### Create Rich Blog Posts

1. **Go to:** http://localhost:3000/admin/blog/new
2. **See the toolbar** with all media buttons
3. **Upload images** - drag & drop!
4. **Upload videos** - drop MP4 files
5. **Embed YouTube** - paste video URL
6. **Embed Instagram** - paste post URL
7. **Embed Twitter** - paste tweet URL
8. **Embed TikTok** - paste video URL
9. **Mix everything** for engaging content!
10. **Publish** and see it live!

---

## ✨ Your Editor Now Has

✅ **Image upload** with drag & drop  
✅ **Video upload** with preview  
✅ **YouTube embeds** with one click  
✅ **Instagram embeds** automatically  
✅ **Twitter/X embeds** with formatting  
✅ **TikTok embeds** with videos  
✅ **Link insertion** for references  
✅ **Text formatting** (bold, italic, headings)  
✅ **Lists** (bullet & numbered)  
✅ **Clean, professional UI**

**You now have a complete media-rich editor!** 🎉

---

**Try it:** http://localhost:3000/admin/blog/new

Create amazing, media-rich content! 🚀✨

