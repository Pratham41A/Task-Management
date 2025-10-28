import xss from 'xss';

export function sanitize(input){

      if (typeof input === 'string') return xss(input);
  if (Array.isArray(input)) return input.map(val => sanitize(val));
  if (input !== null && input !== undefined && typeof input === 'object') {
for(const key in input){
    input[key]=sanitize(input[key]);
}
return input
  }
  return input;
} 