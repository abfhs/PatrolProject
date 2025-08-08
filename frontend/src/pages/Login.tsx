import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { Card, Button, Input, Loading } from '../components/ui';
import { useAuth } from '../hooks/useAuth';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading, error } = useAuth();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    // useAuth에서 에러 처리를 모두 담당하므로 try-catch 불필요
    await login({ email, password });
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
          <Link to="/register">
            <Button type="button" variant="secondary">
              Sign Up
            </Button>
          </Link>
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