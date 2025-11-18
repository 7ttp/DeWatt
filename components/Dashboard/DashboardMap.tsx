'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Icon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import stationsList from '@/components/MapSectionHome/stations';

// Create custom green marker icon
const createCustomIcon = (status: string) => {
  const color = status === 'active' ? '#22c55e' : status === 'maintenance' ? '#f59e0b' : '#6b7280';
  
  const svgIcon = `
    <svg width="32" height="42" viewBox="0 0 32 42" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="2"/>
          <feOffset dx="0" dy="2" result="offsetblur"/>
          <feComponentTransfer>
            <feFuncA type="linear" slope="0.3"/>
          </feComponentTransfer>
          <feMerge>
            <feMergeNode/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      <path d="M16 0C7.163 0 0 7.163 0 16c0 12 16 26 16 26s16-14 16-26c0-8.837-7.163-16-16-16z" 
            fill="${color}" filter="url(#shadow)"/>
      <circle cx="16" cy="16" r="6" fill="white"/>
      <path d="M16 10l-2 6h4l-2 6" stroke="white" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  `;
  
  return new Icon({
    iconUrl: 'data:image/svg+xml;base64,' + btoa(svgIcon),
    iconSize: [32, 42],
    iconAnchor: [16, 42],
    popupAnchor: [0, -42],
  });
};

interface DashboardMapProps {
  onStationSelect: (station: any) => void;
}

export default function DashboardMap({ onStationSelect }: DashboardMapProps) {
  return (
    <MapContainer
      center={[12.9716, 77.5946]}
      zoom={12}
      style={{ height: '100%', width: '100%', background: '#000' }}
      className="rounded-2xl"
    >
      <TileLayer
        url="https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png?api_key=89476961-3991-4c69-b35b-4badb757ae5d"
        attribution='&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors'
        maxZoom={20}
      />
      {stationsList.map((station) => (
        <Marker
          key={station.id}
          position={[station.latitude, station.longitude]}
          icon={createCustomIcon(station.status)}
          eventHandlers={{
            click: () => onStationSelect(station),
          }}
        />
      ))}
    </MapContainer>
  );
}
