import React, { useState, useEffect, useRef } from 'react';
import QrScanner from 'qr-scanner';

function QRScanner({ onScan, loading, disabled }) {
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState(null);
  const [facingMode, setFacingMode] = useState('environment');
  const videoRef = useRef(null);
  const qrScannerRef = useRef(null);

  useEffect(() => {
    return () => {
      stopScanning();
    };
  }, []);

  const startScanning = async () => {
    try {
      setError(null);
      setIsScanning(true);

      if (qrScannerRef.current) {
        qrScannerRef.current.destroy();
      }

      const qrScanner = new QrScanner(
        videoRef.current,
        (result) => {
          if (result && result.data && !disabled) {
            console.log('QR Code detected:', result.data);
            onScan(result.data);
            // Optionally stop scanning after successful scan
            // stopScanning();
          }
        },
        {
          onDecodeError: (err) => {
            // Ignore decode errors as they're common during scanning
            console.log('Decode error (normal during scanning):', err);
          },
          preferredCamera: facingMode,
          highlightScanRegion: true,
          highlightCodeOutline: true,
          returnDetailedScanResult: true,
        }
      );

      qrScannerRef.current = qrScanner;
      await qrScanner.start();

    } catch (err) {
      console.error('Error starting QR scanner:', err);
      setError('Nie można uzyskać dostępu do kamery. Sprawdź uprawnienia.');
      setIsScanning(false);
    }
  };

  const stopScanning = () => {
    if (qrScannerRef.current) {
      qrScannerRef.current.destroy();
      qrScannerRef.current = null;
    }
    setIsScanning(false);
  };

  const toggleCamera = async () => {
    const newFacingMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(newFacingMode);
    
    if (qrScannerRef.current) {
      try {
        await qrScannerRef.current.setCamera(newFacingMode);
      } catch (err) {
        console.error('Error switching camera:', err);
        setError('Nie można przełączyć kamery');
      }
    }
  };

  useEffect(() => {
    if (isScanning) {
      startScanning();
    }
  }, [facingMode]);

  return (
    <div className="qr-scanner-container">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="relative">
        <video
          ref={videoRef}
          className="qr-scanner-video w-full h-64 object-cover rounded-lg"
          style={{ display: isScanning ? 'block' : 'none' }}
        />
        
        {!isScanning && (
          <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center">
            <p className="text-gray-500">Kamera nie jest aktywna</p>
          </div>
        )}

        {loading && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
            <div className="spinner border-4 border-gray-300 border-t-blue-500 rounded-full w-8 h-8 animate-spin"></div>
          </div>
        )}
      </div>

      <div className="flex gap-2 mt-4">
        <button
          onClick={isScanning ? stopScanning : startScanning}
          disabled={disabled}
          className={`flex-1 px-4 py-2 rounded-md font-medium transition-colors ${
            isScanning
              ? 'bg-red-600 text-white hover:bg-red-700'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {isScanning ? 'Zatrzymaj' : 'Uruchom skaner'}
        </button>

        {isScanning && (
          <button
            onClick={toggleCamera}
            disabled={disabled}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            📷
          </button>
        )}
      </div>

      <div className="mt-2 text-sm text-gray-600">
        <p>• Kamera: {facingMode === 'environment' ? 'Tylna' : 'Przednia'}</p>
        <p>• Skieruj kamerę na kod QR aby go zeskanować</p>
        <p>• Upewnij się, że kod QR jest dobrze oświetlony</p>
      </div>
    </div>
  );
}

export default QRScanner;