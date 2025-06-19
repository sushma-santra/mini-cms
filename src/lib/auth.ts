import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'

export interface User {
  id: string
  email: string
  name: string
  role: 'ADMIN' | 'AUTHOR'
}

export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword)
}

const secret = process.env.NEXTAUTH_SECRET || 'fallback-secret-key'

export const generateToken = (email: string): string => {
  return jwt.sign({ email }, secret, { expiresIn: '7d' })
}

export const verifyToken = (token: string): { email: string } | null => {
  try {
    const decoded = jwt.verify(token, secret) as { email: string }
    return decoded
  } catch (error) {
    return null
  }
}

export const requireAuth = async (request: NextRequest) => {
  const authHeader = request.headers.get('authorization')
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('No valid Authorization header found')
  }

  const token = authHeader.substring(7)
  const decoded = verifyToken(token)
  
  if (!decoded) {
    throw new Error('Invalid token')
  }

  const user = await prisma.user.findUnique({
    where: { email: decoded.email }
  })

  if (!user) {
    throw new Error('User not found')
  }

  return user
}

export async function requireAdmin(request: NextRequest) {
  const user = await requireAuth(request)
  if (user.role !== 'ADMIN') {
    throw new Error('Admin access required')
  }
  return user
} 