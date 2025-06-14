import { useState } from 'react';
import { uploadToCloudinary, deleteFromCloudinary } from '../lib/cloudinary';
import { compressImage } from '../lib/imageCompression';

interface UseImageUploadProps {
  onSuccess?: (url: string, publicId: string) => void;
  onError?: (error: Error) => void;
}

export const useImageUpload = ({ onSuccess, onError }: UseImageUploadProps = {}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const uploadImage = async (uri: string) => {
    try {
      setIsUploading(true);
      setUploadProgress(0);

      // Compress image before upload
      const compressedUri = await compressImage(uri, {
        maxWidth: 1920,
        maxHeight: 1080,
        quality: 0.7
      });

      // Convert URI to base64
      const response = await fetch(compressedUri);
      const blob = await response.blob();
      const reader = new FileReader();
      const base64 = await new Promise<string>((resolve) => {
        reader.onload = () => {
          const base64String = reader.result as string;
          resolve(base64String.split(',')[1]);
        };
        reader.readAsDataURL(blob);
      });

      // Upload to Cloudinary
      const result = await uploadToCloudinary(base64);
      
      setUploadProgress(100);
      onSuccess?.(result.url, result.public_id);
      
      return result;
    } catch (error) {
      console.error('Upload error:', error);
      onError?.(error as Error);
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  const deleteImage = async (publicId: string) => {
    try {
      await deleteFromCloudinary(publicId);
    } catch (error) {
      console.error('Delete error:', error);
      onError?.(error as Error);
      throw error;
    }
  };

  return {
    uploadImage,
    deleteImage,
    isUploading,
    uploadProgress
  };
}; 