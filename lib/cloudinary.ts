import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadToCloudinary = async (fileBuffer: Buffer, fileName: string, folder: string) => {
  try {
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            resource_type: "auto",
            public_id: `${folder}/${fileName}`,
            transformation: [{ quality: "auto" }],
          },
          (error, result) => {
            if (error) {
              reject(error);
              return;
            }
            resolve(result);
          }
        )
        .end(fileBuffer);
    });

    return result;
  } catch (error: unknown) {
    console.error("Error uploading to Cloudinary:", error);
    throw new Error("Failed to upload file");
  }
};

export const deleteFromCloudinary = async (publicId: string) => {
  try {
    await cloudinary.uploader.destroy(publicId);
    return true;
  } catch (error) {
    console.error("Error deleting from Cloudinary:", error);
    throw new Error("Failed to delete file");
  }
};

export const generateThumbnail = async (publicId: string) => {
  try {
    const url = cloudinary.url(publicId, {
      width: 200,
      height: 200,
      crop: "fill",
      format: "jpg",
    });
    return url;
  } catch (error) {
    console.error("Error generating thumbnail:", error);
    return null;
  }
};
