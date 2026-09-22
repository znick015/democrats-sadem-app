export interface PhoneLocalesEvent {
  type: 'united:phone:locales';
  requestId?: string | null;
  languageUi: string;
  languageChat: string;
  uiLocale: string;
  chatLocale: string;
}

export interface PhoneViewportEvent {
  type: 'united:phone:viewport';
  requestId?: string | null;
  width: number;
  height: number;
  scale: number;
  layoutWidth: number;
}

export interface BridgeResponse<T = Record<string, unknown>> {
  type: string;
  requestId: string;
  ok?: boolean;
  error?: string;
  capability?: string;
  [key: string]: unknown;
}

export function phoneBridge<T = BridgeResponse>(type: string, payload: Record<string, unknown> = {}): Promise<T> {
  const requestId = crypto.randomUUID();
  return new Promise((resolve) => {
    function onMessage(event: MessageEvent) {
      const data = event.data;
      if (!data || data.requestId !== requestId) return;
      window.removeEventListener('message', onMessage);
      resolve(data as T);
    }
    window.addEventListener('message', onMessage);
    window.parent.postMessage({ type, requestId, ...payload }, '*');
  });
}

export const bridgeApi = {
  getLocales: () => phoneBridge<PhoneLocalesEvent>('united:phone:getLocales'),
  getViewport: () => phoneBridge<PhoneViewportEvent>('united:phone:getViewport'),
  getTheme: () => phoneBridge<{ type: string; ok: boolean; theme: string }>('united:phone:getTheme'),
  openPay: (transactionId: string) => 
    phoneBridge<{ type: string; ok: boolean; id?: string; error?: string }>('united:ifruit:openPay', { id: transactionId }),
  setWaypoint: (x: number, y: number) =>
    phoneBridge<{ type: string; ok: boolean; error?: string }>('united:phone:setWaypoint', { x, y }),
  copyText: (text: string) =>
    phoneBridge<{ type: string; ok: boolean; error?: string }>('united:phone:copyText', { text }),
  showNotification: (title: string, body: string) =>
    phoneBridge<{ type: string; ok: boolean; delivered?: number; error?: string }>('united:phone:showNotification', { title, body })
};