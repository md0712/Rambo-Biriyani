import { useEffect } from 'react';
import { APP_CONFIG } from '../../utils/constants';

export const SEO = ({ title, description }) => {
  useEffect(() => {
    const fullTitle = title ? `${title} | ${APP_CONFIG.NAME}` : `${APP_CONFIG.NAME} - ${APP_CONFIG.TAGLINE}`;
    document.title = fullTitle;

    if (description) {
      let metaDesc = document.querySelector('meta[name="description"]');
      if (!metaDesc) {
        metaDesc = document.createElement('meta');
        metaDesc.setAttribute('name', 'description');
        document.head.appendChild(metaDesc);
      }
      metaDesc.setAttribute('content', description);
    }
  }, [title, description]);

  return null;
};

export default SEO;
