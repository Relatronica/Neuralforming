import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { X } from 'lucide-react';

interface QRCodeScannerProps {
  onScanSuccess: (decodedText: string) => void;
  onClose: () => void;
}

export const QRCodeScanner: React.FC<QRCodeScannerProps> = ({ onScanSuccess, onClose }) => {
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
        const config = {
          fps: 30, // Aumentato per migliore responsività
          qrbox: (viewfinderWidth: number, viewfinderHeight: number) => {
            // Calcola dimensioni dinamiche basate sulla viewport
            const minEdgePercentage = 0.7; // 70% della dimensione minima
            const minEdgeSize = Math.min(viewfinderWidth, viewfinderHeight);
            const qrboxSize = Math.floor(minEdgeSize * minEdgePercentage);
            return {
              width: Math.min(qrboxSize, 300), // Max 300px
              height: Math.min(qrboxSize, 300),
            };
          },
          aspectRatio: 1.0,
          // Supporta formati multipli (soprattutto QR_CODE)
          formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
          // Migliora la qualità di scansione
          disableFlip: false, // Permette rotazione automatica
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

        console.log('📷 Starting QR scanner with config:', {
          qrboxSize: config.qrbox,
          fps: config.fps,
          cameraId: cameraId || 'default (environment)',
        });

        await html5QrCode.start(
          cameraId || { facingMode: 'environment' },
          config,
          (decodedText, decodedResult) => {
            // QR code decodificato con successo
            console.log('✅ QR Code scanned successfully:', {
              text: decodedText,
              format: decodedResult?.result?.format,
              timestamp: new Date().toISOString(),
            });
            
            // Verifica che il testo decodificato non sia vuoto
            if (!decodedText || decodedText.trim().length === 0) {
              console.warn('⚠️ Empty QR code text, ignoring...');
              return;
            }
            
            stopScanner();
            onScanSuccess(decodedText);
          },
          (errorMessage) => {
            // Log errori di scanning continuo per debug
            // Non mostrare all'utente (sono normali durante la scansione)
            if (errorMessage && !errorMessage.includes('NotFoundException')) {
              // Log solo errori non comuni
              console.debug('🔍 Scanning...', errorMessage);
            }
          }
        );

        setIsScanning(true);
        setError(null);
        console.log('✅ QR scanner started successfully');
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
