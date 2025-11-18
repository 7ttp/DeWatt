export interface User {
  wallet: string;
  usdBalance: number;
  evTokenBalance: number;
  totalKwh: number;
  co2Saved: number;
  createdAt: Date;
}

export interface ChargingSession {
  chargeId: string;
  stationId: string;
  wallet: string;
  kwh: number;
  totalCost: number;
  status: 'active' | 'completed' | 'cancelled';
  explorerLink: string;
  createdAt: Date;
}

export interface P2POrder {
  _id: string;
  wallet: string;
  type: 'buy' | 'sell';
  amount: number;
  price: number;
  status: 'open' | 'completed';
  buyer?: string;
  createdAt: Date;
  completedAt?: Date;
}

export interface Station {
  id: string;
  address: string;
  latitude: number;
  longitude: number;
  batteryLevel: number;
  maxCapacity: number;
  meanPrice: number;
  availablePlugs: string;
  maxVoltage: number;
  status: string;
  connectors: number;
}
