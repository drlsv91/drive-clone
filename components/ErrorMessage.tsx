import React, { PropsWithChildren } from "react";

const ErrorMessage: React.FC<PropsWithChildren> = ({ children }) => {
  if (!children) return null;
  return <p className="text-red-500">{children}</p>;
};

export default ErrorMessage;
