declare module 'react-mic' {
  import { Component } from 'react';

  export interface ReactMicProps {
    record: boolean;
    className?: string;
    onStop: (recordedBlob: Blob) => void;
    onData?: (recordedBlob: Blob) => void;
    strokeColor?: string;
    backgroundColor?: string;
  }

  export class ReactMic extends Component<ReactMicProps> {}
} 