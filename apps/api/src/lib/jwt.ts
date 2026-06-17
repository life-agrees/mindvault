import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET!;

export type JWTPayload = {
  userId: string;
  privyDid: string;
};

export function signToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): JWTPayload {
  return jwt.verify(token, JWT_SECRET) as JWTPayload;
}
