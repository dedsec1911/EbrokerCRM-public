import React, { useState } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function AdminSetup() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: 'Admin',
    email: 'admin@estateflow.com',
    phone: '9876543210',
    password: 'Admin@123',
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post('/auth/register-admin', {
        ...formData,
        role: 'admin',
      });

      toast.success('Admin account created successfully!');
      console.log('Admin created:', response.data);
      
      // Store token if needed
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }

      // Reset form
      setFormData({
        name: 'Admin',
        email: 'admin@estateflow.com',
        phone: '9876543210',
        password: 'Admin@123',
      });
    } catch (error) {
      const errorMsg = error.response?.data?.detail || 'Failed to create admin account';
      toast.error(errorMsg);
      console.error('Error:', error.response?.data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">Admin Setup</CardTitle>
          <p className="text-sm text-gray-600 text-center mt-2">
            Create the first admin account for your system
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Admin Name</Label>
              <Input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Enter admin name"
              />
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="Enter email"
              />
            </div>

            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                required
                placeholder="Enter phone number"
              />
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Enter strong password"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Creating Admin...' : 'Create Admin Account'}
            </Button>
          </form>

          <div className="mt-6 p-3 bg-blue-50 rounded text-sm text-gray-700">
            <p className="font-semibold mb-2">📝 Important:</p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li>Only ONE admin can be created</li>
              <li>Save these credentials securely</li>
              <li>After creation, login with this account</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
