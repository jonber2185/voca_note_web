const getBrowserType = () => {
  const ua = navigator.userAgent.toLowerCase();

  if (/iphone|ipad|ipod/.test(ua)) return 'IOS';
  if (/android/.test(ua)) return 'ANDROID';
  if (ua.includes('chrome') && !ua.includes('edg') && !ua.includes('opr')) return 'CHROME';
  if (ua.includes('safari') && !ua.includes('chrome')) return 'SAFARI';

  return 'UNKNOWN';
};

export const getDeviceId = () => {
  let deviceId = localStorage.getItem('device_id');
  return deviceId
}

export const getOrSetDeviceId = () => {
  let deviceId = localStorage.getItem('device_id');

  if (!deviceId) {
    const prefix = getBrowserType();
    const fullUuid = crypto.randomUUID().replace(/-/g, '').toUpperCase();
    const shortUuid = fullUuid.slice(0, 8);

    deviceId = `${prefix}-${shortUuid}`;
    localStorage.setItem('device_id', deviceId);
  }

  return deviceId;
}