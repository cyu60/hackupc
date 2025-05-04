import {useParams, useNavigate} from "react-router-dom";
import {useEffect, useState, useCallback, useRef} from "react";
import {fetchCityImages} from "@/lib/pexels";
import {useCitySession} from "@/context/CitySessionContext";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    RadarChart,
    Radar,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis
} from 'recharts';
import {EEGMetrics} from "@/types";

// WebSocket server settings
const WS_HOST = "localhost";
const WS_PORT = 8765;

export default function EEGCitySession() {
    const {city} = useParams<{ city: string }>();
    const navigate = useNavigate();
    const {cities} = useCitySession();

    const [images, setImages] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [sessionStartTime, setSessionStartTime] = useState<number>(0);
    const [eegMetricsHistory, setEegMetricsHistory] = useState<EEGMetrics[]>([]);
    const [summaryMetrics, setSummaryMetrics] = useState<EEGMetrics>({});
    const sessionStartTimeRef = useRef<number>(0);
    const handleScoreRef = useRef<(score: number) => void>(() => {
    });
    const wsRef = useRef<WebSocket | null>(null);


    useEffect(() => {
        sessionStartTimeRef.current = sessionStartTime;
    }, [sessionStartTime]);

    useEffect(() => {
        const load = async () => {
            if (!city) return;
            setLoading(true);
            const imgs = await fetchCityImages(city);
            setImages(imgs);
            setLoading(false);
            setSessionStartTime(Date.now());
        };
        load();
    }, [city]);

    const computeScore = useCallback((metrics: EEGMetrics): number => {
        const {engagement_index, mindfulness_index, arousal_index, frustration_index} = metrics;
        const rawScore = (engagement_index * 0.4) +
            (mindfulness_index * 0.4) +
            (arousal_index * 0.2) -
            (frustration_index * 0.3);
        const minExpected = -1;
        const maxExpected = 2;
        const clamped = Math.max(minExpected, Math.min(rawScore, maxExpected));
        const normalized = ((clamped - minExpected) / (maxExpected - minExpected)) * 9 + 1;
        return Math.round(Math.min(10, Math.max(1, normalized)));
    }, []);

    const handleScore = useCallback((score: number) => {
        console.log(`🧠 Computed EEG score ${score} for ${city}`);
        const index = cities.findIndex(c => c.toLowerCase() === city?.toLowerCase());
        const nextCity = cities[index + 1];
        if (nextCity) {
            navigate(`/eeg-session/${encodeURIComponent(nextCity.toLowerCase())}`);
        } else {
            if (wsRef.current) {
                wsRef.current.close();
                wsRef.current = null;
            }
            navigate("/results");
        }
    }, [city, cities, navigate]);

    useEffect(() => {
        handleScoreRef.current = handleScore;
    }, [handleScore]);

    useEffect(() => {
        wsRef.current = new WebSocket(`ws://${WS_HOST}:${WS_PORT}`);
        const ws = wsRef.current;
        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                if (data.type === "summary") {
                    const messageTimestamp = data.timestamp * 1000;
                    if (messageTimestamp > sessionStartTimeRef.current) {
                        setSummaryMetrics(data.metrics);
                        const score = computeScore(data.metrics);
                        handleScoreRef.current(score);
                    }
                } else if (data.type === "real_time") {
                    setEegMetricsHistory(prev => [
                        ...prev,
                        {...data.metrics, timestamp: Date.now()}
                    ].slice(-100)); // Keep last 60 data points
                }
            } catch (error) {
                console.error("Error processing WebSocket message:", error);
            }
        };
        ws.onerror = (error) => console.error("WebSocket error:", error);
        // return () => ws.close();
    }, [computeScore]);

    return (
        <div className="min-h-screen bg-gray-100 p-6 flex flex-col items-center justify-center">
            <h2 className="text-2xl font-bold mb-4 text-center m-22 capitalize">
                {city || ''}
            </h2>

            {loading ? (
                <p className="text-gray-500">Loading images...</p>
            ) : (
                <>
                    <p className="text-gray-600 text-lg mb-4 text-center">
                        ⏳ Analyzing your brain activity...
                    </p>

                    <div className="flex flex-row gap-8 w-full max-w-6xl">
                        {/* Left: Collage */}
                        <div className="grid grid-cols-3 gap-x-2 w-1/2">
                            {images.map((img, i) => (
                                <img
                                    key={i}
                                    src={img}
                                    alt={`${city} ${i + 1}`}
                                    className="w-full h-52 object-cover rounded shadow"
                                />
                            ))}
                        </div>

                        {/* Right: Charts */}
                        <div className="flex flex-col gap-6 w-1/2">
                            {/* Summary Radar Chart */}
                            {summaryMetrics && (
                                <div className="bg-white p-4 rounded-lg shadow self-center">
                                    <h3 className="text-sm font-semibold mb-2 text-center">Cognitive State</h3>
                                    <RadarChart
                                        width={450}
                                        height={250}
                                        data={[
                                            {metric: 'Engagement', value: summaryMetrics.engagement_index},
                                            {metric: 'Arousal', value: summaryMetrics.arousal_index},
                                            {metric: 'Frustration', value: summaryMetrics.frustration_index},
                                            {metric: 'Mindfulness', value: summaryMetrics.mindfulness_index},
                                        ]}
                                        margin={{top: 5, right: 30, left: 20, bottom: 5}}
                                    >
                                        <PolarGrid/>
                                        <PolarAngleAxis dataKey="metric"/>
                                        <Radar
                                            name="Metrics"
                                            dataKey="value"
                                            stroke="#8884d8"
                                            fill="#8884d8"
                                            fillOpacity={0.6}
                                        />
                                        <Tooltip/>
                                        <Legend/>
                                    </RadarChart>
                                </div>
                            )}

                            {/* Real-time Line Chart */}
                            {eegMetricsHistory.length > 0 && (
                                <div className="bg-white p-4 rounded-lg shadow self-center">
                                    <h3 className="text-sm font-semibold mb-2">Brain Wave Activity</h3>
                                    <LineChart
                                        width={450}
                                        height={250}
                                        data={eegMetricsHistory}
                                        margin={{top: 5, right: 30, left: 20, bottom: 5}}
                                    >
                                        <CartesianGrid strokeDasharray="3 3"/>
                                        <XAxis
                                            dataKey="timestamp"
                                            tickFormatter={(ts) => new Date(ts).toLocaleTimeString()}
                                        />
                                        <YAxis/>
                                        <Tooltip
                                            labelFormatter={(label) => new Date(label).toLocaleTimeString()}
                                        />
                                        <Legend/>
                                        <Line
                                            type="monotone"
                                            dataKey="alpha_relaxation"
                                            name="Alpha"
                                            stroke="#8884d8"
                                            dot={false}
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="beta_concentration"
                                            name="Beta"
                                            stroke="#82ca9d"
                                            dot={false}
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="theta_relaxation"
                                            name="Theta"
                                            stroke="#ffc658"
                                            dot={false}
                                        />
                                    </LineChart>
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}