import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Button from './Button';
import Input from './Input';
import Card from './Card';
import { 
  QrCodeIcon, 
  CameraIcon, 
  CheckCircleIcon,
  XMarkIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';

interface BarcodeScannerProps {
  onBarcodeScanned: (barcode: string) => void;
  onClose: () => void;
  isOpen: boolean;
}

const BarcodeScanner: React.FC<BarcodeScannerProps> = ({ 
  onBarcodeScanned, 
  onClose, 
  isOpen 
}) => {
  const [barcode, setBarcode] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const { t } = useTranslation();

  useEffect(() => {
    if (isOpen && isScanning) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isOpen, isScanning]);

  const startCamera = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment', // Use back camera
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
      }
    } catch (err) {
      setError('فشل في تشغيل الكاميرا. تأكد من السماح بالوصول للكاميرا.');
      setIsScanning(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const handleManualBarcode = () => {
    if (barcode.trim()) {
      onBarcodeScanned(barcode.trim());
      setBarcode('');
      onClose();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleManualBarcode();
    }
  };

  const simulateBarcodeScan = () => {
    // Simulate barcode scanning for development
    const mockBarcodes = [
      '1234567890123',
      '9876543210987',
      '5555666677778',
      '1111222233334'
    ];
    const randomBarcode = mockBarcodes[Math.floor(Math.random() * mockBarcodes.length)];
    onBarcodeScanned(randomBarcode);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              {t('barcode.scanBarcode')}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {isScanning ? (
            <div className="space-y-4">
              <div className="relative bg-gray-100 rounded-lg overflow-hidden">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full h-64 object-cover"
                />
                <div className="absolute inset-0 border-2 border-blue-500 border-dashed rounded-lg m-4">
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <QrCodeIcon className="h-12 w-12 text-blue-500 opacity-50" />
                  </div>
                </div>
              </div>
              
              {error && (
                <div className="text-red-600 text-sm text-center">
                  {error}
                </div>
              )}

              <div className="flex space-x-2">
                <Button
                  onClick={() => setIsScanning(false)}
                  variant="secondary"
                  className="flex-1"
                >
                  {t('common.cancel')}
                </Button>
                <Button
                  onClick={simulateBarcodeScan}
                  className="flex-1"
                >
                  {t('barcode.simulateScan')}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-center">
                <QrCodeIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">
                  {t('barcode.scanDescription')}
                </p>
              </div>

              <div className="space-y-3">
                <Button
                  onClick={() => setIsScanning(true)}
                  className="w-full flex items-center justify-center space-x-2"
                >
                  <CameraIcon className="h-5 w-5" />
                  <span>{t('barcode.startScanning')}</span>
                </Button>

                <div className="relative">
                  <Input
                    type="text"
                    placeholder={t('barcode.enterManually')}
                    value={barcode}
                    onChange={(e) => setBarcode(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="pr-10"
                  />
                  <button
                    onClick={handleManualBarcode}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <MagnifyingGlassIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {scanResult && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <CheckCircleIcon className="h-5 w-5 text-green-600" />
                <span className="text-green-800 font-medium">
                  {t('barcode.scanSuccessful')}
                </span>
              </div>
              <p className="text-green-700 text-sm mt-1">
                {t('barcode.barcode')}: {scanResult}
              </p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default BarcodeScanner;
