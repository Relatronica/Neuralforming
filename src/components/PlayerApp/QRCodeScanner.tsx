import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { X } from 'lucide-react';

interface QRCodeScannerProps {
  onScanSuccess: (decodedText: string) => void;
  onClose: () => void;
}

export const QRCodeScanner: React.FC<QRCodeScannerProps> = ({ onScanSuccess, onClose }) => {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [error, setError] = useState<string | null>(null);
  const scannerId = 'qr-reader';

  useEffect(() => {
    const startScanner = async () => {
      try {
        const html5QrCode = new Html5Qrcode(scannerId);
        scannerRef.current = html5QrCode;

        // Configurazione per mobile (fotocamera posteriore)
        const config = {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        };

        // Prova prima con la fotocamera posteriore (environment)
        // Se non disponibile, usa quella frontale (user)
        let cameraId: string | undefined;
        try {
          const devices = await Html5Qrcode.getCameras();
          // Cerca prima la fotocamera posteriore
          const backCamera = devices.find(device => 
            device.label.toLowerCase().includes('back') || 
            device.label.toLowerCase().includes('rear') ||
            device.label.toLowerCase().includes('environment')
          );
          cameraId = backCamera?.id || devices[0]?.id;
        } catch (err) {
          console.warn('Could not enumerate cameras, using default:', err);
        }

        await html5QrCode.start(
          cameraId || { facingMode: 'environment' },
          config,
          (decodedText) => {
            // QR code decodificato con successo
            console.log('✅ QR Code scanned:', decodedText);
            stopScanner();
            onScanSuccess(decodedText);
          },
          () => {
            // Ignora errori di scanning continuo (non è un errore critico)
            // Solo log per debug, non mostrare all'utente
          }
        );

        setError(null);
      } catch (err: any) {
        console.error('Error starting QR scanner:', err);
        let errorMessage = 'Impossibile accedere alla fotocamera.';
        
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          errorMessage = 'Permesso fotocamera negato. Abilita i permessi nelle impostazioni del browser.';
        } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
          errorMessage = 'Nessuna fotocamera trovata sul dispositivo.';
        } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
          errorMessage = 'La fotocamera è già in uso da un\'altra applicazione.';
        } else if (err.message) {
          errorMessage = err.message;
        }
        
        setError(errorMessage);
      }
    };

    startScanner();

    // Cleanup quando il componente viene smontato
    return () => {
      stopScanner();
    };
  }, [onScanSuccess]);

  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
      } catch (err) {
        console.error('Error stopping scanner:', err);
      }
      scannerRef.current = null;
    }
  };

  const handleClose = () => {
    stopScanner();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-xl shadow-2xl max-w-md w-full border border-gray-700 relative">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h2 className="text-xl font-bold text-gray-100">Scansiona QR Code</h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            aria-label="Chiudi"
          >
            <X className="w-6 h-6 text-gray-300" />
          </button>
        </div>

        {/* Scanner Area */}
        <div className="p-4">
          {error ? (
            <div className="text-center py-8">
              <p className="text-red-400 mb-4">{error}</p>
              <button
                onClick={handleClose}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors"
              >
                Chiudi
              </button>
            </div>
          ) : (
            <>
              <div
                id={scannerId}
                className="w-full rounded-lg overflow-hidden bg-gray-800"
                style={{ minHeight: '300px' }}
              />
              <p className="text-sm text-gray-400 text-center mt-4">
                Inquadra il QR code per entrare automaticamente nella partita
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
