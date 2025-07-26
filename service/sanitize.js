import xss from 'xss';

export function sanitize(input){

      if (typeof input === 'string') return xss(input);
  if (Array.isArray(input)) return input.map(sanitize);
  if (input !== null && typeof input === 'object') {
for(var key in input){
    input[key]=sanitize(input[key]);
}
return input
  }
  return input;
} 