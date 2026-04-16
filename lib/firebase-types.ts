export interface DeviceInfo {
  device_name: string;
  location: string;
  status: "ACTIVE" | "INACTIVE" | "MAINTENANCE";
}

export interface LiveData {
  current: number;
  status: "EFFICIENT" | "OVERLOAD" | "UNDERUSAGE" | "IDLE" | "MISSING";
  timestamp: number;
}

export interface SensorData {
  sensor_id: string;
  device_id: string;
  current_value: number;
  timestamp: number;
}

export interface MachineEvent {
  event_id: string;
  device_id: string;
  current_value: number;
  status_type: "OVERLOAD" | "UNDERUSAGE" | "IDLE" | "MISSING" | "EFFICIENT";
  event_time: number;
  duration: number;
}

export interface WaterUsage {
  water_id: string;
  device_id: string;
  flow_rate: number;
  total_usage: number;
  timestamp: number;
}

export interface ThresholdConfig {
  overload_limit: number;
  underusage_limit: number;
  idle_threshold: number;
  missing_timeout: number;
}

export interface SystemLog {
  log_id: string;
  device_id: string;
  log_type: "EVENT" | "ALERT" | "INFO" | "ERROR";
  message: string;
  timestamp: number;
}

export type StatusType = "EFFICIENT" | "OVERLOAD" | "UNDERUSAGE" | "IDLE" | "MISSING";
