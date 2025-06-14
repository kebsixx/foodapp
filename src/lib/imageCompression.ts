import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';

export const compressImage = async (
  uri: string,
  options: {
    maxWidth?: number;
    maxHeight?: number;
    quality?: number;
  } = {}
): Promise<string> => {
  const {
    maxWidth = 1920,
    maxHeight = 1080,
    quality = 0.7
  } = options;

  try {
    // Manipulate image
    const manipResult = await manipulateAsync(
      uri,
      [
        {
          resize: {
            width: maxWidth,
            height: maxHeight
          }
        }
      ],
      {
        compress: quality,
        format: SaveFormat.JPEG
      }
    );

    return manipResult.uri;
  } catch (error) {
    console.error('Image compression error:', error);
    throw new Error('Failed to compress image');
  }
}; 