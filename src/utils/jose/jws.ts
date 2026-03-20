import * as jose from 'jose'
import type {KeyObject, CompactJWEHeaderParameters} from 'jose'



type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };
const decodeOp = (encoded: string): string => window.atob(encoded)
function getSigKey() :string{
  let sigKey = "LS0tLS1CRUdJTiBQUklWQVRFIEtFWS0tLS0tCk1JSUV2QUlCQURBTkJna3Foa2lHOXcwQkFRRUZBQVNDQktZd2dnU2lBZ0VBQW9JQkFRQ243NWZkMmwyV0NNMGgKcGNqUUpWUVZyN1UzdW9vLzI3dG9aNHVKbEdVK21ud1kzZE5TNlp5ZzgwMTA4a2ZndHp5V3NjQ1F4Mm1pcEV5awowS2dSNU91MDBna2hQMTJyVjVzeU9zU1dpNWNRcnYveXJBRGZnSUJCYzdtNThiMEVoSTlPeE1CcDdRQXZXcnM1CnNIaDUyU3JxSG1ZZmtTM0J3aVJleURza283OTdvZlRNeENYMk9UeU9mc0lkRnY4MEVyWFUyWGxtQTNabFJPYXcKM055QUxuMytJREdIejJhSDROUVdJeGx6VFFVYVdoQnNGdHZMSkJMa3F5NEZsMjdlcStDTjRpOXcrQVZNaU1zbAp0S1I5V0N4SzBEdUFtZ0ZIOGdkUkVKclZ3Qm82SFcwa3lDVnFZcTRIOW1FaW5KaGVmbnB0TzF2NTc0Ly95VWpxCk0wNTNGdklUQWdNQkFBRUNnZ0VBRVd6V3dtSXdRc0NnQ2FVL25IcTdGUDJraCtkTVdyV1hPN2ZwYm5tZU5jR1IKZ3kwRk5UMjE1RmQxTlRUQjNqWEtkM2ZJaGpLWUtlbWRaWjZjU2RzSjFXWFR6N0RaQWMzaHl4NUxuQWxZNnBZVgo5YktybG9WVUNZdm9wMmJIYmtxK1AwdEN0ekJYSVdnVjN1QmZrb1BFK2F6MDBNSzB6NUxhODVZWUxrUkFEL2tDCkpMeFgvSCt2b1czSFhrYlBuUmFyL1ZEUyt2a1oyY1N4ZC8wbzRnMnVJaCsrZkFFODUzOXdGbFk3bnVHQWN2MjIKUWFjV0hTbUZiU1dEWUdTSHFWVllRMlp2aVlzYjlEMjZ1eXdiY25uNzZCejh6b1oyVDNnYVpsWENjdTh6SVVWdQpCajdsd3BmODZwMk5lUnlmTVJpS2txY2NPekJjSHpjOHc5Qmcwbkp5K1FLQmdRRENZQjJjdERlS2ZvSkJRM1hBCmo1Rmk1YnlOMHc3QVNUTk01Ly9XdUpYeWcwcVczbW1abUpQTmt2V1RNdWJncUh1Zit6WDJjdE9kR3pWTU0wcUYKSENzNDAwUVNON2lXRFpacnlhSmNJUVpQWE52TVZpNHliQ1pPQml6dUc4a3lUTktUMFloNHJmME81UnFJOUFMdAp3RnVwV1FZUnd4OXJuZUxXS3h6V0RDT2xPd0tCZ1FEZExaZi9FODFUTFdReDEySVhWbWo1L1Q1WjlERmNFajlyCmNRKzhtenZhWCtwdVVWZGNRZDFqanBxYkR5OUN2TmRsZDBXTzBZclZXR2xSNnBrb05SSnk0aWF3dnovK09hdGQKM1NEaWhsRU8yZFNtdis5b0F3MHArM2dGYTNFTDR1ZjBOZUdrQ0tJelBRcjJKNXRuMU9DVUNPSGdiNSs1U0ZnQQprNG5SdldRNUNRS0JnRjhyWUZSUmlNQXVvT2dEZDZ3SW4wNmszV1V6YVkyTVNhbm1EY1c4S3U3S2ljTEVzeitaCkRRVWlaMHJqS1ZmbUptRjJSajJjaXkvcEduZHN4WmZXNnZLdnZpeU5TN3RzZTdIYXo3djhEM0xjTEdJbjhBYVEKSFZFbWhPa3dnWm8zTXdOZEhFeTZJNlVmVjVhbW9xaDEvbXMwUTF4L0JPdFVLclJoOTRSMS9SM3hBb0dBR1hDUApGUVhBRGhzZ2RTTWk0ekJMTHNYVUVDQ29OTURjam8wWWxFYitvV1Y2MzJsM3RPTFdoZ2IyL1hMSHF0TnhxdmdICkJpQlA2YTRibnhKdXYxTXJaZzloQjk5WGl2UXpJNzYxYzVpalppUGo4N0lMNVZqRWdObXR1bUhiUk5TNmZUcGQKVTdLeWhWWTJGbzREci9PcVNSeWtibDRvYnZWRk9mdStWR09HVFpFQ2dZQS9oVElZbGtjSEg0eENVeDdNUFFZSQplS2FjdkRIK3RuYm12YWhVQU82SERwaldTeDhMYTZ5cGZLRXE5cmlid09PNHplMlJ1djFOS3FrRTFxK0U0VXhRCjZLUGcwMHdMdW82eEgwUjVlNWZUV1lnOWh2ZmVDbDI1SEg5Unp6KytSdTZzeGZ1Y3dkSDhveHV2ZkZSNXB2ZGIKeEc0YXQ3dGo0K2VhcTQ2Q0hMRis1QT09Ci0tLS0tRU5EIFBSSVZBVEUgS0VZLS0tLS0="
  return decodeOp(sigKey)
}
function getPubKey():string{
  let pubKey = "LS0tLS1CRUdJTiBQVUJMSUMgS0VZLS0tLS0KTUlJQklqQU5CZ2txaGtpRzl3MEJBUUVGQUFPQ0FROEFNSUlCQ2dLQ0FRRUEweGxIeHoyS1ZtejZsTVdES0J0RAp3SWR1eFdZekQ4S0VrYmlFY2JielI2Q3l6clVXZUd1SXA0ZkFzSWhuOWo3eDQreWpVUWtGRCt2QjNKUGordFVkCkcxcndlTGNRSDdBK3FzdTNoUFRhSlJiWE93RzNHWW5QSm5STE15cE5jVjdSM2M1SmdPaU44Yi9ONW9PaGZNZVoKYWRQUXo4QmRTRW5jVWJzUFlhb1FjVitSaHpXRDI1ekdoeHVscTlCT0c0UHo2Q0ZwWHFYK0xNb0JzQ1RWWEJGawo5VTBxNEg3L3pZdXcwblJmYWQwUDJEWnBjbURSYVNic3JId1Z5Wm14K3FoNUFMaWJKOWsxdWlxOUVCRkNLTzlhCncwbVVYYjVHN21uT05SS3ZiR25DRnY0RzQrOGVmZlFPWWlIQ29zZk51dkhXWUd0TkJaQmQ5UDZTYUNndlU0MGYKc3dJREFRQUIKLS0tLS1FTkQgUFVCTElDIEtFWS0tLS0t"
  return decodeOp(pubKey)
}


export async function sigAndEnc(body: object) {
  // 1. sig
  let jwsAlg = decodeOp('UlM1MTI=')
  let sigKeyStr = getSigKey().replace(/\r\n/g, "\n")
  let sigKey = await jose.importPKCS8(sigKeyStr, jwsAlg) as KeyObject

  const CompactSigClass = jose[decodeOp('Q29tcGFjdFNpZ24=')]
  let playload = serializeForPayload(body as JsonValue)
  const siger = new CompactSigClass(
    new TextEncoder().encode(playload)
  )

  siger.setProtectedHeader({ alg: jwsAlg })
  const signMethod = decodeOp('c2lnbg==')
  const sigString = await siger[signMethod](sigKey)

  // 2. enc
  let jweAlg = decodeOp('UlNBLU9BRVAtMjU2')
  let jweEnc = decodeOp('QTI1NkNCQy1IUzUxMg==')
  let pubKeyStr = getPubKey().replace(/\r\n/g, "\n")
  let pubKey = await jose.importSPKI(pubKeyStr, jweAlg).catch((err)=>{console.error(err); throw err}) as KeyObject
  
  const CompactEncClass = jose[decodeOp('Q29tcGFjdEVuY3J5cHQ=')]
  const encer = new CompactEncClass(
    new TextEncoder().encode(JSON.stringify(body))
  )
  encer.setProtectedHeader( {alg: jweAlg, enc: jweEnc} as CompactJWEHeaderParameters )
  const encryptMethod = decodeOp('ZW5jcnlwdA==')
  const encString = await encer[encryptMethod](pubKey)

  return new Promise((resolve, reject) => {
    resolve({
      s: removeMiddlePart(sigString),
      e: encString
    })
  })
}

function serializeForPayload(data: JsonValue): string {
  if (data === null) {
    return 'null';
  }
  if (typeof data === 'string') {
    return data;
  }
  if (typeof data === 'boolean') {
    return data ? 'true' : 'false';
  }
  if (typeof data === 'number') {
    return String(data);
  }
  if (Array.isArray(data)) {
    const elems = data.map(item => serializeForPayload(item));
    return '[' + elems.join(',') + ']';
  }
  if (typeof data === 'object') {
    const keys = Object.keys(data).sort(); // ASCII 排序
    const parts: string[] = [];
    for (const key of keys) {
      parts.push(key + serializeForPayload(data[key]));
    }
    return parts.join('');
  }
  throw new Error(`Unsupported type: ${typeof data}`);
}

function removeMiddlePart(input) {
    const firstDot = input.indexOf('.');
    const lastDot = input.lastIndexOf('.');

    if (firstDot === -1 || firstDot === lastDot || firstDot+1 >= lastDot) {
        return input;
    }
    return input.substring(0, firstDot+1) + input.substring(lastDot);
}