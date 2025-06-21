import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { body, validationResult } from 'express-validator';
import { supabase } from '../utils/supabase';
import { generateToken } from '../utils/jwt';
import { authenticateToken } from '../middleware/auth';
import cuid from 'cuid';

const router = Router();

// Validation middleware
const validateSignup = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('name').trim().isLength({ min: 2 }),
];

const validateLogin = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
];

// Signup
router.post('/signup', validateSignup, async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, name } = req.body;

    console.log('Attempting to create user:', { email, name });

    // Check if user already exists
    const { data: existingUser, error: findError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (findError && findError.code !== 'PGRST116') { // PGRST116 is "not found" error
      console.error('Error checking existing user:', findError);
      return res.status(500).json({ error: 'Database error' });
    }

    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    console.log('Creating user with hashed password');

    // Create user
    const { data: user, error: createError } = await supabase
      .from('users')
      .insert({
        id: cuid(),
        email,
        passwordHash: passwordHash,
        name,
        isRenter: true,
        isSeller: false,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .select()
      .single();

    if (createError) {
      console.error('Supabase error creating user:', createError);
      return res.status(500).json({ error: 'Database error: ' + createError.message });
    }

    if (!user) {
      console.error('No user returned from creation');
      return res.status(500).json({ error: 'Failed to create user' });
    }

    console.log('User created successfully:', user.id);

    // Generate token
    const token = generateToken({
      userId: user.id,
      email: user.email
    });

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        isRenter: user.isRenter,
        isSeller: user.isSeller
      }
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Login
router.post('/login', validateLogin, async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Find user
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate token
    const token = generateToken({
      userId: user.id,
      email: user.email
    });

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        isRenter: user.isRenter,
        isSeller: user.isSeller
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get current user profile
router.get('/profile', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, name, isRenter, isSeller, createdAt')
      .eq('id', req.user!.userId)
      .single();

    if (error || !user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ 
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        isRenter: user.isRenter,
        isSeller: user.isSeller,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update user profile
router.put('/profile', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { name, isRenter, isSeller } = req.body;

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (isRenter !== undefined) updateData.isRenter = isRenter;
    if (isSeller !== undefined) updateData.isSeller = isSeller;

    const { data: user, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', req.user!.userId)
      .select('id, email, name, isRenter, isSeller, createdAt')
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({ error: 'Database error' });
    }

    res.json({ 
      message: 'Profile updated successfully',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        isRenter: user.isRenter,
        isSeller: user.isSeller,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router; 