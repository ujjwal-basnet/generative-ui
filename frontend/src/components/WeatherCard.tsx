'use client';
import React from 'react';

type WeatherProps = {
  location: string;
  temperature: number;
  weather: string;
  feels_like: number;
  humidity: number;
  wind_speed: number;
  icon: string;
};

export function WeatherCard(props: WeatherProps) {
  const { location, temperature, weather, feels_like, humidity, wind_speed, icon } = props;

  return (
    <div className="relative overflow-hidden rounded-2xl p-6 min-w-[280px]"
      style={{
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
        boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
      }}>
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-40 h-40 rounded-full opacity-10"
        style={{ background: 'radial-gradient(circle, #e94560, transparent)', transform: 'translate(30%, -30%)' }} />

      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-blue-300 text-xs font-semibold uppercase tracking-widest mb-1">Current Weather</p>
          <h2 className="text-white text-xl font-bold">{location}</h2>
        </div>
        <span className="text-4xl">{icon}</span>
      </div>

      {/* Main temperature */}
      <div className="mb-4">
        <div className="flex items-end gap-2">
          <span className="text-white font-black" style={{ fontSize: '4rem', lineHeight: 1 }}>
            {Math.round(temperature)}
          </span>
          <span className="text-blue-200 text-2xl font-light mb-2">°C</span>
        </div>
        <p className="text-blue-200 text-base font-medium">{weather}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-white/10">
        <StatPill label="Feels like" value={`${Math.round(feels_like)}°C`} />
        <StatPill label="Humidity" value={`${humidity}%`} />
        <StatPill label="Wind" value={`${wind_speed} km/h`} />
      </div>
    </div>
  );
}

function StatPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <p className="text-blue-400 text-xs mb-1">{label}</p>
      <p className="text-white text-sm font-semibold">{value}</p>
    </div>
  );
}