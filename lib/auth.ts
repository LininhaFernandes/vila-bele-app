import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from './db';

const JWT_SECRET = process.env.JWT_SECRET || 'seu-super-secreto-key-change-this-em-producao';

export interface User {
  id: number;
  email: string;
  full_name: string;
  role: 'admin' | 'user';
  created_at: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload extends LoginPayload {
  full_name: string;
}

// Hash password
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

// Verify password
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Create JWT token
export function createToken(user: User): string {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

// Verify JWT token
export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

// Login user
export async function loginUser(email: string, password: string): Promise<{ user: User; token: string } | null> {
  try {
    const result = await query(
      'SELECT id, email, password, full_name, role, created_at FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return null;
    }

    const user = result.rows[0];
    const passwordMatch = await verifyPassword(password, user.password);

    if (!passwordMatch) {
      return null;
    }

    const token = createToken({
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      role: user.role,
      created_at: user.created_at
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        created_at: user.created_at
      },
      token
    };
  } catch (error) {
    console.error('Login error:', error);
    return null;
  }
}

// Register user
export async function registerUser(email: string, password: string, full_name: string): Promise<User | null> {
  try {
    const hashedPassword = await hashPassword(password);

    const result = await query(
      'INSERT INTO users (email, password, full_name, role) VALUES ($1, $2, $3, $4) RETURNING id, email, full_name, role, created_at',
      [email, hashedPassword, full_name, 'user']
    );

    if (result.rows.length === 0) {
      return null;
    }

    return result.rows[0];
  } catch (error) {
    console.error('Register error:', error);
    return null;
  }
}

// Get user by ID
export async function getUserById(id: number): Promise<User | null> {
  try {
    const result = await query(
      'SELECT id, email, full_name, role, created_at FROM users WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return null;
    }

    return result.rows[0];
  } catch (error) {
    console.error('Get user error:', error);
    return null;
  }
}

// Create user (admin only)
export async function createUserAsAdmin(email: string, password: string, full_name: string, role: 'admin' | 'user' = 'user'): Promise<User | null> {
  try {
    const hashedPassword = await hashPassword(password);

    const result = await query(
      'INSERT INTO users (email, password, full_name, role) VALUES ($1, $2, $3, $4) RETURNING id, email, full_name, role, created_at',
      [email, hashedPassword, full_name, role]
    );

    if (result.rows.length === 0) {
      return null;
    }

    return result.rows[0];
  } catch (error) {
    console.error('Create user error:', error);
    return null;
  }
}

// Get all users
export async function getAllUsers(): Promise<User[]> {
  try {
    const result = await query(
      'SELECT id, email, full_name, role, created_at FROM users ORDER BY created_at DESC'
    );

    return result.rows;
  } catch (error) {
    console.error('Get all users error:', error);
    return [];
  }
}
