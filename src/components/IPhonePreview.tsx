'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

export function IPhonePreview() {
  const [data, setData] = useState<{
    date: string;
    intro: string;
    toc: string[];
    thumbnail_url: string;
    writers: string;
  } | null>(null);

  useEffect(() => {
    fetch('/api/newsletters?limit=1')
      .then(r => r.json())
      .then(res => {
        if (res.data?.[0]) {
          const nl = res.data[0];
          setData({
            date: nl.date || 'February 12, 2026',
            intro: nl.intro || '',
            toc: nl.toc || [],
            thumbnail_url: nl.thumbnail_url || '/thumbnails/feb12-1.png',
            writers: nl.writers || 'The Thorium Valley crew',
          });
        }
      })
      .catch(console.error);
  }, []);

  // Strip greeting from intro if present
  const introText = data?.intro?.replace(/^(Good Morning Thorium Valley[,.]|Welcome back[^,.]*[,.])\s*/i, '') || '';

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <style dangerouslySetInnerHTML={{
        __html: `
        .ip-frame {
          width: 340px;
          height: 720px;
          background: linear-gradient(145deg, #2a2a2e 0%, #1c1c1e 50%, #141416 100%);
          border-radius: 52px;
          position: relative;
          box-shadow:
            0 40px 80px rgba(0,0,0,0.5),
            0 20px 40px rgba(0,0,0,0.3),
            inset 0 1px 2px rgba(255,255,255,0.08),
            inset 0 -1px 4px rgba(0,0,0,0.3);
          overflow: visible;
          flex-shrink: 0;
        }
        .ip-frame::before {
          content: '';
          position: absolute;
          right: -3px;
          top: 180px;
          width: 3px;
          height: 80px;
          background: linear-gradient(to bottom, #3a3a3c, #2c2c2e);
          border-radius: 0 2px 2px 0;
        }
        .ip-frame::after {
          content: '';
          position: absolute;
          left: -3px;
          top: 150px;
          width: 3px;
          height: 34px;
          background: linear-gradient(to bottom, #3a3a3c, #2c2c2e);
          border-radius: 2px 0 0 2px;
          box-shadow: 0 44px 0 0 #3a3a3c;
        }
        .ip-scr {
          position: absolute;
          top: 8px; left: 8px; right: 8px; bottom: 8px;
          background: #fff;
          border-radius: 46px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }
        .ip-di {
          position: absolute;
          top: 14px;
          left: 50%;
          transform: translateX(-50%);
          width: 120px;
          height: 34px;
          background: #000;
          border-radius: 20px;
          z-index: 30;
        }
        .ip-sb {
          height: 54px;
          background: #f6f6f6;
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          padding: 0 28px 8px;
          font-family: -apple-system, 'SF Pro Text', system-ui, sans-serif;
          font-size: 15px;
          font-weight: 600;
          color: #000;
          position: relative;
          z-index: 20;
          flex-shrink: 0;
        }
        .ip-sb-r { display: flex; gap: 5px; align-items: center; }
        .ip-sig { display: flex; gap: 1.5px; align-items: flex-end; height: 11px; }
        .ip-sig div { width: 3px; background: #000; border-radius: 1px; }
        .ip-sig div:nth-child(1) { height: 4px; }
        .ip-sig div:nth-child(2) { height: 6px; }
        .ip-sig div:nth-child(3) { height: 9px; }
        .ip-sig div:nth-child(4) { height: 11px; }
        .ip-bat {
          width: 25px; height: 12px;
          border: 1.5px solid #000;
          border-radius: 3px;
          position: relative;
          display: flex; align-items: center; padding: 1.5px;
        }
        .ip-bat::after {
          content: '';
          position: absolute; right: -4px; top: 50%;
          transform: translateY(-50%);
          width: 2px; height: 5px;
          background: #000;
          border-radius: 0 1px 1px 0;
        }
        .ip-bat-f { width: 70%; height: 100%; background: #000; border-radius: 1px; }

        /* Mail chrome */
        .ip-mn {
          height: 44px;
          background: #f6f6f6;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 14px;
          flex-shrink: 0;
          font-family: -apple-system, 'SF Pro Text', system-ui, sans-serif;
        }
        .ip-bk { color: #007aff; font-size: 26px; font-weight: 300; line-height: 1; }
        .ip-mi { display: flex; gap: 18px; align-items: center; }
        .ip-mi span { color: #007aff; font-size: 17px; }

        /* Sender */
        .ip-snd {
          padding: 12px 16px 4px;
          background: #fff;
          font-family: -apple-system, 'SF Pro Text', system-ui, sans-serif;
          border-bottom: 0.5px solid #e5e5e5;
        }
        .ip-snd-r { display: flex; align-items: center; gap: 10px; }
        .ip-av {
          width: 38px; height: 38px;
          border-radius: 50%;
          background: #1b1b1b;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
          overflow: hidden;
        }
        .ip-av-t { color: #fff; font-size: 14px; font-weight: 700; }
        .ip-sn { font-size: 15px; font-weight: 600; color: #000; }
        .ip-sm { font-size: 12px; color: #8e8e93; }
        .ip-un { margin-left: auto; font-size: 12px; color: #8e8e93; }
        .ip-tm { font-size: 13px; color: #8e8e93; margin-left: 48px; padding-bottom: 8px; }

        /* Actions */
        .ip-act {
          display: flex; justify-content: center; gap: 20px;
          padding: 8px 16px;
          background: #fff;
        }
        .ip-act span { color: #007aff; font-size: 18px; }

        /* Content */
        .ip-cnt {
          flex: 1;
          overflow-y: auto;
          background: #fff;
          font-family: -apple-system, 'SF Pro Text', system-ui, sans-serif;
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .ip-cnt::-webkit-scrollbar { display: none; }
        .ip-dl {
          text-align: center;
          padding: 16px 16px 14px;
          font-size: 13px;
          color: #8e8e93;
        }
        .ip-dl a { color: #007aff; text-decoration: none; }
        .ip-hi {
          width: calc(100% - 32px);
          margin: 0 auto 16px;
          border-radius: 6px;
          overflow: hidden;
          position: relative;
          aspect-ratio: 16/9;
        }
        .ip-bd {
          padding: 0 16px 20px;
          font-size: 14.5px;
          line-height: 1.6;
          color: #1b1b1b;
        }
        .ip-bd p { margin-bottom: 14px; }
        .ip-bd strong { font-weight: 700; }

        /* Bottom */
        .ip-bt {
          height: 48px;
          background: #f6f6f6;
          border-top: 0.5px solid #d1d1d6;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .ip-rb {
          display: flex; align-items: center; gap: 4px;
          padding: 6px 18px;
          font-size: 15px;
          color: #007aff;
          font-family: -apple-system, 'SF Pro Text', system-ui, sans-serif;
          border-right: 0.5px solid #d1d1d6;
        }
        .ip-rb:last-child { border-right: none; }
        .ip-hm {
          height: 22px;
          background: #f6f6f6;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .ip-hm-b {
          width: 134px; height: 5px;
          background: #000;
          border-radius: 3px;
          opacity: 0.18;
        }
      `}} />

      <div className="ip-frame">
        <div className="ip-di" />
        <div className="ip-scr">
          {/* Status Bar */}
          <div className="ip-sb">
            <span>5:25</span>
            <div className="ip-sb-r">
              <div className="ip-sig"><div /><div /><div /><div /></div>
              <svg width="15" height="12" viewBox="0 0 15 12" fill="none"><path d="M7.5 3.6C9.4 3.6 11.1 4.3 12.4 5.5L13.8 4.1C12.1 2.5 9.9 1.5 7.5 1.5S2.9 2.5 1.2 4.1L2.6 5.5C3.9 4.3 5.6 3.6 7.5 3.6Z" fill="black" /><path d="M7.5 6.8C8.7 6.8 9.8 7.3 10.6 8L12 6.6C10.8 5.5 9.2 4.8 7.5 4.8S4.2 5.5 3 6.6L4.4 8C5.2 7.3 6.3 6.8 7.5 6.8Z" fill="black" /><circle cx="7.5" cy="10.5" r="1.5" fill="black" /></svg>
              <div className="ip-bat"><div className="ip-bat-f" /></div>
            </div>
          </div>

          {/* Mail nav */}
          <div className="ip-mn">
            <span className="ip-bk">‹</span>
            <div className="ip-mi">
              <span>✦</span><span>⬇</span><span>🗑</span><span>📂</span><span>⋯</span>
            </div>
          </div>

          {/* Sender */}
          <div className="ip-snd">
            <div className="ip-snd-r">
              <div className="ip-av"><span className="ip-av-t">TV</span></div>
              <div>
                <div className="ip-sn">Thorium Valley</div>
                <div className="ip-sm">5:25 AM</div>
              </div>
              <span className="ip-un">Unsubscribe &nbsp;⋯</span>
            </div>
            <div className="ip-tm">to me</div>
          </div>

          {/* Actions */}
          <div className="ip-act">
            <span>✦</span><span>⬇</span><span>🗑</span><span>📂</span><span>⋯</span>
          </div>

          {/* Content */}
          <div className="ip-cnt">
            <div className="ip-dl">
              {data?.date || 'February 12, 2026'} &nbsp;|&nbsp; <a href="#">Read Online</a>
            </div>

            {data?.thumbnail_url && (
              <div className="ip-hi">
                <Image src={data.thumbnail_url} alt="Newsletter" fill style={{ objectFit: 'cover' }} />
              </div>
            )}

            <div className="ip-bd">
              <p>
                <strong>Good Morning Thorium Valley.</strong> {introText.slice(0, 350)}
              </p>
            </div>
          </div>

          {/* Bottom */}
          <div className="ip-bt">
            <div className="ip-rb">↩ Reply</div>
            <div className="ip-rb">↪ Forward</div>
            <div className="ip-rb" style={{ fontSize: '18px', padding: '6px 10px' }}>☺</div>
          </div>
          <div className="ip-hm"><div className="ip-hm-b" /></div>
        </div>
      </div>
    </div>
  );
}
