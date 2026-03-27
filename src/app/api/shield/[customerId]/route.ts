/**
 * Shield API Route
 * GET /api/shield/[customerId]
 * Gibt ein dynamisch generiertes JavaScript zurück das KI-Bilder auf der Kunden-Website kennzeichnet.
 * CORS: Access-Control-Allow-Origin: * (muss auf externen Websites laden)
 * Cache: 1 Stunde CDN-Cache
 */
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Service Role Client für serverless (kein Auth-Context nötig)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface ShieldSettings {
  enabled: boolean;
  badge_style: 'minimal' | 'standard' | 'detailed';
  badge_color: string;
  badge_position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

interface DetectedImage {
  image_url: string;
  ai_probability: number;
}

const CORS_HEADERS = {
  'Content-Type': 'application/javascript',
  'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ customerId: string }> }
) {
  const { customerId } = await params;

  // Inaktives Script zurückgeben bei ungültiger ID
  if (!customerId || customerId.length < 10) {
    return new NextResponse('/* Dataquard Shield: invalid id */', { headers: CORS_HEADERS });
  }

  try {
    // Shield-Einstellungen laden (nur wenn aktiviert)
    const { data: settings } = await supabaseAdmin
      .from('ai_shield_settings')
      .select('enabled, badge_style, badge_color, badge_position')
      .eq('user_id', customerId)
      .eq('enabled', true)
      .maybeSingle();

    if (!settings) {
      return new NextResponse('/* Dataquard Shield: inactive */', { headers: CORS_HEADERS });
    }

    // Erkannte KI-Bilder laden (nur gekennzeichnete)
    const { data: images } = await supabaseAdmin
      .from('ai_detected_images')
      .select('image_url, ai_probability')
      .eq('user_id', customerId)
      .eq('is_labeled', true)
      .order('ai_probability', { ascending: false })
      .limit(200);

    const js = generateShieldScript(images ?? [], settings as ShieldSettings);

    return new NextResponse(js, { headers: CORS_HEADERS });
  } catch (err) {
    console.error('[shield] Fehler:', err);
    return new NextResponse('/* Dataquard Shield: error */', { headers: CORS_HEADERS });
  }
}

function generateShieldScript(images: DetectedImage[], settings: ShieldSettings): string {
  // Nur die URLs serialisieren (keine Scores nötig im Client-Script)
  const urlList = JSON.stringify(images.map(i => i.image_url));
  const style = JSON.stringify(settings.badge_style);
  const color = JSON.stringify(settings.badge_color);
  const position = JSON.stringify(settings.badge_position);

  return `/* Dataquard AI-Trust Shield v1 | dataquard.ch */
(function(){
'use strict';
var imgs=${urlList};
var st=${style};
var col=${color};
var pos=${position};
var texts={minimal:'KI',standard:'KI-generiert \u2713',detailed:'KI-generiert \u2014 gepr\u00fcft nach EU AI Act Art.\u00a050'};
var posMap={'top-left':'top:8px;left:8px','top-right':'top:8px;right:8px','bottom-left':'bottom:8px;left:8px','bottom-right':'bottom:8px;right:8px'};
function closePopup(){var p=document.getElementById('dq-shield-popup');if(p)p.remove();}
function addBadge(img){
  if(img.parentElement&&img.parentElement.classList.contains('dq-sw'))return;
  var w=document.createElement('div');
  w.className='dq-sw';
  w.style.cssText='position:relative;display:inline-block;line-height:0;';
  img.parentElement.insertBefore(w,img);
  w.appendChild(img);
  var b=document.createElement('div');
  var isDetailed=st==='detailed';
  b.style.cssText='position:absolute;'+posMap[pos]+';background:'+col+';color:#fff;padding:'+(isDetailed?'5px 8px':'3px 8px')+';border-radius:4px;font-size:11px;font-family:Arial,sans-serif;cursor:pointer;z-index:10;opacity:0.92;line-height:1.3;max-width:'+(isDetailed?'180px':'auto')+';pointer-events:auto;';
  b.textContent=texts[st]||texts.standard;
  b.title='Gepr\u00fcft von Dataquard nach EU AI Act Art. 50';
  b.addEventListener('click',function(e){
    e.stopPropagation();
    if(document.getElementById('dq-shield-popup')){closePopup();return;}
    var ov=document.createElement('div');
    ov.id='dq-shield-popup';
    ov.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,0.4);z-index:99998;display:flex;align-items:center;justify-content:center;';
    ov.addEventListener('click',function(ev){if(ev.target===ov)closePopup();});
    var box=document.createElement('div');
    box.style.cssText='background:#fff;color:#1a1a2e;padding:28px 24px;border-radius:14px;box-shadow:0 8px 40px rgba(0,0,0,0.28);max-width:340px;width:90%;font-family:Arial,sans-serif;text-align:center;';
    box.innerHTML='<div style="font-weight:800;font-size:16px;margin-bottom:10px">\uD83E\uDD16 KI-generiertes Bild erkannt</div><p style="font-size:13px;color:#555;line-height:1.6;margin-bottom:14px">Dieses Bild wurde als KI-generiert erkannt und gem\u00e4ss EU AI Act Art.\u00a050 automatisch gekennzeichnet.</p><a href="https://www.dataquard.ch" target="_blank" rel="noopener" style="display:inline-block;background:#8B5CF6;color:#fff;padding:8px 18px;border-radius:8px;font-size:12px;font-weight:700;text-decoration:none;margin-bottom:14px">Gepr\u00fcft von Dataquard \u2192</a><br><button onclick="(function(){var p=document.getElementById(\'dq-shield-popup\');if(p)p.remove();})()" style="background:#f1f2f6;border:none;padding:6px 18px;border-radius:6px;cursor:pointer;font-size:12px;color:#555">Schliessen</button>';
    ov.appendChild(box);
    document.body.appendChild(ov);
  });
  w.appendChild(b);
}
function matchUrl(src,ref){
  try{
    var s=new URL(src).pathname;
    var r=new URL(ref).pathname;
    return s===r||src.indexOf(ref)!==-1||ref.indexOf(src)!==-1;
  }catch(e){return src.indexOf(ref)!==-1||ref.indexOf(src)!==-1;}
}
function init(){
  var allImgs=document.querySelectorAll('img');
  allImgs.forEach(function(img){
    var src=img.src||img.getAttribute('data-src')||img.getAttribute('data-lazy-src')||'';
    if(!src)return;
    for(var i=0;i<imgs.length;i++){
      if(matchUrl(src,imgs[i])){addBadge(img);break;}
    }
  });
}
if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',init);}
else{init();}
})();`;
}
