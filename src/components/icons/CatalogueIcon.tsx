import React from 'react';
import Svg, { Path } from 'react-native-svg';

type IconProps = {
  color: string;
  isFocused?: boolean;
  size?: number;
};

export default function CatalogueIcon({ color = 'black', isFocused = false, size = 24 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {isFocused ? (
        <>
          <Path d="M19.5 3H14.5C13.6716 3 13 3.67157 13 4.5V9.5C13 10.3284 13.6716 11 14.5 11H19.5C20.3284 11 21 10.3284 21 9.5V4.5C21 3.67157 20.3284 3 19.5 3Z" fill={color} />
          <Path d="M9.5 3H4.5C3.67157 3 3 3.67157 3 4.5V19.5C3 20.3284 3.67157 21 4.5 21H9.5C10.3284 21 11 20.3284 11 19.5V4.5C11 3.67157 10.3284 3 9.5 3Z" fill={color} />
          <Path d="M19.5 13H14.5C13.6716 13 13 13.6716 13 14.5V19.5C13 20.3284 13.6716 21 14.5 21H19.5C20.3284 21 21 20.3284 21 19.5V14.5C21 13.6716 20.3284 13 19.5 13Z" fill={color} />
        </>
      ) : (
        <Path 
          d="M19.5 3H14.5C13.67 3 13 3.67 13 4.5V9.5C13 10.33 13.67 11 14.5 11H19.5C20.33 11 21 10.33 21 9.5V4.5C21 3.67 20.33 3 19.5 3ZM19 9H15V5H19V9ZM9.5 3H4.5C3.67 3 3 3.67 3 4.5V19.5C3 20.33 3.67 21 4.5 21H9.5C10.33 21 11 20.33 11 19.5V4.5C11 3.67 10.33 3 9.5 3ZM9 19H5V5H9V19ZM19.5 13H14.5C13.67 13 13 13.67 13 14.5V19.5C13 20.33 13.67 21 14.5 21H19.5C20.33 21 21 20.33 21 19.5V14.5C21 13.67 20.33 13 19.5 13ZM19 19H15V15H19V19Z" 
          fill={color} 
        />
      )}
    </Svg>
  );
}