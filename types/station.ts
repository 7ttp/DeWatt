export default interface Station {
  id: string;
  latitude: number;
  longitude: number;
  address: string;
  maxVoltage: number;
  availablePlugs: string;
  maxCapacity: number;
  batteryLevel: number;
  meanPrice: number;
}
