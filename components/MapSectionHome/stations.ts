const stationsList = [
  {
    "code": "BERSTD34",
    "name": "3.3kW Charger",
    "no_of_connectors": 2,
    "location": {
      "city": "Bengaluru",
      "address": "12 MG Road, Bengaluru, KA",
      "latitude": 12.9716,
      "longitude": 77.5946
    },
    "status": "active",
    "pricing": {
      "time_based": {
        "rate": 2.0,
        "unit": "INR_per_min"
      },
      "energy_based": {
        "rate": 19.0,
        "unit": "INR_per_kWh"
      }
    },
    "connectors": [
      {
        "id": "C1",
        "type": "Type-2 AC",
        "power_kw": 3.3,
        "status": "available"
      },
      {
        "id": "C2",
        "type": "Type-2 AC",
        "power_kw": 3.3,
        "status": "occupied"
      }
    ],
    // Legacy fields for compatibility
    "id": "BERSTD34",
    "address": "12 MG Road, Bengaluru, KA",
    "latitude": 12.9716,
    "longitude": 77.5946,
    "batteryLevel": 85.5,
    "maxCapacity": 3300,
    "meanPrice": 19.0,
    "availablePlugs": "Type-2 AC",
    "maxVoltage": 240
  },
  {
    "code": "DELHINR12",
    "name": "7.4kW Charger",
    "no_of_connectors": 1,
    "location": {
      "city": "New Delhi",
      "address": "Sector 18, Dwarka, New Delhi, DL",
      "latitude": 28.6139,
      "longitude": 77.2090
    },
    "status": "active",
    "pricing": {
      "time_based": {
        "rate": 2.5,
        "unit": "INR_per_min"
      },
      "energy_based": {
        "rate": 20.0,
        "unit": "INR_per_kWh"
      }
    },
    "connectors": [
      {
        "id": "C1",
        "type": "CCS2 DC",
        "power_kw": 7.4,
        "status": "available"
      }
    ],
    "id": "DELHINR12",
    "address": "Sector 18, Dwarka, New Delhi, DL",
    "latitude": 28.6139,
    "longitude": 77.2090,
    "batteryLevel": 92.3,
    "maxCapacity": 7400,
    "meanPrice": 20.0,
    "availablePlugs": "CCS2 DC",
    "maxVoltage": 400
  },
  {
    "code": "MUMBAI45",
    "name": "11kW Charger",
    "no_of_connectors": 2,
    "location": {
      "city": "Mumbai",
      "address": "Andheri East, Mumbai, MH",
      "latitude": 19.0760,
      "longitude": 72.8777
    },
    "status": "maintenance",
    "pricing": {
      "time_based": {
        "rate": 1.5,
        "unit": "INR_per_min"
      },
      "energy_based": {
        "rate": 17.0,
        "unit": "INR_per_kWh"
      }
    },
    "connectors": [
      {
        "id": "C1",
        "type": "Type-2 AC",
        "power_kw": 11,
        "status": "maintenance"
      },
      {
        "id": "C2",
        "type": "Type-2 AC",
        "power_kw": 11,
        "status": "maintenance"
      }
    ],
    "id": "MUMBAI45",
    "address": "Andheri East, Mumbai, MH",
    "latitude": 19.0760,
    "longitude": 72.8777,
    "batteryLevel": 0,
    "maxCapacity": 11000,
    "meanPrice": 17.0,
    "availablePlugs": "Type-2 AC",
    "maxVoltage": 240
  },
  {
    "code": "CHENNAI88",
    "name": "22kW Dual Port Charger",
    "no_of_connectors": 2,
    "location": {
      "city": "Chennai",
      "address": "OMR Road, Chennai, TN",
      "latitude": 13.0827,
      "longitude": 80.2707
    },
    "status": "active",
    "pricing": {
      "time_based": {
        "rate": 3.0,
        "unit": "INR_per_min"
      },
      "energy_based": {
        "rate": 21.5,
        "unit": "INR_per_kWh"
      }
    },
    "connectors": [
      {
        "id": "C1",
        "type": "CCS2 DC",
        "power_kw": 22,
        "status": "available"
      },
      {
        "id": "C2",
        "type": "CHAdeMO DC",
        "power_kw": 22,
        "status": "occupied"
      }
    ],
    "id": "CHENNAI88",
    "address": "OMR Road, Chennai, TN",
    "latitude": 13.0827,
    "longitude": 80.2707,
    "batteryLevel": 67.8,
    "maxCapacity": 22000,
    "meanPrice": 21.5,
    "availablePlugs": "CCS2 DC",
    "maxVoltage": 500
  },
  {
    "code": "HYDPLX09",
    "name": "DC Fast Charger 30kW",
    "no_of_connectors": 1,
    "location": {
      "city": "Hyderabad",
      "address": "Banjara Hills, Hyderabad, TS",
      "latitude": 17.3850,
      "longitude": 78.4867
    },
    "status": "offline",
    "pricing": {
      "time_based": {
        "rate": 3.5,
        "unit": "INR_per_min"
      },
      "energy_based": {
        "rate": 22.0,
        "unit": "INR_per_kWh"
      }
    },
    "connectors": [
      {
        "id": "C1",
        "type": "CCS2 DC",
        "power_kw": 30,
        "status": "offline"
      }
    ],
    "id": "HYDPLX09",
    "address": "Banjara Hills, Hyderabad, TS",
    "latitude": 17.3850,
    "longitude": 78.4867,
    "batteryLevel": 0,
    "maxCapacity": 30000,
    "meanPrice": 22.0,
    "availablePlugs": "CCS2 DC",
    "maxVoltage": 500
  },
  // Additional Bangalore stations for better coverage
  {
    "code": "BLRKOR56",
    "name": "7.4kW Charger",
    "no_of_connectors": 2,
    "location": {
      "city": "Bengaluru",
      "address": "Koramangala, Bengaluru, KA",
      "latitude": 12.9279,
      "longitude": 77.6271
    },
    "status": "active",
    "pricing": {
      "time_based": {
        "rate": 2.2,
        "unit": "INR_per_min"
      },
      "energy_based": {
        "rate": 18.5,
        "unit": "INR_per_kWh"
      }
    },
    "connectors": [
      {
        "id": "C1",
        "type": "Type-2 AC",
        "power_kw": 7.4,
        "status": "available"
      },
      {
        "id": "C2",
        "type": "Type-2 AC",
        "power_kw": 7.4,
        "status": "available"
      }
    ],
    "id": "BLRKOR56",
    "address": "Koramangala, Bengaluru, KA",
    "latitude": 12.9279,
    "longitude": 77.6271,
    "batteryLevel": 78.2,
    "maxCapacity": 7400,
    "meanPrice": 18.5,
    "availablePlugs": "Type-2 AC",
    "maxVoltage": 240
  }
];

export default stationsList;
