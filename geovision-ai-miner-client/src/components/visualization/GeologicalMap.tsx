import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

interface GeologicalData {
  id: string;
  type: 'rock' | 'mineral' | 'soil' | 'water';
  coordinates: [number, number];
  properties: {
    name: string;
    composition: string;
    age: string;
    depth: number;
    confidence: number;
  };
}

interface GeologicalMapProps {
  data: GeologicalData[];
  onPointClick?: (point: GeologicalData) => void;
  selectedPoint?: string;
  className?: string;
}

export const GeologicalMap: React.FC<GeologicalMapProps> = ({
  data,
  onPointClick,
  selectedPoint,
  className = ''
}) => {
  const [hoveredPoint, setHoveredPoint] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const geologicalColors = {
    rock: '#8B4513',
    mineral: '#FFD700',
    soil: '#DEB887',
    water: '#4682B4'
  };

  const geologicalSymbols = {
    rock: '●',
    mineral: '◆',
    soil: '■',
    water: '○'
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw geological points
    data.forEach(point => {
      const [x, y] = point.coordinates;
      const color = geologicalColors[point.type];
      const symbol = geologicalSymbols[point.type];
      const isSelected = selectedPoint === point.id;
      const isHovered = hoveredPoint === point.id;

      ctx.save();
      ctx.translate(x * zoom, y * zoom);
      ctx.scale(zoom, zoom);

      // Draw symbol
      ctx.font = `${isSelected ? 24 : isHovered ? 20 : 16}px Arial`;
      ctx.fillStyle = color;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(symbol, 0, 0);

      // Draw selection/hover effects
      if (isSelected || isHovered) {
        ctx.strokeStyle = isSelected ? '#FF0000' : '#FFA500';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, 12, 0, 2 * Math.PI);
        ctx.stroke();
      }

      ctx.restore();
    });
  }, [data, selectedPoint, hoveredPoint, zoom]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / zoom;
    const y = (e.clientY - rect.top) / zoom;

    // Find clicked point
    const clickedPoint = data.find(point => {
      const [px, py] = point.coordinates;
      const distance = Math.sqrt((x - px) ** 2 + (y - py) ** 2);
      return distance < 10;
    });

    if (clickedPoint && onPointClick) {
      onPointClick(clickedPoint);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / zoom;
    const y = (e.clientY - rect.top) / zoom;

    // Find hovered point
    const hovered = data.find(point => {
      const [px, py] = point.coordinates;
      const distance = Math.sqrt((x - px) ** 2 + (y - py) ** 2);
      return distance < 10;
    });

    setHoveredPoint(hovered?.id || null);
  };

  return (
    <motion.div
      className={`relative bg-geological-soil rounded-lg p-4 ${className}`}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-geological-rock">Geological Map</h3>
        <div className="flex space-x-2">
          <button
            onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}
            className="px-2 py-1 bg-geological-stone text-white rounded text-sm"
          >
            -
          </button>
          <span className="px-2 py-1 bg-white rounded text-sm">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={() => setZoom(Math.min(3, zoom + 0.1))}
            className="px-2 py-1 bg-geological-stone text-white rounded text-sm"
          >
            +
          </button>
        </div>
      </div>

      <div className="relative">
        <canvas
          ref={canvasRef}
          width={600}
          height={400}
          className="border border-geological-stone rounded cursor-crosshair"
          onClick={handleCanvasClick}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHoveredPoint(null)}
        />

        {/* Legend */}
        <div className="absolute top-2 right-2 bg-white bg-opacity-90 p-2 rounded text-xs">
          <div className="font-semibold mb-1">Legend</div>
          {Object.entries(geologicalSymbols).map(([type, symbol]) => (
            <div key={type} className="flex items-center space-x-1">
              <span style={{ color: geologicalColors[type as keyof typeof geologicalColors] }}>
                {symbol}
              </span>
              <span className="capitalize">{type}</span>
            </div>
          ))}
        </div>

        {/* Tooltip */}
        {hoveredPoint && (
          <motion.div
            className="absolute bg-black bg-opacity-80 text-white p-2 rounded text-xs pointer-events-none"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{
              left: '50%',
              top: '10px',
              transform: 'translateX(-50%)'
            }}
          >
            {data.find(p => p.id === hoveredPoint)?.properties.name}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}; 