import React, { useEffect, useCallback } from 'react';
import { Outlet, useOutletContext } from 'react-router-dom';
import ShopOwnerSidebar from './ShopOwnerSidebar';
import { useApi } from '../../hooks/useApi';
import shopService from '../../api/shopService';
import { useAuth } from '../../context/AuthContext';

const ShopOwnerLayout = () => {
  const { user } = useAuth();
  const { data: shopResponse, loading, request: fetchShop } = useApi(shopService.getMyShop);

  const memoizedFetchShop = useCallback(() => {
    if (user?.role === 'shop-owner') {
      fetchShop();
    }
  }, [fetchShop, user]);

  useEffect(() => {
    memoizedFetchShop();
  }, [memoizedFetchShop]);

  useEffect(() => {
    console.log('[SHOP DATA FROM LAYOUT]:', shopResponse);
  }, [shopResponse]);

  return (
    <div className="flex bg-primary-dark min-h-screen print:bg-white print:block">
      <ShopOwnerSidebar shop={shopResponse?.data} loading={loading} />
      <main className="flex-1 p-6 lg:p-8 print:p-0 print:m-0">
        <Outlet context={{ refetchShop: memoizedFetchShop }} />
      </main>
    </div>
  );
};

export default ShopOwnerLayout;