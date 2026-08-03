export interface CloudinaryImageMetadata {
  publicId: string;
  secureUrl: string;
  resourceType: string;
  width: number;
  height: number;
  bytes: number;
  format: string;
  createdAt: string;
}

export const getCloudinaryUrl = (
  metadata: CloudinaryImageMetadata | string | null | undefined,
  transformations: string
): string => {
  if (!metadata) return '';

  // Handle case where it's already a URL string (backward compatibility)
  if (typeof metadata === 'string') {
    return metadata;
  }

  // Generate transformed URL based on the secure_url provided
  // A typical cloudinary URL: https://res.cloudinary.com/<cloud_name>/image/upload/v<version>/<public_id>
  // We can insert transformations after `/upload/`
  const { secureUrl } = metadata;
  if (!secureUrl) return '';

  if (secureUrl.includes('/upload/')) {
    return secureUrl.replace('/upload/', `/upload/${transformations}/`);
  }

  return secureUrl;
};

export const getMenuImage = (metadata: CloudinaryImageMetadata | string | null | undefined) => {
  return getCloudinaryUrl(metadata, 'f_auto,q_auto,w_500,c_limit');
};

export const getCategoryImage = (metadata: CloudinaryImageMetadata | string | null | undefined) => {
  return getCloudinaryUrl(metadata, 'f_auto,q_auto,w_300,c_limit');
};

export const getBannerImage = (metadata: CloudinaryImageMetadata | string | null | undefined) => {
  return getCloudinaryUrl(metadata, 'f_auto,q_auto,w_1800,c_limit');
};

export const getLogo = (metadata: CloudinaryImageMetadata | string | null | undefined) => {
  return getCloudinaryUrl(metadata, 'f_auto,q_auto,w_250,c_limit');
};
