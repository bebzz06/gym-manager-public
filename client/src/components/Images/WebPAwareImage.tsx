// Create a component that checks for WebP support
import { useState, useEffect } from 'react';

interface WebPAwareProfileImageProps {
  externalSource?: string;
  defaultImage: string;
  className: string;
  alt: string;
}

export const WebPAwareImage = ({
  externalSource,
  defaultImage,
  className,
  alt,
}: WebPAwareProfileImageProps) => {
  const [supportsWebP, setSupportsWebP] = useState<boolean | null>(null);

  // Check for WebP support on component mount
  useEffect(() => {
    const checkWebPSupport = () => {
      const canvas = document.createElement('canvas');
      if (canvas.getContext && canvas.getContext('2d')) {
        // Check if browser can encode WebP
        const result = canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
        setSupportsWebP(result);
      } else {
        setSupportsWebP(false);
      }
    };

    checkWebPSupport();
  }, []);

  // Show loading state while checking
  if (supportsWebP === null) {
    return <div className="w-full h-full bg-gray-200 rounded-full"></div>;
  }

  // If WebP is supported, show the WebP image
  if (supportsWebP) {
    return <img src={externalSource || defaultImage} alt={alt} className={className} />;
  }

  // If WebP is not supported, show a message
  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-gray-200 rounded-full p-2 text-center">
      <svg className="w-8 h-8 text-gray-500 mb-2" fill="currentColor" viewBox="0 0 20 20">
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
          clipRule="evenodd"
        />
      </svg>
      <span className="text-xs text-gray-700">
        Your browser doesn't support modern image formats
      </span>
    </div>
  );
};
