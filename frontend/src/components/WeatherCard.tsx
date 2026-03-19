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
    <div style={{
      background: '#fff',
      border: '3px solid #000',
      boxShadow: '6px 6px 0px 0px #000',
      minWidth: 300,
      maxWidth: 360,
      fontFamily: 'Domine, serif',
      overflow: 'hidden',
    }}>
      {/* Top bar */}
      <div style={{
        background: '#000',
        padding: '10px 18px',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
      }}>
        <span className="material-symbols-outlined" style={{ color: '#FAC638', fontSize: 18, fontVariationSettings: "'FILL' 1" }}>location_on</span>
        <span style={{
          fontFamily: 'Archivo Black, sans-serif',
          textTransform: 'uppercase',
          fontSize: 11,
          letterSpacing: '0.1em',
          color: '#FAC638',
        }}>
          Current Weather
        </span>
      </div>

      {/* Main content */}
      <div style={{ padding: '20px 22px' }}>
        {/* Location + icon */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
          <h2 style={{
            fontFamily: 'Archivo Black, sans-serif',
            textTransform: 'uppercase',
            fontSize: 20,
            letterSpacing: '-0.02em',
            lineHeight: 1.1,
          }}>
            {location}
          </h2>
          <span style={{ fontSize: 48, lineHeight: 1, marginTop: -4 }}>{icon}</span>
        </div>

        {/* Big temperature */}
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, marginBottom: 6 }}>
          <span style={{
            fontFamily: 'Archivo Black, sans-serif',
            fontSize: 72,
            letterSpacing: '-0.04em',
            lineHeight: 1,
          }}>
            {Math.round(temperature)}
          </span>
          <span style={{ fontSize: 28, fontFamily: 'Archivo Black, sans-serif', marginBottom: 10, color: '#555' }}>°C</span>
        </div>

        <p style={{
          fontFamily: 'Archivo Black, sans-serif',
          textTransform: 'uppercase',
          fontSize: 13,
          letterSpacing: '0.05em',
          color: '#333',
          marginBottom: 20,
        }}>
          {weather}
        </p>

        {/* Stats grid */}
        <div style={{
          borderTop: '3px solid #000',
          paddingTop: 16,
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: 0,
        }}>
          {[
            { label: 'Feels Like', value: `${Math.round(feels_like)}°C` },
            { label: 'Humidity', value: `${humidity}%` },
            { label: 'Wind', value: `${wind_speed} km/h` },
          ].map((stat, i) => (
            <div key={stat.label} style={{
              textAlign: 'center',
              padding: '12px 8px',
              borderLeft: i > 0 ? '3px solid #000' : 'none',
            }}>
              <p style={{ fontSize: 10, fontFamily: 'Archivo Black, sans-serif', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#777', marginBottom: 4 }}>
                {stat.label}
              </p>
              <p style={{ fontFamily: 'Archivo Black, sans-serif', fontSize: 16 }}>
                {stat.value}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}