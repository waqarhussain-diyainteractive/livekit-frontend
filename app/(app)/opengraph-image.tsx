import { headers } from 'next/headers';
import { ImageResponse } from 'next/og';
import getImageSize from 'buffer-image-size';
import mime from 'mime';
import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { APP_CONFIG_DEFAULTS } from '@/app-config';
import { getAppConfig } from '@/lib/utils';

type Dimensions = {
  width: number;
  height: number;
};

type ImageData = {
  base64: string;
  dimensions: Dimensions;
};

// Image metadata
export const alt = 'Health4Travel Smart Clinic Assistant';
export const size = {
  width: 1200,
  height: 628,
};

function isRemoteFile(uri: string) {
  return uri.startsWith('http');
}

function doesLocalFileExist(uri: string) {
  return existsSync(join(process.cwd(), uri));
}

// LOCAL FILES MUST BE IN PUBLIC FOLDER
async function loadFileData(filePath: string): Promise<ArrayBuffer> {
  if (isRemoteFile(filePath)) {
    const response = await fetch(filePath);
    if (!response.ok) {
      throw new Error(`Failed to fetch ${filePath} - ${response.status} ${response.statusText}`);
    }
    return await response.arrayBuffer();
  }

  // Try file system first (works in local development)
  if (doesLocalFileExist(filePath)) {
    const buffer = await readFile(join(process.cwd(), filePath));
    return buffer.buffer.slice(
      buffer.byteOffset,
      buffer.byteOffset + buffer.byteLength
    ) as ArrayBuffer;
  }

  // Fallback to fetching from public URL (works in production)
  const publicFilePath = filePath.replace('public/', '');
  const fontUrl = `https://${process.env.VERCEL_URL}/${publicFilePath}`;

  const response = await fetch(fontUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${fontUrl} - ${response.status} ${response.statusText}`);
  }

  return await response.arrayBuffer();
}

async function getImageData(uri: string, fallbackUri?: string): Promise<ImageData> {
  try {
    const fileData = await loadFileData(uri);
    const buffer = Buffer.from(fileData);
    
    // Default to svg if we know it's the H4T logo, otherwise try mime
    let mimeType = mime.getType(uri);
    if (uri.includes('.svg')) {
      mimeType = 'image/svg+xml';
    }

    return {
      base64: `data:${mimeType};base64,${buffer.toString('base64')}`,
      dimensions: getImageSize(buffer),
    };
  } catch (e) {
    if (fallbackUri) {
      return getImageData(fallbackUri, fallbackUri);
    }
    throw e;
  }
}

function scaleImageSize(size: { width: number; height: number }, desiredHeight: number) {
  // Guard against division by zero if dimensions fail to load
  if (!size || size.height === 0) {
    return { width: desiredHeight * 3, height: desiredHeight }; // fallback aspect ratio
  }
  const scale = desiredHeight / size.height;
  return {
    width: size.width * scale,
    height: desiredHeight,
  };
}

function cleanPageTitle(appName: string) {
  if (appName === APP_CONFIG_DEFAULTS.pageTitle) {
    return 'Smart Clinic Assistant';
  }
  return appName;
}

export const contentType = 'image/png';

// Image generation
export default async function Image() {
  const hdrs = await headers();
  const appConfig = await getAppConfig(hdrs);

  const pageTitle = cleanPageTitle(appConfig.pageTitle);
  
  // Force the Health4Travel logo for the OG Image
  const logoUri = 'https://customer.health4travel.com/static/media/h4tLogo.3b3f9bb3bc531faa471910633d743d52.svg';

  // Load fonts - use file system in dev, fetch in production
  let commitMonoData: ArrayBuffer | undefined;
  let everettLightData: ArrayBuffer | undefined;

  try {
    commitMonoData = await loadFileData('public/commit-mono-400-regular.woff');
    everettLightData = await loadFileData('public/everett-light.woff');
  } catch (e) {
    console.error('Failed to load fonts:', e);
  }

  // Handle Background Image - Fallback to solid color if missing
  let bgStyle: any = {
    backgroundColor: '#183a59', // H4T Deep Blue Fallback
  };

  try {
    const { base64: bgSrcBase64 } = await getImageData('public/opengraph-image-bg.png');
    bgStyle = {
      backgroundImage: `url(${bgSrcBase64})`,
      backgroundSize: '100% 100%',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
    };
  } catch (e) {
    console.warn("Background image not found, using solid color fallback.");
  }

  // Handle Logo Loading - Some SVGs fail getImageSize, so we provide fallback dimensions
  let logoSrcBase64 = '';
  let logoSize = { width: 300, height: 64 }; // Safe fallback size for H4T logo

  try {
    const logoData = await getImageData(logoUri);
    logoSrcBase64 = logoData.base64;
    logoSize = scaleImageSize(logoData.dimensions, 64);
  } catch (e) {
    console.error("Failed to load or parse H4T logo for OG Image.", e);
    // If it fails, we just use the raw URL directly in the img tag
    logoSrcBase64 = logoUri; 
  }

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: size.width,
          height: size.height,
          ...bgStyle
        }}
      >
        {/* wordmark / logo top left */}
        <div
          style={{
            position: 'absolute',
            top: 40,
            left: 40,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          {/* eslint-disable-next-line jsx-a11y/alt-text */}
          <img src={logoSrcBase64} width={logoSize.width} height={logoSize.height} />
        </div>
        
        {/* title */}
        <div
          style={{
            position: 'absolute',
            bottom: 100,
            left: 40,
            width: '600px',
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
          }}
        >
          <div
            style={{
              backgroundColor: '#34d399', // Emerald accent
              padding: '4px 12px',
              borderRadius: 6,
              fontSize: 14,
              fontFamily: 'CommitMono',
              fontWeight: 600,
              color: '#064e3b',
              letterSpacing: 1,
              alignSelf: 'flex-start'
            }}
          >
            AI BOOKING PORTAL
          </div>
          <div
            style={{
              fontSize: 64,
              fontWeight: 300,
              fontFamily: 'Everett',
              color: 'white',
              lineHeight: 1.1,
            }}
          >
            {pageTitle}
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        ...(commitMonoData
          ? [
              {
                name: 'CommitMono',
                data: commitMonoData,
                style: 'normal' as const,
                weight: 400 as const,
              },
            ]
          : []),
        ...(everettLightData
          ? [
              {
                name: 'Everett',
                data: everettLightData,
                style: 'normal' as const,
                weight: 300 as const,
              },
            ]
          : []),
      ],
    }
  );
}