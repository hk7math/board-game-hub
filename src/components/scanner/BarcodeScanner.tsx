import { useState, useRef, useCallback, useEffect } from 'react';
import Quagga from '@ericblade/quagga2';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, X, Flashlight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BarcodeScannerProps {
  onDetected: (code: string) => void;
  onClose: () => void;
}

export function BarcodeScanner({ onDetected, onClose }: BarcodeScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scannerRef = useRef<HTMLDivElement>(null);

  const startScanner = useCallback(() => {
    if (!scannerRef.current) return;

    Quagga.init(
      {
        inputStream: {
          type: 'LiveStream',
          target: scannerRef.current,
          constraints: {
            facingMode: 'environment',
            width: { min: 640 },
            height: { min: 480 },
          },
        },
        decoder: {
          readers: [
            'ean_reader',
            'ean_8_reader',
            'upc_reader',
            'upc_e_reader',
          ],
        },
        locate: true,
        locator: {
          patchSize: 'medium',
          halfSample: true,
        },
      },
      (err) => {
        if (err) {
          console.error('Quagga init error:', err);
          setError('無法啟動相機，請確認已授權相機權限');
          return;
        }
        Quagga.start();
        setIsScanning(true);
      }
    );

    Quagga.onDetected((result) => {
      if (result.codeResult.code) {
        // Play a beep sound
        const audio = new Audio('data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU');
        audio.play().catch(() => {});
        
        Quagga.stop();
        setIsScanning(false);
        onDetected(result.codeResult.code);
      }
    });
  }, [onDetected]);

  const stopScanner = useCallback(() => {
    Quagga.stop();
    setIsScanning(false);
  }, []);

  useEffect(() => {
    startScanner();
    return () => {
      stopScanner();
    };
  }, [startScanner, stopScanner]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-foreground"
      >
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-4 safe-top">
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-10 w-10 rounded-full bg-background/20 text-background hover:bg-background/30"
          >
            <X className="w-5 h-5" />
          </Button>
          <span className="text-background font-medium">掃描條碼</span>
          <div className="w-10" />
        </div>

        {/* Scanner viewport */}
        <div ref={scannerRef} className="w-full h-full">
          {/* Scanning overlay */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="relative w-64 h-40">
              {/* Corner brackets */}
              <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-orange-warm rounded-tl-lg" />
              <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-orange-warm rounded-tr-lg" />
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-orange-warm rounded-bl-lg" />
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-orange-warm rounded-br-lg" />
              
              {/* Scanning line animation */}
              {isScanning && (
                <motion.div
                  initial={{ top: 0 }}
                  animate={{ top: '100%' }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatType: 'reverse',
                    ease: 'easeInOut',
                  }}
                  className="absolute left-2 right-2 h-0.5 bg-orange-warm shadow-[0_0_10px_hsl(var(--orange-warm))]"
                />
              )}
            </div>
          </div>

          {/* Dark overlay around scanner area */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-0 bg-foreground/60" style={{
              clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%, 0 0, calc(50% - 128px) calc(50% - 80px), calc(50% - 128px) calc(50% + 80px), calc(50% + 128px) calc(50% + 80px), calc(50% + 128px) calc(50% - 80px), calc(50% - 128px) calc(50% - 80px))'
            }} />
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="absolute bottom-24 left-4 right-4 p-4 bg-destructive/90 rounded-xl text-destructive-foreground text-center">
            {error}
          </div>
        )}

        {/* Instructions */}
        <div className="absolute bottom-0 left-0 right-0 p-6 safe-bottom text-center">
          <p className="text-background/80 text-sm">
            將桌遊盒上的條碼對準掃描框
          </p>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
