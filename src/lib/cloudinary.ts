// Konfigurasi Cloudinary
const CLOUD_NAME = 'dgg4mki57';
const API_KEY = '264516717579923';
const API_SECRET = 'BPs7InUsmb5tx0rJuwBrDjAHYWM';

// Fungsi untuk generate signature
const generateSignature = async (timestamp: number): Promise<string> => {
  const message = `timestamp=${timestamp}${API_SECRET}`;
  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-1', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

// Fungsi untuk upload gambar ke Cloudinary
export const uploadToCloudinary = async (base64Image: string): Promise<{
  url: string;
  public_id: string;
}> => {
  try {
    // Buat form data
    const formData = new FormData();
    formData.append('file', `data:image/jpeg;base64,${base64Image}`);
    formData.append('api_key', API_KEY);
    formData.append('upload_preset', 'foodapp_upload');

    // Upload ke Cloudinary
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Failed to upload to Cloudinary');
    }

    const result = await response.json();
    return {
      url: result.secure_url,
      public_id: result.public_id
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error('Failed to upload image to Cloudinary');
  }
};

// Fungsi untuk menghapus gambar dari Cloudinary
export const deleteFromCloudinary = async (publicId: string): Promise<void> => {
  try {
    const timestamp = Math.round(new Date().getTime() / 1000);
    
    const formData = new FormData();
    formData.append('public_id', publicId);
    formData.append('api_key', API_KEY);
    formData.append('timestamp', timestamp.toString());

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/destroy`,
      {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Failed to delete from Cloudinary');
    }
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    throw new Error('Failed to delete image from Cloudinary');
  }
};

// Fungsi untuk validasi URL gambar
export const isValidImageUrl = (url: string): boolean => {
  try {
    const parsedUrl = new URL(url);
    return parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:';
  } catch {
    return false;
  }
}; 