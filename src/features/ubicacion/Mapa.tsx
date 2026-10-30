import { useEffect, useRef, useState } from 'react';
import { WebView } from 'react-native-webview';
import { crearDocumentoMapa } from './documento';
import { leerMensajeMapa } from './domain';
import type { PropsMapa } from './types';

export default function Mapa({ inicial, actual, alSeleccionar, alEstado }: PropsMapa) {
  const ref = useRef<WebView<object>>(null);
  const [html] = useState(() => crearDocumentoMapa(inicial));
  const [listo, setListo] = useState(false);
  useEffect(() => {
    if (listo && actual) ref.current?.injectJavaScript(`window.mapaEspol.centrarUbicacion(${JSON.stringify(actual)});true;`);
  }, [actual, listo]);
  return <WebView<object>
    ref={ref} source={{ html, baseUrl: 'https://findyp.local/' }} originWhitelist={['*']}
    style={{ flex: 1, backgroundColor: '#E8EAF6' }}
    applicationNameForUserAgent="Findyp/1.0 (+https://github.com/Sam-ai06/Poli-Lost-and-Found)"
    javaScriptEnabled geolocationEnabled={false} cacheEnabled
    onShouldStartLoadWithRequest={request => request.url === 'https://findyp.local/' || request.url === 'about:blank'}
    onError={() => alEstado('error')} onContentProcessDidTerminate={() => alEstado('error')}
    onMessage={event => {
      const mensaje = leerMensajeMapa(event.nativeEvent.data);
      if (!mensaje) return;
      if (mensaje.tipo === 'seleccion') alSeleccionar(mensaje.coordenadas);
      else { if (mensaje.tipo === 'listo') setListo(true); alEstado(mensaje.tipo); }
    }}
  />;
}
