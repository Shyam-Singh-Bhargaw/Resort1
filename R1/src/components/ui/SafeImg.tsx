import React from "react";
import OptimizedImage from "./OptimizedImage";

interface Props extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackQuery?: string;
}

const SafeImg: React.FC<Props> = ({ fallbackQuery, ...rest }) => {
  return <OptimizedImage {...rest} fallbackQuery={fallbackQuery} />;
};

export default SafeImg;
