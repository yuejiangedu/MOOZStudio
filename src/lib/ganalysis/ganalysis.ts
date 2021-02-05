
const isDevelopment = process.env.NODE_ENV === 'development';

// @param  parameter { 'client_id':string,
//                     'event_category': string,
//                     'event_value': number,
//                     'application_version': string,
//                     'application_name': string
//                     'hit_type':string  }
export const buryevent = (eventName: string, parameter?: { [index: string]: string | number | boolean }) => {
  if (!parameter) {
    parameter = {};
  }
  if (isDevelopment) {
    parameter.isDev = isDevelopment;
  }
  parameter.hit_type = 'event';
  const generateCId = localStorage.getItem('client_id');
  window.gtag('set', { 'client_id': generateCId, 'application_version': 'v2.3.2', 'application_name': 'MOOZ Studio' });
  window.gtag('event', eventName, parameter);
};

// @param  parameter { 'client_id':string,
//                     'application_version': string,
//                     'application_name': string
//                     'hit_type':string
//                     'page_path': string }
export const burypageview = (parameter?: { [index: string]: string | number | boolean }) => {
  if (!parameter) {
    parameter = {};
  }
  if (isDevelopment) {
    parameter.isDev = isDevelopment;
  }
  parameter.hit_type = 'pageview';
  const generateCId = localStorage.getItem('client_id');
  if (isDevelopment) {
    window.gtag('set', { 'client_id': generateCId, 'application_version': 'v2.3.2', 'application_name': 'MOOZ Studio' });
    window.gtag('config', 'UA-180252461-1', parameter);
  } else {
    window.gtag('config', 'UA-180252461-1', parameter);
  }
};
