import { randomBytes, scryptSync, createCipheriv, createDecipheriv } from 'node:crypto';

export class ApiKeyHandler {

  protected static async decrypt(hash: string) {

    if (Bun.env.HASH_KEY == undefined) throw new Error('Invalid HASH_KEY');

    const [_hash, _final, _nonce] = hash.split('$');

    const keyBuffer = scryptSync(Bun.env.HASH_KEY, 'salt', 32);

    const nonceBuffer = Buffer.from(_nonce, 'hex');

    const decipher = createDecipheriv('aes-256-cbc', keyBuffer, nonceBuffer);

    const decrypted = decipher.update(_hash + _final, 'hex', 'utf-8');

    return decrypted + decipher.final('utf-8');
  }
  
  public static async generate(payload: string) {

    if (Bun.env.HASH_KEY == undefined) throw new Error('Invalid HASH_KEY');

    if (typeof payload !== 'string') throw new Error('Invalid payload');
    
    const key = scryptSync(Bun.env.HASH_KEY, 'salt', 32);
    
    const nonce = randomBytes(16);

    const cipher = createCipheriv('aes-256-cbc', key, nonce);

    const now = new Date();

    const ttl = now.getTime() + 3_600_000; // 1 hour
    
    const createdAt = now.toISOString();
    
    const _header = {
      ttl, 
      createdAt 
    };

    const body = {
      _header,
      payload
    };

    const encrypted = cipher
      .update(JSON.stringify(body), 'utf8', 'hex')
      .concat(
        '$', cipher.final('hex'), 
        '$', nonce.toString('hex')
      );
    
    return {
      hash: encrypted,
      ttl,
      createdAt
    }
  }


  public static async verify(value: any) {

    if (typeof value !== 'string') {
      return false;
    }

    const separatorsIsValid = value.split('$').length === 3;

    if (separatorsIsValid == false) {
      return false;
    }

    try { 

      const unHash = await this.decrypt(value); 

      const { _header } = JSON.parse(unHash);

      if (Date.now() > _header.ttl) return false;

    } catch (err) { return false; }

    return true;
  }
}