import * as React from "react";
import Svg, { Path } from "react-native-svg";

const LockPasswordIcon = (props) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width={24}
    height={24}
    color="#000000"
    fill="none"
    {...props}>
    <Path
      d="M4.26781 18.8447C4.49269 20.515 5.87613 21.8235 7.55966 21.9009C8.97627 21.966 10.4153 22 12 22C13.5847 22 15.0237 21.966 16.4403 21.9009C18.1239 21.8235 19.5073 20.515 19.7322 18.8447C19.879 17.7547 20 16.6376 20 15.5C20 14.3624 19.879 13.2453 19.7322 12.1553C19.5073 10.485 18.1239 9.17649 16.4403 9.09909C15.0237 9.03397 13.5847 9 12 9C10.4153 9 8.97627 9.03397 7.55966 9.09909C5.87613 9.17649 4.49269 10.485 4.26781 12.1553C4.12105 13.2453 4 14.3624 4 15.5C4 16.6376 4.12105 17.7547 4.26781 18.8447Z"
      stroke="currentColor"
      strokeWidth={props.strokeWidth}
    />
    <Path
      d="M7.5 9V6.5C7.5 4.01472 9.51472 2 12 2C14.4853 2 16.5 4.01472 16.5 6.5V9"
      stroke="currentColor"
      strokeWidth={props.strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M16 15.49V15.5"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M12 15.49V15.5"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M8 15.49V15.5"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export default LockPasswordIcon;
