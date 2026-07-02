import React from "react";

interface DocumentContainerProps {
  children: React.ReactNode;
  watermark?: string;
  className?: string;
}

export function DocumentContainer({ children, watermark, className = "" }: DocumentContainerProps) {
  return (
    <div className={`doc-page ${className}`}>
      {watermark && (
        <div
          className="doc-watermark"
          aria-hidden="true"
        >
          {watermark}
        </div>
      )}
      <div className="doc-content">
        {children}
      </div>
    </div>
  );
}
