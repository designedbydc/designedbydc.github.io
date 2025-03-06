import React from 'react';
import { SearchResult, Flight, Hotel } from '../types';

interface ResultsDisplayProps {
  results: SearchResult;
}

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ results }) => {
  return (
    <div className="results-display">
      <h2 className="results-title">
        {results.type === 'flight' ? '✈️ Flight Options' : '🏨 Hotel Options'}
      </h2>
      
      {results.type === 'flight' && (results.data as Flight[]).map((flight, index) => (
        <div key={index} className="result-item">
          <div className="result-header">
            <h3>{flight.airline} - {flight.flightNumber}</h3>
            <span className="result-price">{flight.price} {flight.currency}</span>
          </div>
          <div className="result-details">
            <div className="flight-route">
              <div className="flight-point">
                <div className="flight-code">{flight.departureAirport}</div>
                <div className="flight-time">{flight.departureTime}</div>
              </div>
              <div className="flight-duration">
                <div className="flight-line"></div>
                <div className="flight-duration-text">{flight.duration}</div>
              </div>
              <div className="flight-point">
                <div className="flight-code">{flight.arrivalAirport}</div>
                <div className="flight-time">{flight.arrivalTime}</div>
              </div>
            </div>
          </div>
          <button className="book-button">Book Now</button>
        </div>
      ))}
      
      {results.type === 'hotel' && (results.data as Hotel[]).map((hotel, index) => (
        <div key={index} className="result-item">
          <div className="result-header">
            <h3>{hotel.name}</h3>
            <span className="result-price">{hotel.price} {hotel.currency}<span className="price-period">/night</span></span>
          </div>
          <div className="result-details">
            <div className="hotel-info">
              <p className="hotel-location">📍 {hotel.location}</p>
              <p className="hotel-rating">
                {'⭐'.repeat(hotel.starRating)}
              </p>
            </div>
          </div>
          <button className="book-button">Book Now</button>
        </div>
      ))}
    </div>
  );
};

export default ResultsDisplay; 