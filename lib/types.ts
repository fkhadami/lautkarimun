export type RiskStatus = "safe" | "warning" | "danger";

export type Location = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  wave_height: number;
  wind_speed: number;
  current_speed: number;
  tide_condition: string;
  risk_status: RiskStatus;
  source: string;
  updated_at: string;
};

export type Alert = {
  id: string;
  location_id: string;
  title: string;
  severity: RiskStatus;
  message: string;
};

export type Summary = {
  location_id: string;
  summary: string;
};

export type TimeSeriesPoint = {
  time: string;
  wave_height: number;
  wind_speed: number;
  current_speed: number;
  sea_level: number;
  risk_status: RiskStatus;
  period: "history" | "forecast";
};

export type TimeSeries = {
  location_id: string;
  location_name: string;
  past_days: number;
  forecast_days: number;
  points: TimeSeriesPoint[];
};
