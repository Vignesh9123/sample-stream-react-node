import { useEffect, useState } from 'react';
import { LineChart, ArrowRight, Timer } from 'lucide-react';

interface StreamData {
  type: 'data' | 'end';
  timestamp: string;
  value: number;
  progress: number;
  message?: string;
}

function App() {
  const [data, setData] = useState<StreamData[]>([]);
  const [isStreaming, setIsStreaming] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const eventSource = new EventSource('http://localhost:3000/api/stream');

    eventSource.onmessage = (event) => {
      const newData = JSON.parse(event.data);
      
      if (newData.type === 'end') {
        setIsStreaming(false);
        const base64Data = newData.buffer;
        
        const binaryData = atob(base64Data);
        const byteNumbers = new Uint8Array(binaryData.length);
        for (let i = 0; i < binaryData.length; i++) {
          byteNumbers[i] = binaryData.charCodeAt(i);
        }
      
        const blob = new Blob([byteNumbers], { 
          type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' 
        });
      
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'sample.docx';
        link.click();
        eventSource.close();
      } else {
        setData(prev => [...prev, newData]);
      }
    };

    eventSource.onerror = () => {
      setError('Connection to server lost');
      setIsStreaming(false);
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <header className="flex items-center gap-4 mb-8">
          <LineChart className="w-10 h-10 text-emerald-400" />
          <h1 className="text-3xl font-bold">Real-Time Data Stream</h1>
        </header>

        <div className="bg-gray-800 rounded-lg p-6 shadow-xl border border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Timer className="w-5 h-5 text-emerald-400" />
              <span className="text-lg">
                {isStreaming ? 'Streaming in progress...' : 'Stream completed'}
              </span>
            </div>
            {isStreaming && (
              <div className="flex items-center gap-2 text-emerald-400">
                <ArrowRight className="w-4 h-4 animate-pulse" />
                <span>Live</span>
              </div>
            )}
          </div>

          {error && (
            <div className="bg-red-900/50 text-red-200 p-4 rounded-md mb-4">
              {error}
            </div>
          )}

          <div className="space-y-4">
            {data.map((item, index) => (
              <div
                key={index}
                className="bg-gray-900/50 p-4 rounded-md border border-gray-700 hover:border-emerald-500/30 transition-colors"
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-400 text-sm">
                    {new Date(item.timestamp).toLocaleTimeString()}
                  </span>
                  <span className="text-emerald-400 font-mono">
                    {item.value.toFixed(2)}
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-emerald-400 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${item.progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {!isStreaming && (
            <div className="mt-6 text-center text-gray-400">
              Stream completed. Received {data.length} data points.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;