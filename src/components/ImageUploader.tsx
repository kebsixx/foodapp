import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { useImageUpload } from "../hooks/useImageUpload";
import { useTranslation } from "react-i18next";
import { X } from "lucide-react";

interface ImageUploaderProps {
  onImageUploaded: (url: string, publicId: string) => void;
  onImageDeleted?: () => void;
  currentImageUrl?: string;
  currentPublicId?: string;
  maxSizeMB?: number;
  accept?: Record<string, string[]>;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  onImageUploaded,
  onImageDeleted,
  currentImageUrl,
  currentPublicId,
  maxSizeMB = 5,
  accept = {
    "image/*": [".png", ".jpg", ".jpeg", ".gif"],
  },
}) => {
  const { t } = useTranslation();
  const [error, setError] = useState<string | null>(null);
  const { uploadImage, deleteImage, isUploading, uploadProgress } =
    useImageUpload({
      onSuccess: onImageUploaded,
      onError: (error) => setError(error.message),
    });

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      setError(null);
      const file = acceptedFiles[0];

      if (!file) return;

      // Check file size
      if (file.size > maxSizeMB * 1024 * 1024) {
        setError(t("validation.fileTooLarge", { size: maxSizeMB }));
        return;
      }
      try {
        await uploadImage(file.toString());
      } catch (error) {
        console.error("Upload error:", error);
      }
    },
    [maxSizeMB, t, uploadImage]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxFiles: 1,
    multiple: false,
  });

  const handleDelete = async () => {
    if (currentPublicId) {
      try {
        await deleteImage(currentPublicId);
        onImageDeleted?.();
      } catch (error) {
        console.error("Delete error:", error);
      }
    }
  };

  return (
    <div className="w-full">
      {currentImageUrl ? (
        <div className="relative">
          <img
            src={currentImageUrl}
            alt="Uploaded"
            className="w-full h-48 object-cover rounded-lg"
          />
          <button
            onClick={handleDelete}
            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors">
            <X size={20} />
          </button>
        </div>
      ) : (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
            ${
              isDragActive
                ? "border-blue-500 bg-blue-50"
                : "border-gray-300 hover:border-blue-500"
            }`}>
          <input {...getInputProps()} />
          {isUploading ? (
            <div className="space-y-2">
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-sm text-gray-600">{t("common.uploading")}</p>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-gray-600">
                {isDragActive ? t("common.dropHere") : t("common.dragOrClick")}
              </p>
              <p className="text-sm text-gray-500">
                {t("common.maxFileSize", { size: maxSizeMB })}
              </p>
            </div>
          )}
        </div>
      )}

      {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
    </div>
  );
};
