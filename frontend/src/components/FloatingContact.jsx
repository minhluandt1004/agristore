import { MapPin, Phone, MessageCircle } from "lucide-react";

export default function FloatingContact() {
  return (
    <>
      <style>{`
        .floating {
          position: fixed;
          right: 20px;
          top: 50%;
          transform: translateY(-50%);
          z-index: 999;

          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        /* ===== ITEM WRAPPER ===== */
        .item {
          position: relative;
          display: flex;
          justify-content: flex-end;
          align-items: center;
        }

        /* ===== ICON STYLE (có shadow nhưng mềm) ===== */
        .icon {
          width: 50px;
          height: 50px;
          border-radius: 9999px;

          display: flex;
          align-items: center;
          justify-content: center;

          background: rgba(255,255,255,0.85);
          backdrop-filter: blur(10px);

          box-shadow: 0 8px 20px rgba(0,0,0,0.12);

          transition: 0.25s;
        }

        .icon:hover {
          transform: scale(1.08);
          box-shadow: 0 12px 25px rgba(0,0,0,0.18);
        }

        /* ZALO */
        .zalo {
          background: rgba(37, 99, 235, 0.95);
          color: white;
        }

        /* ===== TOOLTIP ===== */
        .tooltip {
          position: absolute;
          right: 100%;
          margin-right: 10px;

          background: rgba(0,0,0,0.75);
          color: white;
          font-size: 12px;

          padding: 4px 8px;
          border-radius: 8px;

          opacity: 0;
          transform: translateX(6px);
          transition: 0.2s;

          white-space: nowrap;
        }

        .item:hover .tooltip {
          opacity: 1;
          transform: translateX(0);
        }

        /* ===== FLOAT NHẸ (LUÔN HOẠT ĐỘNG) ===== */
        @keyframes floatDownUp {
          0%   { transform: translateY(0px); }
          50%  { transform: translateY(-6px); }
          100% { transform: translateY(0px); }
        }

        .float1 {
          animation: floatDownUp 4.5s ease-in-out infinite;
        }

        .float2 {
          animation: floatDownUp 5s ease-in-out infinite;
        }

        .float3 {
          animation: floatDownUp 5.5s ease-in-out infinite;
        }

        /* ===== NHẸ HIỆU ỨNG “TRÔI XUỐNG” KHI LOAD ===== */
        @keyframes fadeSlide {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .floating {
          animation: fadeSlide 0.8s ease-out;
        }
      `}</style>

      <div className="floating">

        {/* VỊ TRÍ */}
        <div className="item float1">
          <a href="https://maps.google.com" target="_blank" className="icon">
            <MapPin color="#16a34a" />
          </a>
          <span className="tooltip">Vị trí cửa hàng</span>
        </div>

        {/* ĐIỆN THOẠI */}
        <div className="item float2">
          <a href="tel:0971017575" className="icon">
            <Phone color="#2563eb" />
          </a>
          <span className="tooltip">Gọi ngay</span>
        </div>

        {/* ZALO */}
        <div className="item float3">
          <a href="https://zalo.me/0971017575" target="_blank" className="icon zalo">
            <MessageCircle />
          </a>
          <span className="tooltip">Chat Zalo</span>
        </div>

      </div>
    </>
  );
}