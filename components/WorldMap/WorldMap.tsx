import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";

interface WorldMapProps {
    data?: Array<{
        country: string;
        latitude: number;
        longitude: number;
        value: number;
        name: string;
    }>;
}

export default function WorldMap({ data }: WorldMapProps) {
    const svgRef = useRef<SVGSVGElement>(null);

    // Default data points for EV charging stations/presence
    const defaultData = [
        { country: "USA", latitude: 39.8283, longitude: -98.5795, value: 85, name: "United States" },
        { country: "Canada", latitude: 56.1304, longitude: -106.3468, value: 70, name: "Canada" },
        { country: "Norway", latitude: 60.4720, longitude: 8.4689, value: 95, name: "Norway" },
        { country: "Netherlands", latitude: 52.1326, longitude: 5.2913, value: 88, name: "Netherlands" },
        { country: "China", latitude: 35.8617, longitude: 104.1954, value: 92, name: "China" },
        { country: "Germany", latitude: 51.1657, longitude: 10.4515, value: 82, name: "Germany" },
        { country: "UK", latitude: 55.3781, longitude: -3.4360, value: 78, name: "United Kingdom" },
        { country: "France", latitude: 46.6034, longitude: 1.8883, value: 75, name: "France" },
        { country: "Japan", latitude: 36.2048, longitude: 138.2529, value: 80, name: "Japan" },
        { country: "South Korea", latitude: 35.9078, longitude: 127.7669, value: 85, name: "South Korea" },
        { country: "Australia", latitude: -25.2744, longitude: 133.7751, value: 65, name: "Australia" },
        { country: "India", latitude: 20.5937, longitude: 78.9629, value: 90, name: "India" },
        { country: "Brazil", latitude: -14.2350, longitude: -51.9253, value: 45, name: "Brazil" },
        { country: "Mexico", latitude: 23.6345, longitude: -102.5528, value: 40, name: "Mexico" },
        { country: "Sweden", latitude: 60.1282, longitude: 18.6435, value: 88, name: "Sweden" },
        { country: "Denmark", latitude: 56.2639, longitude: 9.5018, value: 85, name: "Denmark" },
        { country: "Switzerland", latitude: 46.8182, longitude: 8.2275, value: 82, name: "Switzerland" },
        { country: "Austria", latitude: 47.5162, longitude: 14.5501, value: 78, name: "Austria" },
        { country: "Belgium", latitude: 50.5039, longitude: 4.4699, value: 80, name: "Belgium" },
        { country: "Finland", latitude: 61.9241, longitude: 25.7482, value: 85, name: "Finland" },
    ];

    const mapData = data || defaultData;

    // Convert lat/lng to SVG coordinates
    const projectCoordinates = (lat: number, lng: number) => {
        // Simple equirectangular projection
        const x = ((lng + 180) / 360) * 1000;
        const y = ((90 - lat) / 180) * 500;
        return { x, y };
    };

    // Get dot size based on value
    const getDotSize = (value: number) => {
        return Math.max(2, Math.min(8, value / 15));
    };

    // Get dot opacity based on value
    const getDotOpacity = (value: number) => {
        return Math.max(0.4, Math.min(1, value / 100));
    };

    return (
        <div className="w-full bg-black py-20">
            <div className="max-w-7xl mx-auto px-6 md:px-10">
                {/* Header */}
                <div className="text-center mb-16">
                    <motion.p 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="text-primary font-medium mb-4 tracking-wider uppercase text-sm"
                    >
                        Global Presence
                    </motion.p>
                    <motion.h2 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="text-3xl lg:text-5xl font-bold text-white mb-6"
                    >
                        Powering EV Infrastructure Worldwide
                    </motion.h2>
                    <motion.p 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="text-lg text-gray-300 max-w-3xl mx-auto"
                    >
                        Our technology and expertise are driving the electric vehicle revolution across continents, 
                        helping build sustainable transportation infrastructure in key markets.
                    </motion.p>
                </div>

                {/* World Map */}
                <motion.div 
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                    className="relative"
                >
                    <div className="relative w-full h-[500px] bg-black border border-gray-800 rounded-2xl overflow-hidden">
                        <svg
                            ref={svgRef}
                            width="100%"
                            height="100%"
                            viewBox="0 0 1000 500"
                            className="w-full h-full"
                        >
                            {/* World Map Outline with Dots */}
                            <g>
                                {/* Continents as dotted outlines */}
                                
                                {/* North America */}
                                <g opacity="0.3">
                                    {Array.from({ length: 25 }, (_, i) => (
                                        Array.from({ length: 40 }, (_, j) => (
                                            <circle
                                                key={`na-${i}-${j}`}
                                                cx={50 + j * 4}
                                                cy={50 + i * 2}
                                                r="0.8"
                                                fill="white"
                                                opacity={
                                                    (i < 8 && j > 10 && j < 35) || 
                                                    (i >= 8 && i < 15 && j > 5 && j < 40) ||
                                                    (i >= 15 && i < 20 && j > 8 && j < 35)
                                                    ? 0.6 : 0
                                                }
                                            />
                                        ))
                                    ))}
                                </g>

                                {/* South America */}
                                <g opacity="0.3">
                                    {Array.from({ length: 35 }, (_, i) => (
                                        Array.from({ length: 15 }, (_, j) => (
                                            <circle
                                                key={`sa-${i}-${j}`}
                                                cx={120 + j * 4}
                                                cy={200 + i * 4}
                                                r="0.8"
                                                fill="white"
                                                opacity={
                                                    (i < 10 && j > 2 && j < 12) ||
                                                    (i >= 10 && i < 25 && j > 1 && j < 13) ||
                                                    (i >= 25 && j > 3 && j < 10)
                                                    ? 0.6 : 0
                                                }
                                            />
                                        ))
                                    ))}
                                </g>

                                {/* Europe */}
                                <g opacity="0.3">
                                    {Array.from({ length: 20 }, (_, i) => (
                                        Array.from({ length: 25 }, (_, j) => (
                                            <circle
                                                key={`eu-${i}-${j}`}
                                                cx={400 + j * 3}
                                                cy={60 + i * 3}
                                                r="0.8"
                                                fill="white"
                                                opacity={
                                                    (i < 8 && j > 5 && j < 20) ||
                                                    (i >= 8 && i < 15 && j > 2 && j < 22) ||
                                                    (i >= 15 && j > 8 && j < 18)
                                                    ? 0.6 : 0
                                                }
                                            />
                                        ))
                                    ))}
                                </g>

                                {/* Africa */}
                                <g opacity="0.3">
                                    {Array.from({ length: 40 }, (_, i) => (
                                        Array.from({ length: 20 }, (_, j) => (
                                            <circle
                                                key={`af-${i}-${j}`}
                                                cx={420 + j * 4}
                                                cy={140 + i * 4}
                                                r="0.8"
                                                fill="white"
                                                opacity={
                                                    (i < 8 && j > 3 && j < 17) ||
                                                    (i >= 8 && i < 25 && j > 1 && j < 19) ||
                                                    (i >= 25 && i < 35 && j > 2 && j < 16) ||
                                                    (i >= 35 && j > 5 && j < 12)
                                                    ? 0.6 : 0
                                                }
                                            />
                                        ))
                                    ))}
                                </g>

                                {/* Asia */}
                                <g opacity="0.3">
                                    {/* Russia */}
                                    {Array.from({ length: 15 }, (_, i) => (
                                        Array.from({ length: 60 }, (_, j) => (
                                            <circle
                                                key={`ru-${i}-${j}`}
                                                cx={500 + j * 4}
                                                cy={40 + i * 3}
                                                r="0.8"
                                                fill="white"
                                                opacity={
                                                    (i < 12 && j > 5 && j < 55)
                                                    ? 0.6 : 0
                                                }
                                            />
                                        ))
                                    ))}
                                    
                                    {/* China & Central Asia */}
                                    {Array.from({ length: 20 }, (_, i) => (
                                        Array.from({ length: 35 }, (_, j) => (
                                            <circle
                                                key={`cn-${i}-${j}`}
                                                cx={550 + j * 4}
                                                cy={100 + i * 3}
                                                r="0.8"
                                                fill="white"
                                                opacity={
                                                    (i < 15 && j > 2 && j < 30) ||
                                                    (i >= 15 && j > 5 && j < 25)
                                                    ? 0.6 : 0
                                                }
                                            />
                                        ))
                                    ))}
                                    
                                    {/* India & Southeast Asia */}
                                    {Array.from({ length: 25 }, (_, i) => (
                                        Array.from({ length: 30 }, (_, j) => (
                                            <circle
                                                key={`in-${i}-${j}`}
                                                cx={600 + j * 3}
                                                cy={160 + i * 3}
                                                r="0.8"
                                                fill="white"
                                                opacity={
                                                    (i < 12 && j > 2 && j < 15) ||
                                                    (i >= 12 && i < 20 && j > 5 && j < 25) ||
                                                    (i >= 20 && j > 8 && j < 20)
                                                    ? 0.6 : 0
                                                }
                                            />
                                        ))
                                    ))}
                                </g>

                                {/* Australia */}
                                <g opacity="0.3">
                                    {Array.from({ length: 15 }, (_, i) => (
                                        Array.from({ length: 25 }, (_, j) => (
                                            <circle
                                                key={`au-${i}-${j}`}
                                                cx={700 + j * 4}
                                                cy={320 + i * 3}
                                                r="0.8"
                                                fill="white"
                                                opacity={
                                                    (i < 12 && j > 3 && j < 22)
                                                    ? 0.6 : 0
                                                }
                                            />
                                        ))
                                    ))}
                                </g>
                            </g>

                            {/* Data Points */}
                            <g>
                                {mapData.map((point, index) => {
                                    const coords = projectCoordinates(point.latitude, point.longitude);
                                    const dotSize = getDotSize(point.value);
                                    const opacity = getDotOpacity(point.value);
                                    
                                    return (
                                        <motion.g
                                            key={point.country}
                                            initial={{ scale: 0, opacity: 0 }}
                                            whileInView={{ scale: 1, opacity: 1 }}
                                            transition={{ 
                                                duration: 0.6, 
                                                delay: 0.5 + index * 0.05,
                                                type: "spring",
                                                stiffness: 100
                                            }}
                                        >
                                            {/* Outer glow */}
                                            <circle
                                                cx={coords.x}
                                                cy={coords.y}
                                                r={dotSize * 2}
                                                fill="#22c55e"
                                                opacity={0.2}
                                                className="animate-pulse"
                                            />
                                            
                                            {/* Middle ring */}
                                            <circle
                                                cx={coords.x}
                                                cy={coords.y}
                                                r={dotSize * 1.5}
                                                fill="#22c55e"
                                                opacity={0.4}
                                                className="animate-ping"
                                                style={{
                                                    animationDelay: `${index * 0.1}s`,
                                                    animationDuration: '2s'
                                                }}
                                            />
                                            
                                            {/* Core dot */}
                                            <circle
                                                cx={coords.x}
                                                cy={coords.y}
                                                r={dotSize}
                                                fill="#22c55e"
                                                opacity={opacity}
                                                className="cursor-pointer hover:opacity-100 transition-opacity duration-300"
                                            />
                                            
                                            {/* Tooltip on hover */}
                                            <g className="opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                                                <rect
                                                    x={coords.x - 40}
                                                    y={coords.y - 35}
                                                    width="80"
                                                    height="25"
                                                    fill="rgba(0, 0, 0, 0.9)"
                                                    rx="4"
                                                    stroke="#22c55e"
                                                    strokeWidth="1"
                                                />
                                                <text
                                                    x={coords.x}
                                                    y={coords.y - 20}
                                                    textAnchor="middle"
                                                    fill="white"
                                                    fontSize="10"
                                                    fontWeight="600"
                                                >
                                                    {point.name}
                                                </text>
                                                <text
                                                    x={coords.x}
                                                    y={coords.y - 10}
                                                    textAnchor="middle"
                                                    fill="#22c55e"
                                                    fontSize="8"
                                                >
                                                    {point.value}% Coverage
                                                </text>
                                            </g>
                                        </motion.g>
                                    );
                                })}
                            </g>
                        </svg>
                    </div>
                </motion.div>

                {/* Stats */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.6 }}
                    className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16"
                >
                    <div className="text-center">
                        <div className="text-3xl font-bold text-primary mb-2">20+</div>
                        <div className="text-gray-300 text-sm">Countries</div>
                    </div>
                    <div className="text-center">
                        <div className="text-3xl font-bold text-primary mb-2">500K+</div>
                        <div className="text-gray-300 text-sm">Charging Points</div>
                    </div>
                    <div className="text-center">
                        <div className="text-3xl font-bold text-primary mb-2">85%</div>
                        <div className="text-gray-300 text-sm">Avg Coverage</div>
                    </div>
                    <div className="text-center">
                        <div className="text-3xl font-bold text-primary mb-2">24/7</div>
                        <div className="text-gray-300 text-sm">Support</div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}