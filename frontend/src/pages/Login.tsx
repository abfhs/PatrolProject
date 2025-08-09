import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { Card, Button, Input, Loading } from '../components/ui';
import { useAuth } from '../hooks/useAuth';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading, error } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    // useAuth에서 에러 처리를 모두 담당하므로 try-catch 불필요
    await login({ email, password });
  };

  const handleForgotPassword = () => {
    navigate('/reset-password');
  };

  return (
    <Layout>
      <Card variant="login">
        <h2>Login</h2>
        <form onSubmit={handleSubmit}>
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Button type="submit" disabled={isLoading}>
            Login
          </Button>
          <div style={{ display: 'flex', gap: '0.5rem', flexDirection: 'column' }}>
            <Link to="/register">
              <Button type="button" variant="secondary" style={{ width: '100%' }}>
                Sign Up
              </Button>
            </Link>
            <Button 
              type="button" 
              variant="secondary" 
              onClick={handleForgotPassword}
              style={{ 
                width: '100%',
                background: 'transparent',
                color: 'var(--primary-color)',
                border: '1px solid var(--primary-color)',
                fontSize: '0.9rem'
              }}
            >
              비밀번호를 잊으셨나요?
            </Button>
          </div>
        </form>
        {error && (
          <div style={{ color: 'red', marginTop: '10px', textAlign: 'center' }}>
            {error}
          </div>
        )}
      </Card>
      <Loading show={isLoading} />
    </Layout>
  );
};