// server/generateToken.js

import jwt from 'jsonwebtoken';

// 設定 Token 的預設過期時間，課程範例為 '2h' (2 hours)
const EXPIRES_IN = '2h'; 

/**
 * 使用 jwt.sign 同步簽發 JsonWebToken
 * @param {object} user - 包含 _id, email, role 的使用者物件
 * @returns {string} - 簽發成功的 JWT 字串
 */
export function generateToken(user) {
  // 1. 構建 Payload
  const payload = {
    // sub (Subject): 建議用來存放唯一的識別碼，這裡使用 MongoDB 的 _id
    sub: user._id?.toString?.() ?? user.id, 
    email: user.email,
    role: user.role
  };

  // 2. 執行簽發 (jwt.sign(payload, secretOrPrivateKey, [options]))
  // - process.env.JWT_SECRET 是 HMAC 演算法的密鑰
  // - { expiresIn: EXPIRES_IN } 設定了 'exp' (Expiration Time) Claim
  return jwt.sign(
    payload,
    process.env.JWT_SECRET, // 密鑰 (SecretOrPrivateKey)
    { expiresIn: EXPIRES_IN } // Options: 設定過期時間
  );
}c