import React, { useState, useEffect } from "react";
import { WebsiteContent } from "@/api/entities";

// Hook to get dynamic content
export const useDynamicContent = (section, contentKey) => {
  const [content, setContent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadContent = async () => {
      try {
        const contents = await WebsiteContent.filter({
          section,
          content_key: contentKey,
          is_active: true
        });
        setContent(contents[0] || null);
      } catch (error) {
        console.error(`Error loading content ${section}:${contentKey}:`, error);
      }
      setIsLoading(false);
    };

    loadContent();
  }, [section, contentKey]);

  return { content, isLoading };
};

// Hook to get all content for a section
export const useSectionContent = (section) => {
  const [contents, setContents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadContents = async () => {
      try {
        const data = await WebsiteContent.filter({
          section,
          is_active: true
        });
        // Sort by display_order
        data.sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
        setContents(data);
      } catch (error) {
        console.error(`Error loading section content ${section}:`, error);
      }
      setIsLoading(false);
    };

    loadContents();
  }, [section]);

  return { contents, isLoading };
};

// Component to render dynamic content
export const DynamicContent = ({ 
  section, 
  contentKey, 
  fallback = "", 
  className = "",
  as: Component = "span",
  ...props 
}) => {
  const { content, isLoading } = useDynamicContent(section, contentKey);

  if (isLoading) {
    return <Component className={className} {...props}>{fallback}</Component>;
  }

  if (!content) {
    return <Component className={className} {...props}>{fallback}</Component>;
  }

  if (content.content_type === 'image') {
    return (
      <img 
        src={content.content_value} 
        alt={content.title} 
        className={className}
        {...props}
      />
    );
  }

  if (content.content_type === 'link') {
    return (
      <a 
        href={content.content_value} 
        className={className}
        {...props}
      >
        {content.title}
      </a>
    );
  }

  // For text content
  return (
    <Component className={className} {...props}>
      {content.content_value}
    </Component>
  );
};

// Component to render dynamic background
export const DynamicBackground = ({ section, contentKey, fallback, children, className = "" }) => {
  const { content } = useDynamicContent(section, contentKey);
  
  const backgroundImage = content?.content_value || fallback;
  
  return (
    <div 
      className={className}
      style={{ 
        backgroundImage: `url('${backgroundImage}')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      {children}
    </div>
  );
};

export default DynamicContent;