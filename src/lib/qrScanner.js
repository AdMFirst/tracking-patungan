import { Html5QrcodeScanner } from 'html5-qrcode';

let scanner = null;

export const startQrScanner = (onScanSuccess, onScanError) => {
  if (!scanner) {
    scanner = new Html5QrcodeScanner('qr-reader', { fps: 10, qrbox: 250 });
    scanner.render(onScanSuccess, onScanError);
  }
};

export const stopQrScanner = () => {
  if (scanner) {
    scanner.clear();
    scanner = null;
  }
};