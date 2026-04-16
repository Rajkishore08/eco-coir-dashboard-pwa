import { useState, useEffect } from 'react';
import { database, ref, onValue, get } from '@/lib/firebase';
import type { LiveData, MachineEvent, WaterUsage, DeviceInfo, ThresholdConfig, SystemLog } from '@/lib/firebase-types';

export function useLiveData(deviceId: string = "device_01") {
  const [data, setData] = useState<LiveData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const dataRef = ref(database, `LIVE_DATA/${deviceId}`);
    
    const unsubscribe = onValue(dataRef, 
      (snapshot) => {
        if (snapshot.exists()) {
          setData(snapshot.val());
        } else {
          setData(null);
        }
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [deviceId]);

  return { data, loading, error };
}

export function useDeviceInfo(deviceId: string = "device_01") {
  const [data, setData] = useState<DeviceInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const dataRef = ref(database, `DEVICE_INFO/${deviceId}`);
    
    const unsubscribe = onValue(dataRef, (snapshot) => {
      if (snapshot.exists()) {
        setData(snapshot.val());
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [deviceId]);

  return { data, loading };
}

export function useThresholdConfig(deviceId: string = "device_01") {
  const [data, setData] = useState<ThresholdConfig | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const dataRef = ref(database, `THRESHOLD_CONFIG/${deviceId}`);
    
    const unsubscribe = onValue(dataRef, (snapshot) => {
      if (snapshot.exists()) {
        setData(snapshot.val());
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [deviceId]);

  return { data, loading };
}

export async function getMachineEvents(deviceId: string = "device_01", limit: number = 50): Promise<MachineEvent[]> {
  const eventsRef = ref(database, 'MACHINE_EVENT');
  const snapshot = await get(eventsRef);
  
  if (!snapshot.exists()) return [];
  
  const events: MachineEvent[] = [];
  snapshot.forEach((child) => {
    const event = child.val();
    if (event.device_id === deviceId) {
      events.push(event);
    }
  });
  
  return events
    .sort((a, b) => b.event_time - a.event_time)
    .slice(0, limit);
}

export async function getWaterUsageHistory(deviceId: string = "device_01", limit: number = 100): Promise<WaterUsage[]> {
  const waterRef = ref(database, 'WATER_USAGE');
  const snapshot = await get(waterRef);
  
  if (!snapshot.exists()) return [];
  
  const usage: WaterUsage[] = [];
  snapshot.forEach((child) => {
    const data = child.val();
    if (data.device_id === deviceId) {
      usage.push(data);
    }
  });
  
  return usage
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, limit);
}

export async function getSystemLogs(deviceId: string = "device_01", limit: number = 50): Promise<SystemLog[]> {
  const logsRef = ref(database, 'SYSTEM_LOGS');
  const snapshot = await get(logsRef);
  
  if (!snapshot.exists()) return [];
  
  const logs: SystemLog[] = [];
  snapshot.forEach((child) => {
    const log = child.val();
    if (log.device_id === deviceId) {
      logs.push(log);
    }
  });
  
  return logs
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, limit);
}

export function useRealtimeEvents(deviceId: string = "device_01", limit: number = 10) {
  const [events, setEvents] = useState<MachineEvent[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const eventsRef = ref(database, 'MACHINE_EVENT');
    
    const unsubscribe = onValue(eventsRef, (snapshot) => {
      if (snapshot.exists()) {
        const allEvents: MachineEvent[] = [];
        snapshot.forEach((child) => {
          const event = child.val();
          if (event.device_id === deviceId) {
            allEvents.push(event);
          }
        });
        
        // Set total count before filtering
        setTotalCount(allEvents.length);
        
        const sorted = allEvents
          .sort((a, b) => b.event_time - a.event_time)
          .slice(0, limit);
        
        setEvents(sorted);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [deviceId, limit]);

  return { events, totalCount, loading };
}

export function useRealtimeWaterUsage(deviceId: string = "device_01") {
  const [currentUsage, setCurrentUsage] = useState<WaterUsage | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const waterRef = ref(database, 'WATER_USAGE');
    
    const unsubscribe = onValue(waterRef, (snapshot) => {
      if (snapshot.exists()) {
        const allUsage: WaterUsage[] = [];
        snapshot.forEach((child) => {
          const data = child.val();
          if (data.device_id === deviceId) {
            allUsage.push(data);
          }
        });
        
        if (allUsage.length > 0) {
          const latest = allUsage.sort((a, b) => b.timestamp - a.timestamp)[0];
          setCurrentUsage(latest);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [deviceId]);

  return { currentUsage, loading };
}
