import ChatAudio from './ChatAudio'
import Uploadsection from './Uploadsection'
import { useState } from 'react';
function Index() {
    const [audionamespace, setAudioNamespace] = useState<string | null>(null);
  return (
    <div className="flex flex-col md:flex-row gap-8 items-start justify-center w-full min-h-screen bg-zinc-950 py-10">
                    <div className="absolute -bottom-82 -left-42 w-[500px] h-[500px] bg-purple-800 opacity-20 rounded-full blur-3xl pointer-events-none z-0" />
    
      <div className="w-full md:w-1/3">
        <Uploadsection setAudioNamespace={setAudioNamespace} />
      </div>
      <div className="w-full md:w-2/3">
        <ChatAudio audioNamespace={audionamespace} />
      </div>
    </div>
  )
}

export default Index