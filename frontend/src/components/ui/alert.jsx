import React from 'react';

const Alert = ({ className = '', ...props }) => {
  const classes = `relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground border-gray-200 bg-blue-50 text-blue-900 ${className}`;
  return <div className={classes} {...props} />;
};

const AlertDescription = ({ className = '', ...props }) => {
  const classes = `text-sm [&_p]:leading-relaxed ${className}`;
  return <div className={classes} {...props} />;
};

export { Alert, AlertDescription };

