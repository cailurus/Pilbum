/**
 * Site configuration
 * Customize your photo album's branding and settings
 */

export interface SiteConfig {
  /** Site name displayed in header and title */
  name: string;
  /** Site description for SEO */
  description: string;
  /** Copyright holder name */
  copyright: string;
}

export const siteConfig: SiteConfig = {
  name: "Pilbum",
  description: "个人摄影作品集",
  copyright: "Pilbum",
};
