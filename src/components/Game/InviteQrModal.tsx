import { useState } from 'react';
import { QrCode, X, Copy, Check } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { buildPlayerJoinUrl } from '../../utils/deeplink';
import { useGameCopy } from '../../lib/i18n/useGameCopy';

export function InviteQrModal({
  roomId,
  onClose,
}: {
  roomId: string;
  onClose: () => void;
}) {
  const { t } = useGameCopy();
  const [copied, setCopied] = useState(false);
  const joinUrl = buildPlayerJoinUrl(roomId);

  const copyJoinUrl = () => {
    navigator.clipboard.writeText(joinUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-cyber-900 border border-white/10 rounded-2xl shadow-2xl p-6 max-w-sm w-full mx-4 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-200 transition-colors"
          aria-label={t.common.close}
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-4">
          <div className="flex items-center justify-center gap-2 mb-1">
            <QrCode className="w-5 h-5 text-tech-cyan" />
            <h3 className="text-lg font-heading font-bold text-gray-100">{t.invite.title}</h3>
          </div>
          <p className="text-xs text-gray-400">
            {t.invite.hint}
          </p>
        </div>

        <div className="flex justify-center mb-4">
          <div className="bg-white rounded-lg p-3">
            <QRCodeSVG
              value={joinUrl}
              size={180}
              bgColor="#ffffff"
              fgColor="#000000"
              includeMargin={true}
            />
          </div>
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={joinUrl}
            readOnly
            className="flex-1 px-3 py-2 border border-white/10 rounded-lg bg-cyber-800 font-mono text-xs text-gray-300 truncate"
          />
          <button
            onClick={copyJoinUrl}
            className="px-3 py-2 bg-cyber-800 hover:bg-cyber-700 rounded-lg transition-colors flex items-center gap-1.5 text-gray-200 text-xs whitespace-nowrap border border-white/10"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-tech-cyan" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? t.common.copied : t.common.copy}
          </button>
        </div>

        <p className="text-[10px] text-gray-500 text-center mt-3">
          {t.invite.footnote}
        </p>
      </div>
    </div>
  );
}
