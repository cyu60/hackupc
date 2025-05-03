import React, { useEffect, useState, useRef } from "react";
import { EEGSummaryData, EEGRealtimeData } from "../types";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";

const MAX_DATA_POINTS = 30;

interface EEGVisualizationProps {
  data: EEGSummaryData | null;
  realtimeData?: EEGRealtimeData[];
}

const EEGVisualization: React.FC<EEGVisualizationProps> = ({ data, realtimeData = [] }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    // Process realtime data for the chart
    if (realtimeData && realtimeData.length > 0) {
      const latestData = realtimeData[realtimeData.length - 1];
      if (latestData && latestData.channels) {
        setChartData(prev => {
          const newData = [...prev, {
            time: new Date().toLocaleTimeString(),
            ...latestData.channels
          }];
          
          // Keep only the last MAX_DATA_POINTS data points
          if (newData.length > MAX_DATA_POINTS) {
            return newData.slice(newData.length - MAX_DATA_POINTS);
          }
          return newData;
        });
      }
    }
  }, [realtimeData]);

  // Still render the summary visualization on the canvas
  useEffect(() => {
    if (!data || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw the metrics visualization
    const metrics = data.metrics;
    const metricNames = Object.keys(metrics) as Array<keyof typeof metrics>;
    const barWidth = canvas.width / metricNames.length - 10;
    const maxHeight = canvas.height - 40;

    metricNames.forEach((metric, index) => {
      // Normalize the value to fit the canvas
      let value = metrics[metric];
      // We'll cap values at 3.0 for visualization purposes
      const normalizedValue = Math.min(value / 3.0, 1.0);
      const barHeight = normalizedValue * maxHeight;
      
      // Pick colors based on metric type
      let color = '#4C1D95';
      if (metric.includes('relaxation')) color = '#10B981';
      if (metric.includes('concentration')) color = '#3B82F6';
      if (metric.includes('frustration')) color = '#EF4444';
      if (metric.includes('mindfulness')) color = '#8B5CF6';
      
      // Draw the bar
      const x = index * (barWidth + 10) + 5;
      const y = canvas.height - barHeight - 20;
      
      ctx.fillStyle = color;
      ctx.fillRect(x, y, barWidth, barHeight);
      
      // Draw the value
      ctx.fillStyle = '#1F2937';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(value.toFixed(2), x + barWidth / 2, y - 5);
      
      // Draw the label
      ctx.fillText(metric.split('_')[0], x + barWidth / 2, canvas.height - 5);
    });
    
  }, [data]);

  if (!data) return null;

  // Select a subset of channels to display in the chart for clarity
  const channelsToShow = ['AF3', 'F7', 'F3', 'T7', 'P7'];
  const colors = ['#3B82F6', '#10B981', '#8B5CF6', '#EF4444', '#F59E0B'];

  return (
    <div className="w-full mt-6">
      <Collapsible
        open={isOpen}
        onOpenChange={setIsOpen}
        className="w-full border rounded-lg bg-white shadow-sm"
      >
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h3 className="text-lg font-medium">EEG Data Visualization</h3>
          <CollapsibleTrigger className="p-2 rounded-full hover:bg-gray-100">
            {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </CollapsibleTrigger>
        </div>
        
        <CollapsibleContent>
          <div className="p-4">
            <div className="mb-4">
              <h4 className="font-medium mb-2">Realtime EEG Signal</h4>
              <div className="w-full h-64 border rounded">
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={chartData}
                      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="time" 
                        tick={{ fontSize: 10 }}
                        interval="preserveStartEnd"
                      />
                      <YAxis domain={[0, 100]} />
                      <Tooltip />
                      <Legend />
                      {channelsToShow.map((channel, index) => (
                        <Line
                          key={channel}
                          type="monotone"
                          dataKey={channel}
                          stroke={colors[index % colors.length]}
                          dot={false}
                          isAnimationActive={false}
                        />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    Waiting for realtime data...
                  </div>
                )}
              </div>
            </div>
            
            <h4 className="font-medium mb-2">Summary Metrics</h4>
            <canvas 
              ref={canvasRef} 
              width={600} 
              height={150} 
              className="w-full h-36 border rounded"
            ></canvas>
            
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium">Mental State</h4>
                <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                  {Object.entries(data.mental_state).map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <span className="capitalize">{key}:</span>
                      <span 
                        className={`font-medium ${
                          value === 'high' ? 'text-green-600' : 
                          value === 'medium' ? 'text-amber-500' : 
                          'text-red-500'
                        }`}
                      >
                        {value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="font-medium">Session Info</h4>
                <div className="mt-2 text-sm">
                  <div className="flex justify-between">
                    <span>Time:</span>
                    <span>{new Date(data.timestamp * 1000).toLocaleTimeString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Iterations analyzed:</span>
                    <span>{data.iterations_analyzed}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

export default EEGVisualization;
