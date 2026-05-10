// src/pages/customer/ShopsListPage.jsx

import React, { useEffect, useState } from 'react';
import { useApi } from '../../hooks/useApi';
import shopService from '../../api/shopService';
import ShopCard from '../../components/specific/ShopCard';
import Spinner from '../../components/common/Spinner';
import Button from '../../components/common/Button';

const ShopsListPage = () => {
  const { data: shops, loading, error, request: fetchShops } = useApi(shopService.getAllShops);
  const [locationError, setLocationError] = useState('');

  console.log(shops);

  // Fetch all shops on initial load
  useEffect(() => {
    fetchShops();
  }, [fetchShops]);

  // Handler for "Find Near Me" button
  const handleFindNearMe = () => {
    setLocationError('');
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        // Fetch shops within a 5km radius
        fetchShops({ latitude, longitude, distance: 5 });
      },
      () => {
        setLocationError('Unable to retrieve your location.');
      }
    );
  };

  return (
    <div className="container mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold text-text-primary">Find a Pharmacy</h1>
        <p className="mt-2 text-text-secondary">Browse verified pharmacies in our network.</p>
        <div className="mt-6 flex justify-center space-x-4">
          <Button onClick={handleFindNearMe}>Find Shops Near Me</Button>
          <Button onClick={() => fetchShops()} variant="secondary" className=' hover:text-white'>Show All Shops</Button>
        </div>
        {locationError && <p className="mt-4 text-sm text-red-400">{locationError}</p>}
      </div>

      {loading && <div className="flex justify-center py-10"><Spinner size="lg" /></div>}
      {error && <p className="text-center text-red-400">Could not fetch shops. Please try again later.</p>}

      {shops && (
        shops.data.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {shops.data
              .map((shop) => (
                <ShopCard key={shop._id} shop={shop} />
              ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-secondary-dark rounded-lg">
            <p className="text-text-secondary">No shops found.</p>
          </div>
        )
      )}
    </div>
  );
};

export default ShopsListPage;