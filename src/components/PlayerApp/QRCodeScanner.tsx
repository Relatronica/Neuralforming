import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { X } from 'lucide-react';
import { useGameCopy } from '../../lib/i18n/useGameCopy';

interface QRCodeScannerProps {
  onScanSuccess: (decodedText: string) => void;
  onClose: () => void;
}

export const QRCodeScanner: React.FC<QRCodeScannerProps> = ({ onScanSuccess, onClose }) => {
  const { t } = useGameCopy();
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const scannerId = 'qr-reader';

  useEffect(() => {
    const startScanner = async () => {
      try {
        const html5QrCode = new Html5Qrcode(scannerId);
        scannerRef.current = html5QrCode;

        // Configurazione ottimizzata per mobile
        // Calcola dimensioni ottimali per il qrbox
        const viewportWidth = Math.min(window.innerWidth - 64, 400);
        const qrboxSize = Math.min(Math.floor(viewportWidth * 0.7), 300);
        
        const config = {
          fps: 10, // Ridotto per stabilità
          qrbox: { width: qrboxSize, height: qrboxSize }, // Usa valori numerici invece di funzione
          aspectRatio: 1.0,
          // Rimuovi formatsToSupport per supportare tutti i formati (incluso QR_CODE)
          // formatsToSupport potrebbe causare problemi
          disableFlip: false, // Permette rotazione automatica
        };
        
        console.log('📐 QR box size calculated:', qrboxSize, 'px');

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

        console.log('📷 Starting QR scanner with config:', {
          qrbox: config.qrbox,
          fps: config.fps,
          cameraId: cameraId || 'default (environment)',
          scannerId: scannerId,
        });

        await html5QrCode.start(
          cameraId || { facingMode: 'environment' },
          config,
          (decodedText, decodedResult) => {
            // QR code decodificato con successo
            console.log('✅✅✅ QR Code scanned successfully:', {
              text: decodedText,
              textLength: decodedText?.length,
              format: decodedResult?.result?.format,
              timestamp: new Date().toISOString(),
              fullResult: decodedResult,
            });
            
            // Verifica che il testo decodificato non sia vuoto
            if (!decodedText || decodedText.trim().length === 0) {
              console.warn('⚠️ Empty QR code text, ignoring...');
              return;
            }
            
            console.log('📤 Calling onScanSuccess with:', decodedText);
            stopScanner();
            onScanSuccess(decodedText);
          },
          (errorMessage, error) => {
            // Log TUTTI gli errori per debug - potrebbero essere importanti
            if (errorMessage) {
              // Log anche NotFoundException per vedere se sta cercando
              console.log('🔍 Scanner error (this is normal during scanning):', {
                message: errorMessage,
                error: error,
                timestamp: new Date().toISOString(),
              });
            }
          }
        );

        setIsScanning(true);
        setError(null);
        console.log('✅ QR scanner started successfully');
      } catch (err: any) {
        console.error('Error starting QR scanner:', err);
        let errorMessage = t.qr.cameraFail;
        
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          errorMessage = t.qr.permissionDenied;
        } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
          errorMessage = t.qr.noCamera;
        } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
          errorMessage = t.qr.cameraInUse;
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
        console.log('🛑 Stopping QR scanner...');
        await scannerRef.current.stop();
        scannerRef.current.clear();
        setIsScanning(false);
        console.log('✅ QR scanner stopped');
      } catch (err) {
        console.error('❌ Error stopping scanner:', err);
        setIsScanning(false);
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
          <h2 className="text-xl font-bold text-gray-100">{t.qr.title}</h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            aria-label={t.common.close}
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
                {t.common.close}
              </button>
            </div>
          ) : (
            <>
              <div className="relative">
                <div
                  id={scannerId}
                  className="w-full rounded-lg overflow-hidden bg-gray-800"
                  style={{ minHeight: '300px' }}
                />
                {isScanning && (
                  <div className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 rounded text-xs font-semibold animate-pulse">
                    Scansione attiva...
                  </div>
                )}
              </div>
              <p className="text-sm text-gray-400 text-center mt-4">
                {isScanning 
                  ? 'Inquadra il QR code nella cornice per entrare automaticamente nella partita'
                  : 'Avvio scanner...'}
              </p>
              {isScanning && (
                <p className="text-xs text-gray-500 text-center mt-2">
                  Assicurati che il QR code sia ben illuminato e a fuoco
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
