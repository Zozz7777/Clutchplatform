const mongoose = require('../shims/mongoose');

const obd2DeviceSchema = new mongoose.Schema({
    vehicleId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vehicle',
        required: true
    },
    provider: {
        type: String,
        enum: ['automatic', 'obdlink', 'bluedriver', 'custom'],
        required: true
    },
    deviceId: {
        type: String,
        required: true,
        unique: true
    },
    connectionType: {
        type: String,
        enum: ['bluetooth', 'wifi', 'usb'],
        required: true
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'error'],
        default: 'active'
    },
    lastSync: {
        type: Date,
        default: Date.now
    },
    settings: {
        updateInterval: {
            type: Number,
            default: 5 // seconds
        },
        dataPoints: [{
            type: String,
            enum: ['engineRPM', 'speed', 'fuelLevel', 'engineTemp', 'batteryVoltage', 'throttlePosition', 'intakeAirTemp', 'coolantTemp', 'oilPressure', 'transmissionTemp', 'fuelPressure', 'intakeManifoldPressure', 'timingAdvance', 'fuelTrim', 'oxygenSensor', 'catalyticConverterTemp', 'evapSystemPressure', 'absStatus', 'tractionControlStatus', 'stabilityControlStatus', 'tirePressure']
        }]
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('OBD2Device', obd2DeviceSchema);
