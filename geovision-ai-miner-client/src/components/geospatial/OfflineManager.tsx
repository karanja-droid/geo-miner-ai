import React, { useState, useEffect, useCallback } from 'react';

interface OfflineData {
  id: string;
  type: 'drill-hole' | 'geological-feature' | 'photogrammetry' | 'gis-layer';
  data: any;
  timestamp: number;
  synced: boolean;
  size: number;
}

interface SyncStatus {
  isOnline: boolean;
  lastSync: Date | null;
  pendingItems: number;
  totalSize: number;
  syncProgress: number;
}

interface OfflineManagerProps {
  onSync?: (data: OfflineData[]) => Promise<void>;
  onDataUpdate?: (data: OfflineData) => void;
  maxStorageSize?: number; // in MB
  className?: string;
}

export const OfflineManager: React.FC<OfflineManagerProps> = ({
  onSync,
  onDataUpdate,
  maxStorageSize = 100, // 100MB default
  className = '',
}) => {
  const [offlineData, setOfflineData] = useState<OfflineData[]>([]);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isOnline: navigator.onLine,
    lastSync: null,
    pendingItems: 0,
    totalSize: 0,
    syncProgress: 0,
  });
  const [isSyncing, setIsSyncing] = useState(false);
  const [selectedData, setSelectedData] = useState<string[]>([]);

  // Check online status
  useEffect(() => {
    const handleOnline = () => {
      setSyncStatus(prev => ({ ...prev, isOnline: true }));
    };

    const handleOffline = () => {
      setSyncStatus(prev => ({ ...prev, isOnline: false }));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Load offline data from localStorage
  useEffect(() => {
    const loadOfflineData = () => {
      try {
        const stored = localStorage.getItem('geovision-offline-data');
        if (stored) {
          const data: OfflineData[] = JSON.parse(stored);
          setOfflineData(data);
          
          const pendingItems = data.filter(item => !item.synced).length;
          const totalSize = data.reduce((sum, item) => sum + item.size, 0);
          
          setSyncStatus(prev => ({
            ...prev,
            pendingItems,
            totalSize,
          }));
        }
      } catch (error) {
        console.error('Failed to load offline data:', error);
      }
    };

    loadOfflineData();
  }, []);

  // Save offline data to localStorage
  const saveOfflineData = useCallback((data: OfflineData[]) => {
    try {
      localStorage.setItem('geovision-offline-data', JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save offline data:', error);
    }
  }, []);

  // Add data to offline storage
  const addOfflineData = useCallback((type: OfflineData['type'], data: any) => {
    const newItem: OfflineData = {
      id: `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      data,
      timestamp: Date.now(),
      synced: false,
      size: JSON.stringify(data).length,
    };

    const updatedData = [...offlineData, newItem];
    setOfflineData(updatedData);
    saveOfflineData(updatedData);

    // Update sync status
    setSyncStatus(prev => ({
      ...prev,
      pendingItems: prev.pendingItems + 1,
      totalSize: prev.totalSize + newItem.size,
    }));

    if (onDataUpdate) {
      onDataUpdate(newItem);
    }

    return newItem.id;
  }, [offlineData, saveOfflineData, onDataUpdate]);

  // Remove data from offline storage
  const removeOfflineData = useCallback((ids: string[]) => {
    const updatedData = offlineData.filter(item => !ids.includes(item.id));
    setOfflineData(updatedData);
    saveOfflineData(updatedData);

    // Update sync status
    const removedItems = offlineData.filter(item => ids.includes(item.id));
    const removedSize = removedItems.reduce((sum, item) => sum + item.size, 0);
    const removedPending = removedItems.filter(item => !item.synced).length;

    setSyncStatus(prev => ({
      ...prev,
      pendingItems: prev.pendingItems - removedPending,
      totalSize: prev.totalSize - removedSize,
    }));
  }, [offlineData, saveOfflineData]);

  // Sync data with server
  const syncData = useCallback(async () => {
    if (!syncStatus.isOnline || isSyncing) return;

    const unsyncedData = offlineData.filter(item => !item.synced);
    if (unsyncedData.length === 0) return;

    setIsSyncing(true);
    setSyncStatus(prev => ({ ...prev, syncProgress: 0 }));

    try {
      if (onSync) {
        await onSync(unsyncedData);
      }

      // Mark items as synced
      const updatedData = offlineData.map(item => 
        unsyncedData.some(unsynced => unsynced.id === item.id)
          ? { ...item, synced: true }
          : item
      );

      setOfflineData(updatedData);
      saveOfflineData(updatedData);

      setSyncStatus(prev => ({
        ...prev,
        lastSync: new Date(),
        pendingItems: 0,
        syncProgress: 100,
      }));
    } catch (error) {
      console.error('Sync failed:', error);
    } finally {
      setIsSyncing(false);
    }
  }, [offlineData, syncStatus.isOnline, isSyncing, onSync, saveOfflineData]);

  // Auto-sync when coming back online
  useEffect(() => {
    if (syncStatus.isOnline && syncStatus.pendingItems > 0) {
      syncData();
    }
  }, [syncStatus.isOnline, syncStatus.pendingItems, syncData]);

  // Check storage limit
  const storageUsage = (syncStatus.totalSize / (maxStorageSize * 1024 * 1024)) * 100;
  const isStorageFull = storageUsage >= 90;

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const getDataTypeIcon = (type: OfflineData['type']) => {
    switch (type) {
      case 'drill-hole': return '🔍';
      case 'geological-feature': return '🗺️';
      case 'photogrammetry': return '📷';
      case 'gis-layer': return '🗺️';
      default: return '📄';
    }
  };

  return (
    <div className={`offline-manager ${className}`}>
      {/* Status Header */}
      <div className="status-header">
        <h3>Offline Data Manager</h3>
        <div className="status-indicators">
          <div className={`status-indicator ${syncStatus.isOnline ? 'online' : 'offline'}`}>
            <span className="status-dot"></span>
            {syncStatus.isOnline ? 'Online' : 'Offline'}
          </div>
          <div className="storage-usage">
            <span>Storage: {formatFileSize(syncStatus.totalSize)} / {maxStorageSize}MB</span>
            <div className="storage-bar">
              <div 
                className={`storage-fill ${isStorageFull ? 'full' : ''}`}
                style={{ width: `${Math.min(storageUsage, 100)}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Sync Controls */}
      <div className="sync-controls">
        <button
          className="sync-button"
          onClick={syncData}
          disabled={!syncStatus.isOnline || isSyncing || syncStatus.pendingItems === 0}
        >
          {isSyncing ? 'Syncing...' : 'Sync Data'}
        </button>
        {syncStatus.lastSync && (
          <span className="last-sync">
            Last sync: {syncStatus.lastSync.toLocaleString()}
          </span>
        )}
        {syncStatus.pendingItems > 0 && (
          <span className="pending-items">
            {syncStatus.pendingItems} items pending
          </span>
        )}
      </div>

      {/* Sync Progress */}
      {isSyncing && (
        <div className="sync-progress">
          <div className="progress-bar">
            <div 
              className="progress-fill"
              style={{ width: `${syncStatus.syncProgress}%` }}
            ></div>
          </div>
          <span>{syncStatus.syncProgress}%</span>
        </div>
      )}

      {/* Data List */}
      <div className="data-list">
        <div className="list-header">
          <h4>Offline Data ({offlineData.length})</h4>
          <div className="list-actions">
            <button
              onClick={() => setSelectedData(offlineData.map(item => item.id))}
              disabled={offlineData.length === 0}
            >
              Select All
            </button>
            <button
              onClick={() => setSelectedData([])}
              disabled={selectedData.length === 0}
            >
              Clear Selection
            </button>
            <button
              onClick={() => removeOfflineData(selectedData)}
              disabled={selectedData.length === 0}
              className="danger"
            >
              Delete Selected
            </button>
          </div>
        </div>

        {offlineData.length === 0 ? (
          <div className="no-data">
            <p>No offline data available</p>
          </div>
        ) : (
          <div className="data-items">
            {offlineData.map(item => (
              <div
                key={item.id}
                className={`data-item ${selectedData.includes(item.id) ? 'selected' : ''} ${item.synced ? 'synced' : 'pending'}`}
                onClick={() => {
                  setSelectedData(prev => 
                    prev.includes(item.id)
                      ? prev.filter(id => id !== item.id)
                      : [...prev, item.id]
                  );
                }}
              >
                <div className="item-checkbox">
                  <input
                    type="checkbox"
                    checked={selectedData.includes(item.id)}
                    onChange={() => {}}
                  />
                </div>
                <div className="item-icon">
                  {getDataTypeIcon(item.type)}
                </div>
                <div className="item-info">
                  <div className="item-name">
                    {item.type.replace('-', ' ').toUpperCase()}
                  </div>
                  <div className="item-details">
                    <span>{formatFileSize(item.size)}</span>
                    <span>{formatDate(item.timestamp)}</span>
                    <span className={`sync-status ${item.synced ? 'synced' : 'pending'}`}>
                      {item.synced ? 'Synced' : 'Pending'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <button
          onClick={() => addOfflineData('drill-hole', { test: 'drill-hole-data' })}
          disabled={isStorageFull}
        >
          Add Drill Hole Data
        </button>
        <button
          onClick={() => addOfflineData('geological-feature', { test: 'geological-data' })}
          disabled={isStorageFull}
        >
          Add Geological Feature
        </button>
        <button
          onClick={() => addOfflineData('photogrammetry', { test: 'photogrammetry-data' })}
          disabled={isStorageFull}
        >
          Add Photogrammetry Data
        </button>
      </div>
    </div>
  );
}; 