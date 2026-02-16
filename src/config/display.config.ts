/**
 * Photo display configuration
 * Configure which information to show on the frontend photo detail page
 */

export interface DisplayConfig {
  // EXIF information section
  exif: {
    /** Show camera make and model */
    camera: boolean;
    /** Show lens model */
    lens: boolean;
    /** Show shooting parameters (focal length, aperture, shutter speed, ISO) */
    shootingParams: boolean;
    /** Show taken date */
    takenDate: boolean;
    /** Show GPS map */
    gpsMap: boolean;
  };
  // File information section
  fileInfo: {
    /** Show image dimensions */
    dimensions: boolean;
    /** Show file size */
    fileSize: boolean;
    /** Show upload date */
    uploadDate: boolean;
    /** Show Live Photo indicator */
    livePhotoIndicator: boolean;
    /** Show original filename */
    originalFilename: boolean;
    /** Show altitude */
    altitude: boolean;
  };
  // Photo content display
  content: {
    /** Show photo title */
    title: boolean;
    /** Show photo description */
    description: boolean;
  };
}

/**
 * Default display configuration
 * Set to true to show, false to hide
 */
export const displayConfig: DisplayConfig = {
  exif: {
    camera: true,
    lens: true,
    shootingParams: true,
    takenDate: true,
    gpsMap: true,
  },
  fileInfo: {
    dimensions: true,
    fileSize: true,
    uploadDate: true,
    livePhotoIndicator: true,
    originalFilename: false,  // Hidden by default
    altitude: true,
  },
  content: {
    title: true,
    description: true,
  },
};
