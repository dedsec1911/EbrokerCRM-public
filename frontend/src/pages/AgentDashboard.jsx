import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '@/App';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Plus, LogOut, Building2, CheckCircle, Clock, TrendingUp } from 'lucide-react';
import PropertyCard from '@/components/PropertyCard';
import Layout from '@/components/Layout';

export default function AgentDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [stats, setStats] = useState(null);
  const [properties, setProperties] = useState([]);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, propertiesRes, leadsRes] = await Promise.all([
        axios.get('/stats'),
        axios.get('/properties'),
        axios.get('/leads'),
      ]);
      setStats(statsRes.data);
      setProperties(propertiesRes.data);
      setLeads(leadsRes.data.slice(0, 5));
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
            <h1 className="text-3xl md:text-4xl font-bold mb-2" data-testid="agent-dashboard">Welcome, {user?.name}</h1>
            <p className="text-muted-foreground">Manage your properties and leads</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => navigate('/add-property')} className="bg-vibrant hover:bg-vibrant/90" data-testid="add-property-btn">
              <Plus className="w-4 h-4 mr-2" />
              Add Property
            </Button>
            <Button onClick={handleLogout} variant="outline" data-testid="logout-btn">
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
          <Card className="hover-lift">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Properties</CardTitle>
              <Building2 className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="total-properties-stat">{stats?.total_properties || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">All your listings</p>
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
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="w-4 h-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600" data-testid="pending-properties-stat">{stats?.pending_properties || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">Awaiting approval</p>
            </CardContent>
          </Card>

          <Card className="hover-lift">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
              <TrendingUp className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="total-leads-stat">{stats?.total_leads || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">Client inquiries</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">My Properties</h2>
            </div>
            {properties.length === 0 ? (
              <Card className="p-12 text-center">
                <Building2 className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground mb-4">No properties yet</p>
                <Button onClick={() => navigate('/add-property')} className="bg-vibrant hover:bg-vibrant/90">
                  Add Your First Property
                </Button>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4" data-testid="properties-list">
                {properties.map((property) => (
                  <PropertyCard key={property.id} property={property} onRefresh={fetchDashboardData} />
                ))}
              </div>
            )}
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4">Recent Leads</h2>
            {leads.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">No leads yet</p>
              </Card>
            ) : (
              <div className="space-y-3" data-testid="leads-list">
                {leads.map((lead) => (
                  <Card key={lead.id} className="p-4">
                    <h3 className="font-semibold">{lead.client_name}</h3>
                    <p className="text-sm text-muted-foreground">{lead.client_phone}</p>
                    <p className="text-xs text-muted-foreground mt-2">{lead.requirements}</p>
                  </Card>
                ))}
                {leads.length > 0 && (
                  <Button onClick={() => navigate('/leads')} variant="outline" className="w-full">
                    View All Leads
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}