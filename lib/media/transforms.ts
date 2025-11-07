import sharp from 'sharp';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export interface TransformOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'jpeg' | 'png' | 'avif';
  crop?: 'fit' | 'fill' | 'crop' | 'scale';
  gravity?: 'center' | 'north' | 'south' | 'east' | 'west';
  blur?: number;
  brightness?: number;
  contrast?: number;
  saturation?: number;
}

export interface ResponsiveImage {
  url: string;
  width: number;
  height: number;
  format: string;
  size: number;
}

export interface MediaTransformResult {
  original: ResponsiveImage;
  responsive: ResponsiveImage[];
  optimized: ResponsiveImage;
  thumbnail: ResponsiveImage;
}

export class MediaTransformService {
  private static instance: MediaTransformService;

  static getInstance(): MediaTransformService {
    if (!MediaTransformService.instance) {
      MediaTransformService.instance = new MediaTransformService();
    }
    return MediaTransformService.instance;
  }

  // Local image transformation using Sharp
  async transformLocalImage(
    inputBuffer: Buffer,
    options: TransformOptions = {}
  ): Promise<Buffer> {
    const {
      width,
      height,
      quality = 85,
      format = 'webp',
      crop = 'fit',
      blur,
      brightness,
      contrast,
      saturation,
    } = options;

    let pipeline = sharp(inputBuffer);

    // Apply transformations
    if (width || height) {
      const resizeOptions: any = {};
      
      if (crop === 'fit') {
        resizeOptions.fit = 'inside';
        resizeOptions.withoutEnlargement = true;
      } else if (crop === 'fill') {
        resizeOptions.fit = 'cover';
        resizeOptions.position = options.gravity || 'center';
      } else if (crop === 'crop') {
        resizeOptions.fit = 'cover';
      } else if (crop === 'scale') {
        resizeOptions.fit = 'fill';
      }

      if (width) resizeOptions.width = width;
      if (height) resizeOptions.height = height;

      pipeline = pipeline.resize(resizeOptions);
    }

    // Apply quality adjustments
    if (blur) pipeline = pipeline.blur(blur);
    if (brightness !== undefined) pipeline = pipeline.modulate({ brightness });
    if (contrast !== undefined) pipeline = pipeline.modulate({ contrast });
    if (saturation !== undefined) pipeline = pipeline.modulate({ saturation });

    // Apply format and quality
    switch (format) {
      case 'webp':
        pipeline = pipeline.webp({ quality });
        break;
      case 'jpeg':
        pipeline = pipeline.jpeg({ quality });
        break;
      case 'png':
        pipeline = pipeline.png({ quality });
        break;
      case 'avif':
        pipeline = pipeline.avif({ quality });
        break;
    }

    return await pipeline.toBuffer();
  }

  // Cloudinary transformation
  async transformCloudinaryImage(
    publicId: string,
    options: TransformOptions = {}
  ): Promise<string> {
    const {
      width,
      height,
      quality = 85,
      format = 'webp',
      crop = 'fit',
      gravity = 'center',
      blur,
      brightness,
      contrast,
      saturation,
    } = options;

    const transformations: any = {};

    if (width || height) {
      if (width && height) {
        transformations.width = width;
        transformations.height = height;
      } else if (width) {
        transformations.width = width;
      } else if (height) {
        transformations.height = height;
      }

      transformations.crop = crop;
      if (crop === 'fill' || crop === 'crop') {
        transformations.gravity = gravity;
      }
    }

    if (quality) transformations.quality = quality;
    if (format) transformations.format = format;
    if (blur) transformations.blur = blur;
    if (brightness) transformations.brightness = brightness;
    if (contrast) transformations.contrast = contrast;
    if (saturation) transformations.saturation = saturation;

    return cloudinary.url(publicId, {
      transformation: [transformations],
      secure: true,
    });
  }

  // Generate responsive image set
  async generateResponsiveImages(
    inputBuffer: Buffer,
    formats: string[] = ['webp', 'jpeg'],
    sizes: number[] = [320, 640, 1024, 1920]
  ): Promise<ResponsiveImage[]> {
    const results: ResponsiveImage[] = [];

    for (const format of formats) {
      for (const size of sizes) {
        const transformed = await this.transformLocalImage(inputBuffer, {
          width: size,
          format: format as any,
          quality: 85,
        });

        results.push({
          url: `data:image/${format};base64,${transformed.toString('base64')}`,
          width: size,
          height: Math.round((size * 9) / 16), // Assume 16:9 aspect ratio
          format,
          size: transformed.length,
        });
      }
    }

    return results;
  }

  // Generate thumbnail
  async generateThumbnail(inputBuffer: Buffer): Promise<Buffer> {
    return await this.transformLocalImage(inputBuffer, {
      width: 300,
      height: 200,
      crop: 'fill',
      quality: 80,
      format: 'webp',
    });
  }

  // Optimize image for web
  async optimizeForWeb(inputBuffer: Buffer): Promise<Buffer> {
    return await this.transformLocalImage(inputBuffer, {
      width: 1920,
      quality: 85,
      format: 'webp',
      crop: 'fit',
    });
  }

  // Get image metadata
  async getImageMetadata(inputBuffer: Buffer) {
    const metadata = await sharp(inputBuffer).metadata();
    return {
      width: metadata.width,
      height: metadata.height,
      format: metadata.format,
      size: inputBuffer.length,
      density: metadata.density,
      hasAlpha: metadata.hasAlpha,
      channels: metadata.channels,
      colorSpace: metadata.space,
    };
  }

  // Batch transform multiple images
  async batchTransform(
    inputs: Array<{ buffer: Buffer; options: TransformOptions }>
  ): Promise<Buffer[]> {
    const promises = inputs.map(({ buffer, options }) =>
      this.transformLocalImage(buffer, options)
    );
    return await Promise.all(promises);
  }

  // Smart crop using face detection (requires additional AI service)
  async smartCrop(inputBuffer: Buffer, width: number, height: number): Promise<Buffer> {
    // This would integrate with a face detection service
    // For now, we'll use center crop
    return await this.transformLocalImage(inputBuffer, {
      width,
      height,
      crop: 'fill',
      gravity: 'center',
    });
  }

  // Generate image variations for different use cases
  async generateVariations(inputBuffer: Buffer): Promise<MediaTransformResult> {
    const metadata = await this.getImageMetadata(inputBuffer);
    
    // Original
    const original: ResponsiveImage = {
      url: `data:image/${metadata.format};base64,${inputBuffer.toString('base64')}`,
      width: metadata.width!,
      height: metadata.height!,
      format: metadata.format!,
      size: inputBuffer.length,
    };

    // Responsive sizes
    const responsive = await this.generateResponsiveImages(inputBuffer);

    // Optimized version
    const optimizedBuffer = await this.optimizeForWeb(inputBuffer);
    const optimized: ResponsiveImage = {
      url: `data:image/webp;base64,${optimizedBuffer.toString('base64')}`,
      width: 1920,
      height: Math.round((1920 * metadata.height!) / metadata.width!),
      format: 'webp',
      size: optimizedBuffer.length,
    };

    // Thumbnail
    const thumbnailBuffer = await this.generateThumbnail(inputBuffer);
    const thumbnail: ResponsiveImage = {
      url: `data:image/webp;base64,${thumbnailBuffer.toString('base64')}`,
      width: 300,
      height: 200,
      format: 'webp',
      size: thumbnailBuffer.length,
    };

    return {
      original,
      responsive,
      optimized,
      thumbnail,
    };
  }
}

export const mediaTransformService = MediaTransformService.getInstance();



