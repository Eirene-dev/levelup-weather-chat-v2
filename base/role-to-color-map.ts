
import { Message } from 'ai/react';

const roleToColorMap: Record<Message['role'], string> = {
  system: 'red',
  user: 'black',
  function: 'orange',
  tool: 'purple',
  assistant: 'green',
  data: 'blue',
};

export default roleToColorMap;