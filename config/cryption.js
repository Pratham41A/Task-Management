import CryptoJS from "crypto-js";
export  function encrypt(value,SECRET_KEY){
value = CryptoJS.AES.encrypt(value, SECRET_KEY)
return value
}
export function decrypt(value,SECRET_KEY){
  value=CryptoJS.AES.decrypt(value, SECRET_KEY);
  value = value.toString(CryptoJS.enc.Utf8);//Human Readable Form
  return value;
}