import React from 'react';

interface CompanyWatermarkLogoProps {
  id?: string;
  name?: string;
  className?: string;
}

export const CompanyWatermarkLogo: React.FC<CompanyWatermarkLogoProps> = ({
  id = '',
  name = '',
  className = 'w-full h-full',
}) => {
  const identifier = (id + ' ' + name).toLowerCase();

  // 1. Google (Official 4-Color G Logo)
  if (identifier.includes('goog')) {
    return (
      <div
        className={`w-full h-full flex items-center justify-center transition-all duration-500 ease-out opacity-[0.09] sm:opacity-[0.11] group-hover:opacity-[0.24] group-hover:scale-[1.05] animate-watermark-google group-hover:drop-shadow-[0_0_12px_rgba(66,133,244,0.45)]`}
      >
        <svg
          viewBox="0 0 24 24"
          className={className}
          aria-hidden="true"
        >
          {/* Blue */}
          <path
            fill="#4285F4"
            d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
          />
          {/* Green */}
          <path
            fill="#34A853"
            d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.24v3.15C3.26 21.36 7.33 24 12 24z"
          />
          {/* Yellow */}
          <path
            fill="#FBBC05"
            d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.14-1.55.38-2.27V6.58H1.24C.45 8.16 0 9.97 0 12s.45 3.84 1.24 5.42l4.04-3.15z"
          />
          {/* Red */}
          <path
            fill="#EA4335"
            d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.24 6.58l4.04 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
          />
        </svg>
      </div>
    );
  }

  // 2. Microsoft (Official 4-Color Grid)
  if (identifier.includes('msft') || identifier.includes('microsoft')) {
    return (
      <div
        className={`w-full h-full flex items-center justify-center transition-all duration-500 ease-out opacity-[0.09] sm:opacity-[0.11] group-hover:opacity-[0.23] group-hover:scale-[1.05] animate-watermark-msft group-hover:drop-shadow-[0_0_10px_rgba(0,164,239,0.40)]`}
      >
        <svg
          viewBox="0 0 24 24"
          className={className}
          aria-hidden="true"
        >
          <rect x="1.5" y="1.5" width="9.8" height="9.8" fill="#F25022" rx="0.5" />
          <rect x="12.7" y="1.5" width="9.8" height="9.8" fill="#7FBA00" rx="0.5" />
          <rect x="1.5" y="12.7" width="9.8" height="9.8" fill="#00A4EF" rx="0.5" />
          <rect x="12.7" y="12.7" width="9.8" height="9.8" fill="#FFB900" rx="0.5" />
        </svg>
      </div>
    );
  }

  // 3. Amazon (Official Squid Ink + Amazon Orange Smile Logo)
  if (identifier.includes('amzn') || identifier.includes('amazon')) {
    return (
      <div
        className={`w-full h-full flex items-center justify-center transition-all duration-500 ease-out opacity-[0.09] sm:opacity-[0.11] group-hover:opacity-[0.24] group-hover:scale-[1.05] animate-watermark-amzn group-hover:drop-shadow-[0_0_12px_rgba(255,153,0,0.45)]`}
      >
        <svg
          viewBox="0 0 54 36"
          className={className}
          aria-hidden="true"
        >
          {/* Classic Amazon 'a' in Squid Ink #232F3E */}
          <path
            fill="#232F3E"
            d="M23.5 8.5c-4.6 0-8.2 3.1-8.2 8.1 0 4.1 2.6 6.8 6.2 6.8 2.2 0 3.8-1 4.8-2.4v2h3.9V8.9h-3.9v2.1c-1.1-1.4-2.7-2.5-4.8-2.5zm.3 3.1c2.6 0 4.5 2.1 4.5 5.3s-2 5.3-4.5 5.3-4.5-2.1-4.5-5.3 1.9-5.3 4.5-5.3z"
          />
          {/* Iconic Smile Arrow in Amazon Orange #FF9900 */}
          <path
            fill="#FF9900"
            d="M4.5 25.8c12.5 7.1 27.5 7.3 39.5.6.7-.4 1.4.4.8 1.1-12.8 8.2-28.8 8-41.2-.7-.7-.7 0-1.6.9-1z"
          />
          <path
            fill="#FF9900"
            d="M44.2 24.3c.9-.8 4.2-.4 4.7.2.4.4-.3 3.9-1.1 4.7-.4.4-1 .2-.8-.3.4-1.7 1.3-2.8 2.2-3.9-1 .2-2.8.8-4.1.2-.7-.3-.3-.9.9-.9z"
          />
        </svg>
      </div>
    );
  }

  // 4. Cisco (Official 9-Bar Bridge Cyan + Cisco Navy)
  if (identifier.includes('csco') || identifier.includes('cscco') || identifier.includes('cisco')) {
    return (
      <div
        className={`w-full h-full flex items-center justify-center transition-all duration-500 ease-out opacity-[0.09] sm:opacity-[0.11] group-hover:opacity-[0.23] group-hover:scale-[1.05] animate-watermark-cisco group-hover:drop-shadow-[0_0_10px_rgba(4,159,217,0.42)]`}
      >
        <svg
          viewBox="0 0 44 32"
          className={className}
          aria-hidden="true"
        >
          {/* 9 Bridge Bars in Cisco Cyan #049FD9 */}
          <line x1="4" y1="12" x2="4" y2="20" stroke="#049FD9" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="8.5" y1="7.5" x2="8.5" y2="20" stroke="#049FD9" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="13" y1="3.5" x2="13" y2="20" stroke="#049FD9" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="17.5" y1="7.5" x2="17.5" y2="20" stroke="#049FD9" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="22" y1="12" x2="22" y2="20" stroke="#049FD9" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="26.5" y1="7.5" x2="26.5" y2="20" stroke="#049FD9" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="31" y1="3.5" x2="31" y2="20" stroke="#049FD9" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="35.5" y1="7.5" x2="35.5" y2="20" stroke="#049FD9" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="40" y1="12" x2="40" y2="20" stroke="#049FD9" strokeWidth="2.5" strokeLinecap="round" />
          {/* Cisco Corporate Navy #005073 Wordmark */}
          <text
            x="22"
            y="29"
            fontFamily="system-ui, -apple-system, sans-serif"
            fontSize="7"
            fontWeight="800"
            textAnchor="middle"
            fill="#005073"
            letterSpacing="1.2"
          >
            CISCO
          </text>
        </svg>
      </div>
    );
  }

  // 5. Oracle (Official Oracle Red Racetrack + Brand Wordmark)
  if (identifier.includes('orcl') || identifier.includes('oracle')) {
    return (
      <div
        className={`w-full h-full flex items-center justify-center transition-all duration-500 ease-out opacity-[0.09] sm:opacity-[0.11] group-hover:opacity-[0.24] group-hover:scale-[1.05] animate-watermark-oracle group-hover:drop-shadow-[0_0_11px_rgba(199,70,52,0.40)]`}
      >
        <svg
          viewBox="0 0 50 26"
          className={className}
          aria-hidden="true"
        >
          <rect
            x="2.5"
            y="3.5"
            width="45"
            height="19"
            rx="9.5"
            fill="none"
            stroke="#C74634"
            strokeWidth="3.6"
          />
          <text
            x="25"
            y="15.8"
            fontFamily="system-ui, -apple-system, sans-serif"
            fontSize="7"
            fontWeight="900"
            textAnchor="middle"
            fill="#C74634"
            letterSpacing="1"
          >
            ORACLE
          </text>
        </svg>
      </div>
    );
  }

  // 6. Goldman Sachs (Official GS Signature Blue Box Logo)
  if (identifier.includes('gs') || identifier.includes('goldman')) {
    return (
      <div
        className={`w-full h-full flex items-center justify-center transition-all duration-500 ease-out opacity-[0.09] sm:opacity-[0.11] group-hover:opacity-[0.23] group-hover:scale-[1.05] animate-watermark-gs group-hover:drop-shadow-[0_0_10px_rgba(115,153,198,0.42)]`}
      >
        <svg
          viewBox="0 0 46 38"
          className={className}
          aria-hidden="true"
        >
          <rect
            x="1.5"
            y="1.5"
            width="43"
            height="35"
            rx="4"
            fill="#7399C6"
            fillOpacity="0.25"
            stroke="#7399C6"
            strokeWidth="2"
          />
          <text
            x="23"
            y="17"
            fontFamily="Georgia, serif"
            fontSize="7.5"
            fontWeight="bold"
            textAnchor="middle"
            fill="#214374"
            letterSpacing="0.4"
          >
            Goldman
          </text>
          <text
            x="23"
            y="27.5"
            fontFamily="Georgia, serif"
            fontSize="7.5"
            fontWeight="bold"
            textAnchor="middle"
            fill="#214374"
            letterSpacing="0.4"
          >
            Sachs
          </text>
        </svg>
      </div>
    );
  }

  // 7. TCS Digital (Official Corporate Blue & Gradient Accent)
  if (identifier.includes('tcs')) {
    return (
      <div
        className={`w-full h-full flex items-center justify-center transition-all duration-500 ease-out opacity-[0.09] sm:opacity-[0.11] group-hover:opacity-[0.24] group-hover:scale-[1.05] animate-watermark-tcs group-hover:drop-shadow-[0_0_11px_rgba(0,118,206,0.42)]`}
      >
        <svg
          viewBox="0 0 54 30"
          className={className}
          aria-hidden="true"
        >
          <text
            x="27"
            y="17"
            fontFamily="system-ui, -apple-system, sans-serif"
            fontSize="13"
            fontWeight="900"
            textAnchor="middle"
            fill="#0076CE"
            letterSpacing="0.8"
          >
            tcs
          </text>
          <path d="M12 22h30" stroke="url(#tcs-grad-logo)" strokeWidth="2.2" strokeLinecap="round" />
          <text
            x="27"
            y="27.5"
            fontFamily="system-ui, -apple-system, sans-serif"
            fontSize="4.2"
            fontWeight="800"
            textAnchor="middle"
            fill="#E81A5D"
            letterSpacing="1.8"
          >
            DIGITAL
          </text>
          <defs>
            <linearGradient id="tcs-grad-logo" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#0076CE" />
              <stop offset="50%" stopColor="#84329B" />
              <stop offset="100%" stopColor="#E81A5D" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    );
  }

  // 8. Infosys SP (Official Infosys Blue Logo)
  if (identifier.includes('infy') || identifier.includes('infosys')) {
    return (
      <div
        className={`w-full h-full flex items-center justify-center transition-all duration-500 ease-out opacity-[0.09] sm:opacity-[0.11] group-hover:opacity-[0.24] group-hover:scale-[1.05] animate-watermark-infy group-hover:drop-shadow-[0_0_11px_rgba(0,124,195,0.42)]`}
      >
        <svg
          viewBox="0 0 54 28"
          className={className}
          aria-hidden="true"
        >
          <text
            x="27"
            y="16"
            fontFamily="system-ui, -apple-system, sans-serif"
            fontSize="11.5"
            fontWeight="700"
            textAnchor="middle"
            fill="#007CC3"
            letterSpacing="0.5"
          >
            infosys
          </text>
          <circle cx="8" cy="6.5" r="1.4" fill="#007CC3" />
          <circle cx="28.5" cy="6.5" r="1.4" fill="#007CC3" />
          <rect x="17" y="20.5" width="20" height="5.5" rx="2.7" fill="#007CC3" fillOpacity="0.18" />
          <text
            x="27"
            y="24.8"
            fontFamily="system-ui, -apple-system, sans-serif"
            fontSize="3.8"
            fontWeight="800"
            textAnchor="middle"
            fill="#007CC3"
            letterSpacing="1"
          >
            SPRINGBOARD
          </text>
        </svg>
      </div>
    );
  }

  // Generic fallback geometric emblem with gentle floating
  return (
    <div
      className={`w-full h-full flex items-center justify-center transition-all duration-500 ease-out opacity-[0.08] group-hover:opacity-[0.20] group-hover:scale-[1.05] animate-watermark-google`}
    >
      <svg
        viewBox="0 0 24 24"
        className={className}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
      </svg>
    </div>
  );
};
