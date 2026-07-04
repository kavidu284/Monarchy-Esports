import os
import cloudinary
import cloudinary.uploader


cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET"),
)


def upload_image(file, folder="monarchy_esports"):
    if not file:
        return None

    result = cloudinary.uploader.upload(
        file.file,
        folder=folder,
        resource_type="image"
    )

    return result["secure_url"]
def upload_file(file, folder="monarchy_esports"):
    if not file:
        return None

    result = cloudinary.uploader.upload(
        file.file,
        folder=folder,
        resource_type="auto"
    )

    return result["secure_url"]