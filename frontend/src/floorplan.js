import React, { useEffect, useState } from 'react';
import Header from './Header';

const Floorplan = () => {
    // State to store floor data
    const [floor, setFloor] = useState(null);

    useEffect(() => {
        // Fetch floor data from your backend API when the component mounts.
        // Adjust the URL as needed (e.g., 'http://localhost:5001/api/floors').
        fetch('http://localhost:5001/api/floors')
            .then(response => response.json())
            .then(data => {
                // Assuming your API returns an array of floors, we're taking the first one.
                if (data.length > 0) {
                    setFloor(data[0]);
                }
            })
            .catch(error => console.error('Error fetching floor:', error));
    }, []);

    const floorName = floor?.name;
    const floorBuilding = floor?.building;
    const floorImage = floor?.image;

    return (
        <div>
        <Header />
        <div style={{ padding: '20px' }}>
          {/* Başlık Ortalanmış */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
            <h1>{floorBuilding}</h1>
            <h1>{floorName}</h1>
          </div>
    
          {/* Görsel Ortalanmış */}
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
            <img
              src={floorImage}
              alt={floorName}
              style={{ width: '100%', maxWidth: '800px', height: 'auto' }}
            />
          </div>
        </div>
      </div>
      );
    };

export default Floorplan;
