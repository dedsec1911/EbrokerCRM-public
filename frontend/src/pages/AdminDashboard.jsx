import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '@/App';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { LogOut, Building2, Users, CheckCircle, Clock, ArrowRight } from 'lucide-react';
import PropertyCard from '@/components/PropertyCard';
import Layout from '@/components/Layout';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [stats, setStats] = useState(null);
  const [pendingProperties, setPendingProperties] = useState([]);
  const [allProperties, setAllProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, pendingRes, allRes] = await Promise.all([
        axios.get('/stats'),
        axios.get('/properties?status_filter=pending'),
        axios.get('/properties'),
      ]);
      setStats(statsRes.data);
      setPendingProperties(pendingRes.data);
      setAllProperties(allRes.data);
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Layout>
      <div className="p-4 md:p-8 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2" data-testid="admin-dashboard">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage properties and agents</p>
          </div>
          <Button onClick={handleLogout} variant="outline" data-testid="logout-btn">
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
          <Card className="hover-lift">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Properties</CardTitle>
              <Building2 className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="total-properties-stat">{stats?.total_properties || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">All listings</p>
            </CardContent>
          </Card>

          <Card className="hover-lift">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Approved</CardTitle>
              <CheckCircle className="w-4 h-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600" data-testid="approved-properties-stat">{stats?.approved_properties || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">Live properties</p>
            </CardContent>
          </Card>

          <Card className="hover-lift">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
              <Clock className="w-4 h-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600" data-testid="pending-properties-stat">{stats?.pending_properties || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">Need review</p>
            </CardContent>
          </Card>

          <Card 
            className="hover-lift cursor-pointer hover:shadow-lg transition-all"
            onClick={() => navigate('/admin/agent-lookup')}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Agents</CardTitle>
              <Users className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-end">
                <div>
                  <div className="text-2xl font-bold" data-testid="total-agents-stat">{stats?.total_agents || 0}</div>
                  <p className="text-xs text-muted-foreground mt-1">Active agents</p>
                </div>
                <ArrowRight className="w-5 h-5 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>

        {pendingProperties.length > 0 && (
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Pending Approvals</h2>
              <Badge variant="destructive" data-testid="pending-count-badge">{pendingProperties.length}</Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" data-testid="pending-properties-list">
              {pendingProperties.map((property) => (
                <PropertyCard key={property.id} property={property} onRefresh={fetchDashboardData} />
              ))}
            </div>
          </div>
        )}

        <div>
          <h2 className="text-2xl font-bold mb-4">All Properties</h2>
          {allProperties.length === 0 ? (
            <Card className="p-12 text-center">
              <Building2 className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No properties yet</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" data-testid="all-properties-list">
              {allProperties.map((property) => (
                <PropertyCard key={property.id} property={property} onRefresh={fetchDashboardData} />
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}